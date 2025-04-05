import { Channel, Collection, Message, TextChannel } from "discord.js";
import { getNextTenMinuteInterval, getWindowNumber, parseDiscordTimestamp } from "../utils/utils"
import * as cron from "node-cron";
import { ClientWithCommands } from "../types/ClientWithCommands";
import { MessageWithDisplayName } from "../types/MessageData";
import { FormatedHnmTimer, HnmTimerData } from "../types/HnmTimerData";
import { parseTime } from "./timeUtils";
import { chAutoTimers } from "../config.json";
import { mods } from "../types/Mod";

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

export async function sendNextCamp(message: Message): Promise<void> {
    const client: ClientWithCommands = message.client

    if (client.lastPopChannel) {
        const channelId = message.channel.id;
        const guildId = message.guild?.id;
        const messageId = message.id;
        const messageLink = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

        if (client.lastPopChannel instanceof TextChannel) {
            await client.lastPopChannel.send(`Here's the link to the next POP: ${messageLink}`);
        }
    }

    client.lastPopChannel = message.channel;
}


// Alise functionality
export async function getChannelName(client: ClientWithCommands, channelId: string): Promise<string | null> {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel instanceof TextChannel) {
            const channelName: string = channel.name;
            return channelName;
        }
    } catch (error) {
        console.error(`[ERROR] Failed to fetch channel ${channelId}:`, error);
    }
    return null;
}

export async function processHNM(message: Message, hnmTimerData: HnmTimerData) {
    const client: ClientWithCommands = message.client;
    const channel = await client.channels.fetch(chAutoTimers);
    hnmTimerData.day++;

    const hnmTimer: string = formatTimer(hnmTimerData);

    if (channel instanceof TextChannel && hnmTimerData.isValid) {
        await removeTimer(channel, hnmTimerData.name);
        await addTimer(channel, hnmTimer);
    }

    if (!hnmTimerData.isValid && hnmTimerData.reason) {
        message.reply(hnmTimerData.reason);
        console.log(`[HNM     ] ${hnmTimerData.reason}`);
    }
}

function formatTimer(hnmTimerData: HnmTimerData) {
    const utcTimeStamp = parseTime(hnmTimerData);
    const formatedHnmTimer: FormatedHnmTimer = {
        name: hnmTimerData.name,
        hqName: "",
        emoji: hnmTimerData.hnmData.timerFormat,
        mod: mods[hnmTimerData.mod],
        formatedTimer: ""
    }

    // TODO: Implement mods and emoji formating.
    // Convert this to a custom type: FormatedTimer
    if (hnmTimerData.hnmData.isKing && hnmTimerData.day <= 4) {
        // 1-4 Kings
        formatedHnmTimer.formatedTimer = `- ${formatedHnmTimer.name} ` +
            `${formatedHnmTimer.mod}${formatedHnmTimer.emoji}${formatedHnmTimer.mod}` +
            ` (**${hnmTimerData.day}**) ` + `: <t:${utcTimeStamp}:T> <t:${utcTimeStamp}:R>`
    } else if (hnmTimerData.hnmData.isKing && hnmTimerData.day >= 4) {
        // 5+ Kings HQ
        if (typeof hnmTimerData.hnmData.hq == "string") {
            formatedHnmTimer.hqName = hnmTimerData.hnmData.hq;
        }
        formatedHnmTimer.formatedTimer = `- ${formatedHnmTimer.name}/${formatedHnmTimer.hqName} ` +
            `${formatedHnmTimer.mod}${formatedHnmTimer.emoji}${formatedHnmTimer.mod}` +
            ` (**${hnmTimerData.day}**) ` + `: <t:${utcTimeStamp}:T> <t:${utcTimeStamp}:R>`
    } else {
        // All other hnm's
        formatedHnmTimer.formatedTimer = `- ${formatedHnmTimer.name} ` +
            `${formatedHnmTimer.mod}${formatedHnmTimer.emoji}${formatedHnmTimer.mod}` +
            `: <t:${utcTimeStamp}:T> <t:${utcTimeStamp}:R>`
    }

    return formatedHnmTimer.formatedTimer;
}

async function removeTimer(channel: TextChannel, hnmName: string) {
    const messages = await channel.messages.fetch();

    if (messages) {
        messages.forEach((message) => {
            if (message.content.startsWith(`- ${hnmName}`)) {
                message.delete();
            }
        });
    }
}
async function addTimer(channel: TextChannel, hnmTimer: string) {
    await channel.send(hnmTimer);
}

