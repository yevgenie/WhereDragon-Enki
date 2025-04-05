import { Message, TextChannel } from "discord.js";
import { extractValidWindowsFromProcessCommand, getMessageData, getPopWindowFromProcessCommand } from "../utils/channelUtils"
import { channelMessagesToWindows } from "../utils/channelToDKP"
import { MessageWithDisplayName } from "../types/MessageData"
import { writeToDKPEntrySheetBasic } from "../sheets";

export const name = "process"
export const description = "Processes the DKP from message data."
export const execute = async (message: Message) => {
    const isClaimed = message.content.includes("claimed");
    const popWindow = message.content.includes("pop")
        ? getPopWindowFromProcessCommand(message.content)
        : undefined;

    const validTiamatWindows = message.content.includes("valid")
        ? extractValidWindowsFromProcessCommand(message.content)
        : undefined;

    try {
        const channel = message.channel as TextChannel;
        const allMessagesData: MessageWithDisplayName[] = await getMessageData(channel);

        const { windowsPerMember, enkiResponse } = channelMessagesToWindows(
            {
                ...message.channel,
                messages: allMessagesData
            } as TextChannel & { messages: Message[] },
            popWindow,
            validTiamatWindows
        );

        if (message.channel instanceof TextChannel) {
            await writeToDKPEntrySheetBasic(
                message.channel.name,
                windowsPerMember,
                isClaimed
            );
            await message.channel.send(enkiResponse);
        } else {
            // WARN: This is likely not good practice since we will delete commands
            // but maybe we can delete commands after run time. A better option 
            // would be to DM the user.
            message.reply("This command cannot be executed in this type of channel.");
        }

    } catch (error) {
        if (message.channel instanceof TextChannel) {
            console.error("Error fetching messages:", error);
            await message.channel.send("Error fetching messages.");
        }
    }
}
