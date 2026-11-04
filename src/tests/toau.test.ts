import test from "tape";
import {
    channelHeaderRows,
    channelMessagesToWindows,
    extractNumberAfterX,
} from "../utils/channelToDKP";
import { compareCsvFiles, exportToCsv, loadJsonFile } from "../utils/utils";
import { TextChannel, Message } from "discord.js";
import { writeToJSONFile } from "../utils/fileUtils";

test("Hydra Channel To DKP - 'x-job' input validation - Main Camp", async (t) => {
    const mockHydraChannel = loadJsonFile(
        "test_data/hydra-main-camp.json"
    ) as TextChannel & { messages: Message[] };
    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockHydraChannel);
    // console.log({ parsedWindowsPerMember });
    t.deepEqual(parsedWindowsPerMember, {
        Darth: {
            windows: 1,
            message: "x-whm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Tarnish: {
            windows: 1,
            message: "x-pld",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Sabyrd: {
            windows: 1,
            message: "x-brd",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Dogs: {
            windows: 1,
            message:
                "x-rdm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
    });

    t.end();
});

test("Khimaira Channel To DKP - 'x - job' input validation - Main Camp", async (t) => {
    const mockKhimairaChannel = loadJsonFile(
        "test_data/khimaira_spaced_job_input-main-camp.json"
    ) as TextChannel & { messages: Message[] };
    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockKhimairaChannel);
    // console.log({ parsedWindowsPerMember });
    t.deepEqual(parsedWindowsPerMember, {
        Darth: {
            windows: 1,
            message: "x - whm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Tarnish: {
            windows: 1,
            message: "x - pld",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Sabyrd: {
            windows: 1,
            message: "x - brd",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Dogs: {
            windows: 1,
            message:
                "x - rdm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
    });

    t.end();
});

test("Cerberus Channel To DKP - 'x-job' input validation - Alt Camp", async (t) => {
    const mockCerberusChannel = loadJsonFile(
        "test_data/cerb-alt-camp.json"
    ) as TextChannel & { messages: Message[] };
    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockCerberusChannel);
    // console.log({ parsedWindowsPerMember });
    t.deepEqual(parsedWindowsPerMember, {
        Darth: {
            windows: 0.5,
            message: "x-alt-whm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Tarnish: {
            windows: 0.5,
            message: "x-alt-pld",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Sabyrd: {
            windows: 0.5,
            message: "x-alt-brd",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Dogs: {
            windows: 0.5,
            message:
                "x-alt-rdm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
    });

    t.end();
});

test("Cerberus Channel To DKP - 'x - job' input validation - Alt Camp", async (t) => {
    const mockCerberusChannel = loadJsonFile(
        "test_data/cerb_spaced_job_input-alt-camp.json"
    ) as TextChannel & { messages: Message[] };
    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockCerberusChannel);
    // console.log({ parsedWindowsPerMember });
    t.deepEqual(parsedWindowsPerMember, {
        Darth: {
            windows: 0.5,
            message: "x - alt - whm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Tarnish: {
            windows: 0.5,
            message: "x - alt - pld",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Sabyrd: {
            windows: 0.5,
            message: "x - alt - brd",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
        Dogs: {
            windows: 0.5,
            message:
                "x - alt - rdm",
            checkForError: false,
            xClaim: true,
            xKill: true,
            timestamp: "2024-11-06 14:06:33",
        },
    });

    t.end();
});

test("Hydra Channel To DKP - 'x-job' input validation - Main Camp - Invalid Hold Party", async (t) => {
    const mockHydraChannel = loadJsonFile(
        "test_data/hydra-main-camp-invalid-hold.json"
    ) as TextChannel & { messages: Message[] };
    const { windowsPerMember: parsedWindowsPerMember } =
        channelMessagesToWindows(mockHydraChannel);
    // console.log({ parsedWindowsPerMember });
    t.deepEqual(parsedWindowsPerMember, {});

    t.end();
});