import { getDateDataFromTime, getDateDataFromDateTime } from "./timeUtils";
import { processHNM } from "./channelUtils";
import { HnmTimerData } from "../types/HnmTimerData";
import { Message } from "discord.js";
import { HnmCommandData } from "../types/CommandData";

export async function createHnmTimer(message: Message, hnmData: HnmCommandData, args: string[]) {
    const hnmTimerData: HnmTimerData = sortHnmArguments(hnmData, args);
    // WARN: This is for testing.
    printHnmTimerData(hnmTimerData)
    processHNM(message, hnmTimerData)
}

function sortHnmArguments(hnmData: HnmCommandData, args: string[]): HnmTimerData {
    const hnmTimerData: HnmTimerData = {
        name: hnmData.name,
        day: 0,
        mod: "n",
        timeStamp: "",
        hnmData: hnmData,
        isValid: false,
        reason: "Invalid argument entry."
    };
    const mods: string[] = ["n", "d", "t", "a"];

    // TODO: Create findTimerErrors(hnmTimerData: HnmTimerData) to sort errors out
    // TODO: Create tests to check for all variations.
    if (args.length > 0) {
        // Time
        if (args.length == 1 && args[0].length == 6) {
            hnmTimerData.timeStamp = args[0];
            hnmTimerData.isValid = true;

            if (!(getDateDataFromTime(hnmTimerData.timeStamp) instanceof Date)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        } else if (args.length == 1) {
            hnmTimerData.isValid = false;
            hnmTimerData.reason = "Invalid DateTime";
        }


        // Day, Time
        if (args.length == 2 && args[0].length >= 1 && args[0].length <= 2) {
            hnmTimerData.day = parseInt(args[0]);
            hnmTimerData.timeStamp = args[1];
            hnmTimerData.isValid = true;

            if (isNaN(hnmTimerData.day)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Day has to be a number";
            }

            if (!(getDateDataFromTime(hnmTimerData.timeStamp) instanceof Date) || args[1].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        }

        // Date, Time
        if (args.length == 2 && args[0].length == 8) {
            hnmTimerData.timeStamp = `${args[0]} ${args[1]}`;
            hnmTimerData.isValid = true;
            hnmTimerData.reason = "Invalid DateTime";

            if (!(getDateDataFromDateTime(hnmTimerData.timeStamp) instanceof Date) || args[0].length !== 8 || args[1].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        }

        // Mod, Time
        if (args.length == 2 && args[0].length == 1 && isNaN(parseInt(args[0]))) {
            hnmTimerData.day = 0;
            hnmTimerData.mod = args[0];
            hnmTimerData.timeStamp = args[1];
            hnmTimerData.isValid = true;

            if (!mods.includes(hnmTimerData.mod)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Mod entered does not exist";
            }

            if (!(getDateDataFromTime(hnmTimerData.timeStamp) instanceof Date) || args[1].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        }

        // Day, Date, Time
        if (args.length == 3 && args[0].length >= 1 && args[0].length <= 2 && args[1].length > 1) {
            hnmTimerData.day = parseInt(args[0]);
            hnmTimerData.timeStamp = `${args[1]} ${args[2]}`;
            hnmTimerData.isValid = true;

            if (isNaN(hnmTimerData.day)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Day has to be a number";
            }

            if (isNaN(parseInt(args[1]))) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = `Invalid Date or Mod entry \t>>> ${args[1]} <<<`;
            }

            if (!(getDateDataFromDateTime(hnmTimerData.timeStamp) instanceof Date) || args[1].length !== 8 || args[2].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }

        }

        // Day, Mod, Time
        if (args.length == 3 && args[0].length >= 1 && args[0].length <= 2 && args[1].length == 1) {
            hnmTimerData.day = parseInt(args[0]);
            hnmTimerData.mod = args[1];
            hnmTimerData.timeStamp = args[2];
            hnmTimerData.isValid = true;

            if (isNaN(hnmTimerData.day)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Day has to be a number";
            }

            if (!mods.includes(hnmTimerData.mod)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Mod entered does not exist";
            }

            if (!(getDateDataFromTime(hnmTimerData.timeStamp) instanceof Date) || args[2].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        }

        // Day, Mod, Date, Time
        if (args.length == 4 && args[0].length >= 1 && args[0].length <= 2) {
            hnmTimerData.day = parseInt(args[0]);
            hnmTimerData.mod = args[1];
            hnmTimerData.timeStamp = `${args[2]} ${args[3]}`;
            hnmTimerData.isValid = true;

            if (isNaN(hnmTimerData.day)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Day has to be a number";
            }

            if (!mods.includes(hnmTimerData.mod)) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Mod entered does not exist";
            }

            if (!(getDateDataFromDateTime(hnmTimerData.timeStamp) instanceof Date) || args[2].length !== 8 || args[3].length !== 6) {
                hnmTimerData.isValid = false;
                hnmTimerData.reason = "Invalid DateTime";
            }
        } else if (args.length > 4) {
            hnmTimerData.isValid = false;
            hnmTimerData.reason = "Too many arguments entered"
        }

    } else {
        hnmTimerData.isValid = false;
        hnmTimerData.reason = "No arguments were entered";
    }



    let i: number = 0;
    while (i < args.length) {
        i++;
    }
    return hnmTimerData;
}

function printHnmTimerData(hnmTimerData: HnmTimerData): void {
    console.log(`Name: ${hnmTimerData.name}`)
    console.log(`Day: ${hnmTimerData.day}`)
    console.log(`Mod: ${hnmTimerData.mod}`)
    console.log(`TimeStamp: ${hnmTimerData.timeStamp}`)
    console.log(`Valid: ${hnmTimerData.isValid}`)
    if (hnmTimerData.reason && !hnmTimerData.isValid) {
        console.log(`Reason: ${hnmTimerData.reason}`)
    }
}
