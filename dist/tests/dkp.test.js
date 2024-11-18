"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const channelToDKP_1 = require("../helpers/channelToDKP");
const utils_1 = require("../helpers/utils");
(0, tape_1.default)("channelHeaderRows", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const headerRows = (0, channelToDKP_1.channelHeaderRows)({ name: "#sep10-behe3" });
    (0, utils_1.exportToCsv)("../../csv/header_base_test.test_result.csv", headerRows);
    try {
        const areEqual = yield (0, utils_1.compareCsvFiles)("../../csv/header_base_test.test_result.csv", "../../csv/header_base_test.csv");
        t.ok(areEqual, "The CSV files should be equal.");
    }
    catch (error) {
        t.fail(`Error comparing files: ${error}`);
    }
    t.end();
}));
(0, tape_1.default)("channelPlayerRows", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const playerRows = (0, channelToDKP_1.channelPlayerRows)({ name: "#sep10-behe3" });
    (0, utils_1.exportToCsv)("../../csv/player_base_test.test_result.csv", playerRows);
    try {
        const areEqual = yield (0, utils_1.compareCsvFiles)("../../csv/header_base_test.test_result.csv", "../../csv/header_base_test.csv");
        t.ok(areEqual, "The CSV files should be equal.");
    }
    catch (error) {
        t.fail(`Error comparing files: ${error}`);
    }
    t.end();
}));
(0, tape_1.default)("channelMessagesToWindows - Shiki", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const mockChannelShiki = (0, utils_1.loadJsonFile)("../../test_data/shiki_1.json");
    const parsedWindowsPerMember = (0, channelToDKP_1.channelMessagesToWindows)(mockChannelShiki);
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
}));
(0, tape_1.default)("channelMessagesToWindows - KA", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const mockChannelKa = (0, utils_1.loadJsonFile)("../../test_data/ka_1.json");
    const parsedWindowsPerMember = (0, channelToDKP_1.channelMessagesToWindows)(mockChannelKa);
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
}));
(0, tape_1.default)("extractMHNMPartOfChannelName", (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep18-shi"), "shi");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep18-kv"), "kv");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep18-sim"), "sim");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep18-ada2"), "ada");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep18-beh7"), "beh");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep01-ada2"), "ada");
    t.equal((0, channelToDKP_1.extractMHNMPartOfChannelName)("sep01-beh7"), "beh");
    t.end();
}));
