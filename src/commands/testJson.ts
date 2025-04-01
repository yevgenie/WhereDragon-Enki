import { Message, TextChannel  } from "discord.js";
import { MessageWithDisplayName } from "../types/MessageData";
import { channelMessagesToWindows } from "../utils/channelToDKP";
import { loadJsonFile } from "../utils/utils";

export const name = "qw"
export const description = ""
export const execute = (message: Message) => {
    const mockKingsChannel = loadJsonFile(
        "test_data/nov15-ka.json"
    ) as TextChannel & { messages: MessageWithDisplayName[] };

    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockKingsChannel);

}
