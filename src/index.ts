import {
  Attachment,
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

import fs from "fs";
import path from "path";
dotenv.config();

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

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

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
function isOlderThanThreeHours(message: Message) {
  return Date.now() - message.createdTimestamp > THREE_HOURS_MS;
}

function isImageOnlyMessage(message: Message): boolean {
  // Check for attachments and ensure message content is empty or just whitespace
  return message.attachments.size > 0 && message.content.trim() === "";
}

async function fetchData(fileUrl: string) {
  const { default: fetch } = await import("node-fetch");
  // Now you can use fetch
  const response = await fetch(fileUrl);
  return response.json();
}

async function downloadAttachment(
  attachment: Attachment,
  folderPath: string
): Promise<void> {
  const fileUrl = attachment.url;
  const fileName = `${Date.now()}_${attachment.name || "image"}`;

  const response: any = await fetchData(fileUrl);
  const fileStream = fs.createWriteStream(path.join(folderPath, fileName));

  return new Promise((resolve, reject) => {
    response.body?.pipe(fileStream);
    response.body?.on("error", reject);
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  if (message.content.indexOf("!are you here?") === 0) {
    message.channel.send("Yes");
  }
  let attachmentCount = 0;
  if (message.content.indexOf("!meme dl") === 0) {
    try {
      const channel = message.channel as TextChannel;
      let lastMessageId;

      while (true) {
        const fetchedMessages: Collection<string, Message> =
          await channel.messages.fetch({
            limit: 100,
            before: lastMessageId,
          });

        console.log("Fetched 100...");

        for (const message of fetchedMessages.values()) {
          if (isImageOnlyMessage(message)) {
            attachmentCount++;
            for (const [, attachment] of message.attachments) {
              if (
                attachment.contentType &&
                attachment.contentType.startsWith("image/")
              ) {
                try {
                  await downloadAttachment(attachment, "../../downloads");
                  console.log(`Downloaded: ${attachment.name}`);
                } catch (error) {
                  console.error(
                    `Failed to download ${attachment.name}:`,
                    error
                  );
                }
              }
            }
          }
          if (isOlderThanThreeHours(message)) {
            console.log("Stopping fetch: Message is older than 3 hours");
            return; // Exit the function when we hit a message older than 3 hours
          }
          if (fetchedMessages.size === 0) break;
          lastMessageId = fetchedMessages.last()?.id;
        }
      }
    } catch (error) {
      message.channel.send("Error fetching memes.");
    }
    console.log(`Found ${attachmentCount} memes from the last 3 hours.`);
    // message.channel.send(
    //   `Found ${attachmentCount} memes from the last 3 hours.`
    // );
  }

  if (message.content.indexOf("!process") === 0) {
    const isClaimed = message.content.includes("claimed");
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

      // await writeToJSONFile({ ...channel, messages: allMessages });

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

      // await writeToJSONFile({
      //   ...message.channel,
      //   messages: allMessagesData,
      // });

      const windowsPerMember = channelMessagesToWindows({
        ...message.channel,
        messages: allMessagesData,
      } as TextChannel & { messages: Message[] });

      // await writeToJSONFile(parsed);

      if (
        message.channel instanceof TextChannel ||
        message.channel instanceof NewsChannel
      ) {
        await writeToDKPEntrySheetBasic(
          message.channel.name,
          windowsPerMember,
          isClaimed
        );
      } else {
        message.channel.send(
          "This command cannot be executed in this type of channel."
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.channel.send("Error fetching messages.");
    }
  }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(TOKEN);

// Channel Name
// HNM Target
// DKP Process Date (now?)
// Window Points (depends on Target)

// Player Names
// Claim+Kill | Kill | Window Points

// Specify the file path
const filePath = "./test_output.json";

// Convert the object to a JSON string

// const jsonString = JSON.stringify(myObject, null, 2); // Pretty print with 2 spaces

const writeToJSONFile = (object: any) => {
  writeFile(filePath, JSON.stringify(object, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("JSON file has been saved:", filePath);
    }
  });
};
