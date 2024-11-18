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
(0, tape_1.default)("Tiamat Channel To DKP", (t) => __awaiter(void 0, void 0, void 0, function* () {
    const mockTiamatChannel = (0, utils_1.loadJsonFile)("test_data/tiamat_1.json");
    const parsedWindowsPerMember = (0, channelToDKP_1.channelMessagesToWindows)(mockTiamatChannel);
    t.deepEqual(parsedWindowsPerMember, {
        Tarnish: {
            windows: 9,
            message: "x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld",
            checkForError: false,
            timestamp: "2024-10-29 17:30:48",
        },
        Ancestor: {
            windows: 2,
            message: "x-blm | x-blm",
            checkForError: false,
            timestamp: "2024-10-29 14:32:35",
        },
        Yeti: {
            windows: 9,
            message: "x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm",
            checkForError: false,
            timestamp: "2024-10-29 17:31:23",
        },
        Dogs: {
            windows: 13,
            message: "x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk | x-drk",
            checkForError: false,
            timestamp: "2024-10-29 17:35:28",
        },
        Nicolesixtynine: {
            windows: 12,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:30:40",
        },
        Azalin: {
            windows: 2,
            message: "x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:33:40",
        },
        Samuraijake: {
            windows: 3,
            message: "x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 00:30:04",
        },
        Azagarth: {
            windows: 10,
            message: "x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm",
            checkForError: false,
            timestamp: "2024-10-29 17:32:30",
        },
        Bear: {
            windows: 5,
            message: "x-whm | x-whm | x-whm | x-whm | x-pld",
            checkForError: false,
            timestamp: "2024-10-29 03:30:42",
        },
        Chronus: {
            windows: 4,
            message: "x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:32:29",
        },
        Koobu: {
            windows: 8,
            message: "x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 16:30:44",
        },
        Meetra: {
            windows: 10,
            message: "x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm",
            checkForError: false,
            timestamp: "2024-10-29 16:32:14",
        },
        Lilsheck: {
            windows: 7,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:34:09",
        },
        Naten: {
            windows: 12,
            message: "x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld | x-pld",
            checkForError: false,
            timestamp: "2024-10-29 17:30:11",
        },
        Cyr: {
            windows: 4,
            message: "x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 01:32:04",
        },
        Mathrandir: {
            windows: 10,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:32:40",
        },
        Syragon: {
            windows: 12,
            message: "x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 16:34:43",
        },
        Yasiara: {
            windows: 3,
            message: "x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:33:56",
        },
        Rahne: {
            windows: 7,
            message: "x-whm | x-whm | x-whm | x-whm | x-whm | x-whm | x-whm",
            checkForError: false,
            timestamp: "2024-10-29 15:31:00",
        },
        Archmage: {
            windows: 6,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 11:32:29",
        },
        Suds: {
            windows: 12,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:34:01",
        },
        Trymidas: {
            windows: 8,
            message: "x-bst | x-bst | x-bst | x-bst | x-bst | x-bst | x-bst | x-bst",
            checkForError: false,
            timestamp: "2024-10-29 17:31:24",
        },
        Ban: {
            windows: 7,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:30:23",
        },
        Yupitan: {
            windows: 6,
            message: "x whm | x whm | x whm | x whm | x whm | x whm",
            checkForError: false,
            timestamp: "2024-10-29 08:31:48",
        },
        Rhelk: {
            windows: 10,
            message: "x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:31:30",
        },
        Brandan: {
            windows: 16,
            message: "x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 16:31:23",
        },
        Junonrunon: {
            windows: 5,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 10:30:48",
        },
        Leob: {
            windows: 4,
            message: "x-brd | x-brd | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 07:31:00",
        },
        Odie: {
            windows: 4,
            message: "x-whm | x-whm | x-whm | x-whm",
            checkForError: false,
            timestamp: "2024-10-29 05:34:13",
        },
        Foopy: {
            windows: 8,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 16:33:27",
        },
        Byorn: {
            windows: 7,
            message: "x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:30:06",
        },
        Whereami: {
            windows: 11,
            message: "x-brd | x-brd | x-brd | x-brd | x-brd | x-brd | x-smn | x-smn | x-smn | x-brd | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 17:30:06",
        },
        Sebasthegalka: {
            windows: 11,
            message: "X-mnk | X-mnk | X-brd | X-brd | X-brd | X-brd | X-brd | X-brd | X-brd | X-brd | X-brd",
            checkForError: false,
            timestamp: "2024-10-29 17:33:25",
        },
        Cocopuff: {
            windows: 10,
            message: "x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:32:34",
        },
        Waky: {
            windows: 6,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 11:33:06",
        },
        Caley: {
            windows: 5,
            message: "X-smn | X-smn | X-smn | X-smn | X-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:30:59",
        },
        Riccu: {
            windows: 5,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 11:30:13",
        },
        Pengo: {
            windows: 1,
            message: "x-blm",
            checkForError: false,
            timestamp: "2024-10-29 08:30:56",
        },
        Lordgore: {
            windows: 2,
            message: "x-Brd | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 09:31:13",
        },
        Xtal: {
            windows: 4,
            message: "x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 12:31:49",
        },
        Switchstance: {
            windows: 2,
            message: "x-brd | x-drk",
            checkForError: false,
            timestamp: "2024-10-29 17:30:36",
        },
        Mayer: {
            windows: 9,
            message: "x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm | x-blm",
            checkForError: false,
            timestamp: "2024-10-29 17:33:04",
        },
        Blankets: {
            windows: 1,
            message: "x-blm",
            checkForError: false,
            timestamp: "2024-10-29 09:34:35",
        },
        War3zlod3r: {
            windows: 8,
            message: "x-whm | x-whm | x-whm | x-whm | x-whm | x-whm | x-whm | x-whm",
            checkForError: false,
            timestamp: "2024-10-29 17:34:13",
        },
        Nar: {
            windows: 8,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:32:57",
        },
        Sabyrd: {
            windows: 5,
            message: "x-brd | x-brd | x-brd | x-brd | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 16:32:00",
        },
        Donovan: {
            windows: 7,
            message: "x-smn | x-smn | x-smn | x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 16:31:05",
        },
        Rerabick: {
            windows: 7,
            message: "x-whm | X-whm | x-smn | x-smn | x-smn | X-SMN | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 17:31:10",
        },
        Darth: {
            windows: 4,
            message: "x-whm | x-whm | x-whm | x-whm",
            checkForError: false,
            timestamp: "2024-10-29 17:30:50",
        },
        Precarious: {
            windows: 5,
            message: "x-rdm | x-rdm | x-rdm | x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:34:04",
        },
        Magnum: {
            windows: 4,
            message: "x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 16:31:44",
        },
        Blackdog: {
            windows: 4,
            message: "x-brd | x-brd | x-brd | x-brd",
            checkForError: false,
            timestamp: "2024-10-29 16:30:45",
        },
        Goodtimes: {
            windows: 2,
            message: "x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 13:32:03",
        },
        Evrae: {
            windows: 2,
            message: "x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 15:31:51",
        },
        Krados: {
            windows: 4,
            message: "x-whm | x-whm | x-whm | x-whm",
            checkForError: false,
            timestamp: "2024-10-29 17:30:24",
        },
        Moomba: {
            windows: 4,
            message: "x-smn | x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:31:52",
        },
        Kanryu: {
            windows: 5,
            message: "x-nin | x-nin | x-nin | x-ada tod | !DKPExport",
            checkForError: false,
            timestamp: "2024-10-31 09:54:55",
        },
        Dcplee: {
            windows: 3,
            message: "x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:30:42",
        },
        Samseny: {
            windows: 3,
            message: "x-smn | x-smn | x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:32:15",
        },
        Chuchu: {
            windows: 2,
            message: "x-rdm | x-rdm",
            checkForError: false,
            timestamp: "2024-10-29 17:33:39",
        },
        Karianna: {
            windows: 1,
            message: "x-whm",
            checkForError: false,
            timestamp: "2024-10-29 17:30:56",
        },
        Shei: {
            windows: 1,
            message: "x-BRD",
            checkForError: false,
            timestamp: "2024-10-29 17:31:01",
        },
        Riverking: {
            windows: 1,
            message: "x-drk",
            checkForError: false,
            timestamp: "2024-10-29 17:31:26",
        },
        Nesta: {
            windows: 1,
            message: "x-whm",
            checkForError: false,
            timestamp: "2024-10-29 17:31:35",
        },
        Avelain: {
            windows: 1,
            message: "x-smn",
            checkForError: false,
            timestamp: "2024-10-29 17:31:58",
        },
    });
    t.end();
}));
