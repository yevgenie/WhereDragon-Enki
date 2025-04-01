import { Message, TextChannel } from "discord.js";
import { writeToJSONFile } from "../utils/fileUtils"
import { MessageWithDisplayName } from "../types/MessageData";
import { getMessageData } from "../utils/channelUtils";

export const name = "save"
export const description = "Exports the message data to JSON."
export const execute = async (message: Message) => {
    const channel = message.channel as TextChannel;
    const allMessagesData: MessageWithDisplayName[] = await getMessageData(channel)

    writeToJSONFile(
        {
            ...message.channel,
            messages: allMessagesData,
        },
        channel.name + ".json"
    );
    if (message.channel instanceof TextChannel) { message.channel.send("Saved."); }
}
