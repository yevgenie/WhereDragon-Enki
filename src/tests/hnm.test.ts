import test from "tape";
import { channelMessagesToWindows } from "../helpers/channelToDKP";
import { loadJsonFile } from "../helpers/utils";
import { TextChannel, Message } from "discord.js";
import { writeToJSONFile } from "..";

test("Nov13 KA Test", async (t) => {
  const mockKingsChannel = loadJsonFile(
    "test_data/nov13-ka.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockKingsChannel);
  // await writeToJSONFile(parsedWindowsPerMember);
  t.deepEqual(parsedWindowsPerMember, {
    Tarnish: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:25:47",
    },
    Byorn: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:26:43",
    },
    Pestii: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:26:49",
    },
    Ancestor: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:27:06",
    },
    Brandan: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:27:37",
    },
    Sabyrd: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:31:07",
    },
    Chaosmage: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:31:14",
    },
    Dcplee: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:31:58",
    },
    Morrigan: {
      windows: 1,
      message: "x (aspid tod)",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:32:14",
    },
    Mathrandir: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:38:14",
    },
    Nar: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:38:16",
    },
    Gogen: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:41:47",
    },
    Cordia: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:49:17",
    },
    Syragon: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:50:27",
    },
    Darth: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:51:20",
    },
    Pengo: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:51:31",
    },
    Naten: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:56:01",
    },
    Bear: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 21:59:34",
    },
    Nesta: {
      windows: 1,
      message: "x",
      xClaim: true,
      xKill: true,
      checkForError: false,
      timestamp: "2024-11-13 22:03:04",
    },
  });

  t.end();
});
