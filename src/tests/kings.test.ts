import test from "tape";
import {
  channelMessagesToWindows,
} from "../helpers/channelToDKP";
import { loadJsonFile } from "../helpers/utils";
import { TextChannel, Message } from "discord.js";

test("Kings (Behe/Faf/Ada) Channel To DKP", async (t) => {
  const mockKingsChannel = loadJsonFile(
    "test_data/behe_7.json"
  ) as TextChannel & { messages: Message[] };
  const parsedWindowsPerMember = channelMessagesToWindows(mockKingsChannel);

  t.deepEqual(parsedWindowsPerMember,{
      Snyaar: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:39:28'
      },
      Tuple: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:40:17'
      },
      Junonrunon: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:40:17'
      },
      Rhelk: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:40:18'
      },
      Dogs: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:40:55'
      },
      Chuchu: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:42:51'
      },
      Cocopuff: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:43:35'
      },
      Azalin: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:43:49'
      },
      Loyuinyu: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:44:50'
      },
      Leob: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:46:57'
      },
      Switchstance: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:48:28'
      },
      Pengo: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:49:56'
      },
      Sabyrd: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:50:08'
      },
      Paulilla: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:50:12'
      },
      Waky: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:50:26'
      },
      Krados: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:50:44'
      },
      Naten: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:50:54'
      },
      Arch: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:51:36'
      },
      Ancestor: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:52:07'
      },
      Magnum: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:52:12'
      },
      Chaosmage: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:52:41'
      },
      Yupitan: {
        windows: 5,
        message: 'x',
        checkForError: false,
        timestamp: '2024-11-17 06:53:44'
      },
      Nar: {
        windows: 5,
        message: 'x2',
        checkForError: false,
        timestamp: '2024-11-17 06:56:07'
      },
      Samseny: {
        windows: 5,
        message: 'x2',
        checkForError: false,
        timestamp: '2024-11-17 06:57:40'
      },
      Midnigh: {
        windows: 5,
        message: 'x2',
        checkForError: false,
        timestamp: '2024-11-17 07:03:39'
      },
      Suds: {
        windows: 5,
        message: 'x3',
        checkForError: false,
        timestamp: '2024-11-17 07:15:16'
      },
      Gow: {
        windows: 5,
        message: 'x5',
        checkForError: false,
        timestamp: '2024-11-17 07:29:28'
      }
    }
  );

  t.end();
});
