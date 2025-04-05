import { Message } from "discord.js";
import { createHnmTimer } from "../utils/hnmUtils";
import { HnmCommandData } from "../types/CommandData"

const commandData: HnmCommandData = {
    name: "King Arthro",
    timerFormat: ":crab:",
    isKing: false,
}

export const name = "kingarthro";
export const aliases = ["ka", "kinga"];
export const execute = (message: Message, args: string[]) => {
    createHnmTimer(message, commandData, args);
}
