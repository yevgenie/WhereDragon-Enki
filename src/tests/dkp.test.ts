import test from "tape";
import {
  channelHeaderRows,
  channelMessagesToWindows,
  channelPlayerRows,
} from "../helpers/channelToDKP";
import { compareCsvFiles, exportToCsv, loadJsonFile } from "../helpers/utils";
import { Message, TextChannel } from "discord.js";

test("channelHeaderRows", async (t) => {
  const headerRows = channelHeaderRows({ name: "#sep10-behe3" });

  exportToCsv("../../csv/header_base_test.test_result.csv", headerRows);

  try {
    const areEqual = await compareCsvFiles(
      "../../csv/header_base_test.test_result.csv",
      "../../csv/header_base_test.csv"
    );
    t.ok(areEqual, "The CSV files should be equal.");
  } catch (error) {
    t.fail(`Error comparing files: ${error}`);
  }

  t.end();
});

test("channelPlayerRows", async (t) => {
  const playerRows = channelPlayerRows({ name: "#sep10-behe3" });

  exportToCsv("../../csv/player_base_test.test_result.csv", playerRows);

  try {
    const areEqual = await compareCsvFiles(
      "../../csv/header_base_test.test_result.csv",
      "../../csv/header_base_test.csv"
    );
    t.ok(areEqual, "The CSV files should be equal.");
  } catch (error) {
    t.fail(`Error comparing files: ${error}`);
  }

  t.end();
});

test("channelMessagesToWindows - Shiki", async (t) => {
  const mockChannelShiki = loadJsonFile(
    "../../test_data/shiki_1.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockChannelShiki);

  t.deepEqual(parsedWindowsPerMember, {
    Tuple: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-18 07:14:08",
    },
    Capoutefrancais: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-18 07:27:00",
    },
    Syragon: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-18 07:29:54",
    },
  });

  t.end();
});

test("channelMessagesToWindows - KA", async (t) => {
  const mockChannelKa = loadJsonFile(
    "../../test_data/ka_1.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockChannelKa);

  t.deepEqual(parsedWindowsPerMember, {
    Loyuinyu: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:01:59",
    },
    Rara: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:02:41",
    },
    revnia: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:03:07",
    },
    Darth: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:04:16",
    },
    Shumiry: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:06:24",
    },
    Suds: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:06:30",
    },
    Yoonii: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:06:35",
    },
    Chuchu: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:07:19",
    },
    Bear: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:07:33",
    },
    Faeyn: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:08:40",
    },
    yupitan: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:08:51",
    },
    Azalin: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:09:44",
    },
    Tarnish: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:12:25",
    },
    DemonTerror: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:12:39",
    },
    johndoe129: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:14:39",
    },
    Riccu: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:15:53",
    },
    Venatrix: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:19:05",
    },
    "Rival/Warwick": {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:19:46",
    },
    "1nt3rc3pt0r": {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:20:09",
    },
    bepis: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:21:30",
    },
    ItsJames: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:41:23",
    },
    Cyr: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:42:18",
    },
    Yeti: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:46:12",
    },
    BrowniePoints: {
      windows: 1,
      message: "x",
      checkForError: false,
      timestamp: "2024-09-20 23:52:09",
    },
    Thel: {
      windows: 1,
      message: "x - forgot",
      checkForError: true,
      timestamp: "2024-09-21 13:12:14",
    },
  });

  t.end();
});
