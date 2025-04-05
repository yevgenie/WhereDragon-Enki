import { Message } from "discord.js";
import { createHnmTimer } from "../utils/hnmUtils";
import { HnmCommandData } from "../types/CommandData";

const commandData: HnmCommandData = {
    name: "Adamantoise",
    timerFormat: ":turtle:",
    isKing: true,
    hq: "Aspidochelone"
}

export const name = "adamantoise";
export const aliases = ["ada", "adam"];
export const execute = (message: Message, args: string[]) => {
    createHnmTimer(message, commandData, args);
}
