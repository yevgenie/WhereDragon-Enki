import test from "tape";
import { channelMessagesToWindows } from "../helpers/channelToDKP";
import { loadJsonFile } from "../helpers/utils";
import { TextChannel, Message } from "discord.js";

test("Kings (Behe/Faf/Ada) Channel To DKP - 5 windows, pop msg", async (t) => {
  const mockKingsChannel = loadJsonFile(
    "test_data/behe_7.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockKingsChannel);

  t.deepEqual(parsedWindowsPerMember, {
    Snyaar: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:39:28",
    },
    Tuple: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:40:17",
    },
    Junonrunon: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:40:17",
    },
    Rhelk: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:40:18",
    },
    Dogs: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:40:55",
    },
    Chuchu: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:42:51",
    },
    Cocopuff: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:43:35",
    },
    Azalin: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:43:49",
    },
    Loyuinyu: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:44:50",
    },
    Leob: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:46:57",
    },
    Switchstance: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:48:28",
    },
    Pengo: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:49:56",
    },
    Sabyrd: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:50:08",
    },
    Paulilla: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:50:12",
    },
    Waky: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:50:26",
    },
    Krados: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:50:44",
    },
    Naten: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:50:54",
    },
    Arch: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:51:36",
    },
    Ancestor: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:52:07",
    },
    Magnum: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:52:12",
    },
    Chaosmage: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:52:41",
    },
    Yupitan: {
      windows: 5,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-17 06:53:44",
    },
    Nar: {
      windows: 4,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-17 06:56:07",
    },
    Samseny: {
      windows: 4,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-17 06:57:40",
    },
    Midnigh: {
      windows: 4,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-17 07:03:39",
    },
    Suds: {
      windows: 3,
      message: "x3",
      checkForError: false,
      timestamp: "2024-11-17 07:15:16",
    },
    Gow: {
      windows: 1,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-17 07:29:28",
    },
  });

  t.end();
});

test("Kings (Behe/Faf/Ada) Channel To DKP - No pop message, 7 windows", async (t) => {
  const mockKingsChannel = loadJsonFile(
    "test_data/behe_4.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockKingsChannel);

  t.deepEqual(parsedWindowsPerMember, {
    Bigfrosty: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:16:56",
    },
    Dogs: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:16:59",
    },
    Beasty: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:17:01",
    },
    Arturiel: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:18:27",
    },
    Tarnish: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:20:52",
    },
    Venatrix: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:22:06",
    },
    Faeyn: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:22:42",
    },
    Foopy: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:24:07",
    },
    Koobu: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:25:10",
    },
    Precarious: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:25:44",
    },
    Samuraijake: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:25:53",
    },
    Trebella: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:26:07",
    },
    Mathrandir: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:26:09",
    },
    Azagarth: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:26:26",
    },
    Karasunosu: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:26:36",
    },
    Naten: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:27:15",
    },
    Chaosmage: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:27:16",
    },
    Blackdog: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:29:08",
    },
    Byorn: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:29:41",
    },
    Nesta: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:30:17",
    },
    Cyr: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:30:20",
    },
    Yinah: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:31:50",
    },
    Thris: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:32:09",
    },
    Rhelk: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:33:27",
    },
    Nar: {
      windows: 7,
      message: "x",
      checkForError: false,
      timestamp: "2024-11-04 23:34:54",
    },
    Suds: {
      windows: 6,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-04 23:36:08",
    },
    Senormiyagi: {
      windows: 7,
      message: "x1",
      checkForError: false,
      timestamp: "2024-11-04 23:36:37",
    },
    Pengo: {
      windows: 6,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-04 23:40:02",
    },
    Chonk: {
      windows: 6,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-04 23:40:09",
    },
    Rahne: {
      windows: 6,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-04 23:41:05",
    },
    Bear: {
      windows: 6,
      message: "x2",
      checkForError: false,
      timestamp: "2024-11-04 23:42:21",
    },
    Ancestor: {
      windows: 5,
      message: "x3",
      checkForError: false,
      timestamp: "2024-11-04 23:51:05",
    },
    Vac: {
      windows: 5,
      message: "x3",
      checkForError: false,
      timestamp: "2024-11-04 23:52:06",
    },
    Kanryu: {
      windows: 4,
      message: "x4",
      checkForError: false,
      timestamp: "2024-11-04 23:54:08",
    },
    Tarns: {
      windows: 4,
      message: "x4",
      checkForError: false,
      timestamp: "2024-11-05 00:03:39",
    },
    Phiasko: {
      windows: 4,
      message: "x4",
      checkForError: false,
      timestamp: "2024-11-05 00:03:55",
    },
    Gogen: {
      windows: 4,
      message: "x4",
      checkForError: false,
      timestamp: "2024-11-05 00:05:52",
    },
    Gow: {
      windows: 3,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-05 00:06:04",
    },
    Ordinai: {
      windows: 3,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-05 00:06:43",
    },
    Yeti: {
      windows: 3,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-05 00:08:40",
    },
    Andy: {
      windows: 3,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-05 00:11:20",
    },
    Donovan: {
      windows: 3,
      message: "x5",
      checkForError: false,
      timestamp: "2024-11-05 00:11:21",
    },
    Ban: {
      windows: 1,
      message: "x7",
      checkForError: false,
      timestamp: "2024-11-05 00:27:06",
    },
  });

  t.end();
});
