import { Channel, Collection, Message, TextChannel } from "discord.js";
import { getNextTenMinuteInterval, getWindowNumber, parseDiscordTimestamp } from "../utils/utils"
import * as cron from "node-cron";
import { ClientWithCommands } from "../types/ClientWithCommands";
import { MessageData, MessageWithDisplayName } from "../types/MessageData";

export function getLastPopChannel(): Channel | null { return null; }

// WARN: channelCronJobs probably doesn't belong here but its the only use currently
export const channelCronJobs: Map<string, cron.ScheduledTask[]> = new Map();

export async function scheduleWindowMessages(channelId: string, client: ClientWithCommands) {
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

export function extractValidWindowsFromProcessCommand(str: string): number[] | undefined {
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

export function getPopWindowFromProcessCommand(str: string) {
    const regex = /pop:(\d+)/;
    const match = str.match(regex);

    if (match && match[1]) {
        return parseInt(match[1], 10);
    } else {
        return undefined;
    }
}

export async function getMessageData(channel: TextChannel): Promise<MessageWithDisplayName[]> {
    const allMessages: Message[] = [];
    const allMessagesData: MessageWithDisplayName[] = [];
    let lastMessageId: string | undefined;

    while (true) {
        const fetchedMessages: Collection<string, Message> = await channel.messages.fetch({
            limit: 100,
            before: lastMessageId,
        });

        if (fetchedMessages.size === 0) break;

        allMessages.push(...fetchedMessages.values());
        lastMessageId = fetchedMessages.last()?.id;
    }

    for (const msg of allMessages.reverse()) {
        const { createdTimestamp, author, content, member } = msg;
        const memberDisplayName = member?.displayName ?? "Unknown";

        allMessagesData.push({
            ...msg,
            memberDisplayName,
            createdTimestamp,
            author,
            content,
        } as MessageWithDisplayName);
    }

    return allMessagesData;
}

export function sendNextCamp(message: Message): void {
    const client: ClientWithCommands = message.client

    if (client.lastPopChannel) {
        const channelId = message.channel.id;
        const guildId = message.guild?.id;
        const messageId = message.id;
        const messageLink = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

        if (client.lastPopChannel instanceof TextChannel) {
            client.lastPopChannel.send(`Here's the link to the next POP: ${messageLink}`);
        }
    }

    client.lastPopChannel = message.channel;
}
