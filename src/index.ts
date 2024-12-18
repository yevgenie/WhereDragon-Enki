import {
  Attachment,
  Channel,
  Client,
  Collection,
  GatewayIntentBits,
  Message,
  NewsChannel,
  TextChannel,
} from "discord.js";
import * as dotenv from "dotenv";
import { writeFile } from "fs";
import { writeToDKPEntrySheetBasic } from "./sheets";
import { channelMessagesToWindows } from "./helpers/channelToDKP";
import { watchChatLogsForTods } from "./tod-watcher";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Enable guild-related events
    GatewayIntentBits.GuildMessages, // Enable message-related events in guilds
    GatewayIntentBits.GuildMessageTyping, // Enable typing events in guilds
    GatewayIntentBits.GuildMessageReactions, // Enable reaction events in guilds
    GatewayIntentBits.GuildPresences, // Enable presence events for guild members
    GatewayIntentBits.GuildMembers, // Enable member-related events
    GatewayIntentBits.GuildVoiceStates, // Enable voice state events for guild members
    GatewayIntentBits.GuildIntegrations, // Enable integration events
    GatewayIntentBits.GuildWebhooks, // Enable webhook events
    GatewayIntentBits.DirectMessages, // Enable direct message events
    GatewayIntentBits.DirectMessageReactions, // Enable reaction events in direct messages
    GatewayIntentBits.DirectMessageTyping, // Enable typing events in direct messages
    GatewayIntentBits.MessageContent, // Enable access to message content
  ],
});

client.once("ready", () => {
  console.log("Bot is online!");
});

let lastPopChannel: any | null = null;

client.on("messageCreate", async (message: any) => {
  if (
    (message.author.bot && message.content.includes("DKP Review")) ||
    message.content.indexOf("!next") === 0
  ) {
    if (lastPopChannel) {
      const channelId = message.channel.id;
      const guildId = message.guild?.id;
      const messageId = message.id;
      const messageLink = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

      lastPopChannel.send(`Here's the link to the next POP: ${messageLink}`);
    }

    lastPopChannel = message.channel;
  }

  if (message.author.bot) return; // Ignore bot messages

  if (
    message.content.indexOf("!process") === 0 ||
    message.content.indexOf("!save") === 0
  ) {
    const isClaimed = message.content.includes("claimed");
    const popWindow = message.content.includes("pop")
      ? getPopWindowFromProcessCommand(message.content)
      : undefined;

    const validTiamatWindows = message.content.includes("valid")
      ? extractValidWindowsFromProcessCommand(message.content)
      : undefined;

    try {
      // Get the channel where the command was sent
      const channel = message.channel as TextChannel;

      const allMessages: Message[] = [];

      let lastMessageId;

      // Fetch messages in batches
      while (true) {
        const fetchedMessages: Collection<string, Message> =
          await channel.messages.fetch({
            limit: 100,
            before: lastMessageId,
          });

        // If no messages are fetched, break the loop
        if (fetchedMessages.size === 0) break;

        allMessages.push(...[...fetchedMessages.values()]);
        lastMessageId = fetchedMessages.last()?.id; // Update the lastMessageId to the last fetched message
      }

      const allMessagesData: any[] = [];
      await allMessages.reverse().forEach(async (msg) => {
        const { createdTimestamp, author, content, member } = msg;
        const { nickname: memberName, displayName: memberDisplayName } =
          member ?? {};

        allMessagesData.push({
          ...msg,
          memberDisplayName,
          createdTimestamp,
          author,
          content,
        });
      });

      const { windowsPerMember, enkiResponse } = channelMessagesToWindows(
        {
          ...message.channel,
          messages: allMessagesData,
        } as TextChannel & { messages: Message[]; send: any },
        popWindow,
        validTiamatWindows
      );

      if (message.content.indexOf("!save") === 0) {
        await writeToJSONFile(
          {
            ...message.channel,
            messages: allMessagesData,
          },
          channel.name + ".json"
        );
        message.channel.send("Saved.");
      } else {
        if (
          message.channel instanceof TextChannel ||
          message.channel instanceof NewsChannel
        ) {
          await writeToDKPEntrySheetBasic(
            message.channel.name,
            windowsPerMember,
            isClaimed
          );
          message.channel.send(enkiResponse);
        } else {
          message.channel.send(
            "This command cannot be executed in this type of channel."
          );
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.channel.send("Error fetching messages.");
    }
  }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(TOKEN);

export const writeToJSONFile = (
  object: any,
  filePath = "./test_output.json"
) => {
  writeFile(filePath, JSON.stringify(object, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("JSON file has been saved:", filePath);
    }
  });
};

function getPopWindowFromProcessCommand(str: string) {
  const regex = /pop:(\d+)/;
  const match = str.match(regex);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  } else {
    return undefined;
  }
}

export function extractValidWindowsFromProcessCommand(
  str: string
): number[] | undefined {
  const regex = /^\s*!process(?:\s+.*)?\s+valid-((?:\d+-)*\d+)\s*$/;
  const match = str.match(regex);

  if (match && match[1]) {
    const numbers = match[1].split("-").map(Number);
    if (numbers.length > 0) {
      return numbers;
    }
  }
  return undefined;
}

watchChatLogsForTods();
