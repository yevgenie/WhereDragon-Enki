import {
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
import {
  getNextTenMinuteInterval,
  getWindowNumber,
  parseDiscordTimestamp,
} from "./helpers/utils";
import * as cron from "node-cron";

dotenv.config();

// Map to store cron jobs per channel ID
const channelCronJobs: Map<string, cron.ScheduledTask[]> = new Map();

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

client.on("channelCreate", (channel: Channel) => {
  if (channel instanceof TextChannel) {
    if (!channel.topic) return false;
    const timestampRegex = /^<t:\d+:[TRdDfFt]>$/;
    if (timestampRegex.test(channel.topic.trim())) {
      console.log("SCHEDULING CRON FOR CHANNEL:", channel.name, channel.id);
      scheduleWindowMessages(channel.id);
    }
  }
});

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
  if (message.content.indexOf("!debug") === 0) {
    console.log("DEBUG:", message.channel.topic);
    console.log(parseDiscordTimestamp(message.channel.topic));
    if (message.channel instanceof TextChannel) {
      if (!message.channel.topic) return false;
      const timestampRegex = /^<t:\d+:[TRdDfFt]>( <t:\d+:[TRdDfFt]>)?$/;

      const trimmedTopic = message.channel.topic.trim();
      console.log(`Trimmed topic: "${trimmedTopic}"`); // See what’s being tested
      if (trimmedTopic === "") {
        console.log("Topic is empty after trimming.");
      } else if (timestampRegex.test(trimmedTopic)) {
        console.log("Topic matches the Discord timestamp format!");
      } else {
        console.log("Topic does NOT match the Discord timestamp format.");
      }

      if (timestampRegex.test(message.channel.topic.trim())) {
        console.log(
          "SCHEDULING CRON FOR CHANNEL:",
          message.channel.name,
          message.channel.id
        );
        scheduleWindowMessages(message.channel.id);
      }
    }
  }

  // if (message.content === "!pop" && message.channel instanceof TextChannel) {
  //   cancelCronJobs(message.channel.id);
  //   await message.channel.send("----------------- POP -----------------");
  //   await message.channel.send("Moving channel for dkp review in 5 minutes.");
  // }

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

async function scheduleWindowMessages(channelId: string) {
  // TODO: doesn't work yet, WIP
  const channel = (await client.channels.fetch(channelId)) as TextChannel;

  if (!channel || !channel.topic) {
    console.error("Channel not found or no topic set.");
    return;
  }

  const startTime = parseDiscordTimestamp(channel.topic);
  if (!startTime) {
    console.error("Invalid timestamp in channel topic.");
    return;
  }

  const now = new Date();
  let firstRunTime: Date;

  if (now < startTime) {
    console.log("Now < startTime");
    firstRunTime = startTime;
  } else {
    console.log("Now > startTime");
    firstRunTime = getNextTenMinuteInterval(startTime, now);
  }

  const delayMs = firstRunTime.getTime() - now.getTime();
  console.log({ delayMs, firstRunTime, startTime, now });

  // Function to run the task and schedule subsequent runs
  const runTask = () => {
    const task = cron.schedule(
      "0 */10 * * * *", // Every 10 minutes on the minute (e.g., 14:00, 14:10)
      () => {
        const now = new Date();
        const windowNumber = getWindowNumber(startTime, now);
        const message = `----------------------- Window ${windowNumber} -----------------------`;
        channel
          .send(message)
          .then(() =>
            console.log(`Posted window ${windowNumber} at ${now.toISOString()}`)
          )
          .catch(console.error);
      },
      {
        timezone: "UTC",
      }
    );

    // Store the cron job
    const existingJobs = channelCronJobs.get(channel.id) || [];
    existingJobs.push(task);
    channelCronJobs.set(channel.id, existingJobs);

    task.start();
  };

  // Schedule the first run with a delay if needed
  if (delayMs > 0) {
    console.log(
      `Waiting ${delayMs}ms until ${firstRunTime.toISOString()} to start task for channel ${channelId}`
    );
    setTimeout(runTask, delayMs);
  } else {
    // If no delay (already at or past firstRunTime), start immediately
    console.log(
      `Starting task immediately for channel ${channelId} at ${firstRunTime.toISOString()}`
    );
    runTask();
  }
}

function cancelCronJobs(channelId: string) {
  const jobs = channelCronJobs.get(channelId);
  if (jobs && jobs.length > 0) {
    jobs.forEach((job) => job.stop());
    channelCronJobs.delete(channelId); // Clear the jobs from the map
    console.log(`Cancelled all cron jobs for channel ${channelId}`);
  } else {
    console.log(`No cron jobs found for channel ${channelId}`);
  }
}
