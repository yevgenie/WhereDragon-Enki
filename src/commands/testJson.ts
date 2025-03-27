import { Message  } from "discord.js";
//import { MessageWithDisplayName } from "../types/MessageData";
//import { channelMessagesToWindows } from "../utils/channelToDKP";
//import { loadJsonFile } from "../utils/utils";
import { getDateDataFromUnixTimeStamp, getUTCOffset } from "../utils/timeUtils";
import { ClientWithCommands } from "../types/ClientWithCommands";

export const name = "qw"
export const description = ""
export const execute = (message: Message) => {
    const client: ClientWithCommands = message.client;
    const unixTimeStamp: number = 1730898958623;
    const unixNewTimeStamp: number = 1743006182000;
    //const mockKingsChannel = loadJsonFile(
    //    "test_data/nov13-ka.json"
    //) as TextChannel & { messages: MessageWithDisplayName[] };
    //
    //const { windowsPerMember: parsedWindowsPerMember } =
    //    channelMessagesToWindows(mockKingsChannel);

    //console.log(parsedWindowsPerMember)
    console.log(new Date(unixTimeStamp).toString())
    console.log(new Date(unixTimeStamp).toUTCString())
    console.log(getDateDataFromUnixTimeStamp(unixTimeStamp))
    console.log(client.timeZone)
    if (client.timeZone) {
        const laOffset = getUTCOffset(unixTimeStamp, client.timeZone);
        console.log(`Los Angeles UTC Offset: ${laOffset} hours`); // Should reflect DST if applicable
    }
    //const laNewOffset = getUTCOffset(unixNewTimeStamp, "America/Los_Angeles");
    //
    //
    //console.log(`Los Angeles UTC Offset: ${laNewOffset} hours`); // Should reflect DST if applicable
}
