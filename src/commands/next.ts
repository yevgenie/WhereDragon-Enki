import { Message } from "discord.js";
import { sendNextCamp } from "../utils/channelUtils";

export const name = "next";
export const description = "Sends the next camp to the current channel."
export const execute = (message: Message) => {
    sendNextCamp(message)
}

