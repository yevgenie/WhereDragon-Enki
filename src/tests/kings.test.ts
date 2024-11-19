import test from "tape";
import {
  channelHeaderRows,
  channelMessagesToWindows,
} from "../helpers/channelToDKP";
import { compareCsvFiles, exportToCsv, loadJsonFile } from "../helpers/utils";
import { TextChannel, Message } from "discord.js";

test("Kings (Behe/Faf/Ada) Channel To DKP", async (t) => {
  const mockTiamatChannel = loadJsonFile(
    "test_data/behe_7.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockTiamatChannel);

  t.deepEqual(parsedWindowsPerMember, {});

  t.end();
});
