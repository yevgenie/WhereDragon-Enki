import { Message, TextChannel } from "discord.js";
import { parseDiscordTimestamp } from "../utils/utils"
import { scheduleWindowMessages } from "../utils/channelUtils"
import { ClientWithCommands } from "../types/ClientWithCommands";

export const name = "debug"
export const description = "Debugger!"
export const execute = (message: Message) => {
    const client: ClientWithCommands = message.client
    if (message.author.bot) return; // Ignore bot messages
    if (message.channel instanceof TextChannel && message.channel.topic !== null) {
        console.log("DEBUG:", message.channel.topic);
        console.log(parseDiscordTimestamp(message.channel.topic));
    }
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
            scheduleWindowMessages(message.channel.id, client);
        }
    }
}
