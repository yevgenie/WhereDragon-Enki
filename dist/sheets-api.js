"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.generateDKPEntryMemberRowEntries = exports.generateDKPEntryHeaderEntries = exports.WDSheetsAPI = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Load credentials from JSON file
const CREDENTIALS_PATH = path_1.default.join(__dirname, "../credentials.json");
const SCOPES = [`${process.env.SCOPES_URL}`];
// The ID of the spreadsheet to update
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "DKP Entry";
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});
/** WARNING: NEVER USE THE GOOGLE SHEETS API WITHOUT A `SHEET_NAME` IN THE RANGE ENTRY */
/** DO NOT WANT TO RISK WRITING TO THE WRONG SHEET AND CLEARING OUT DATA */
const sheets = googleapis_1.google.sheets({ version: "v4", auth });
exports.WDSheetsAPI = {
    clear: (range) => __awaiter(void 0, void 0, void 0, function* () {
        if (range.includes("!"))
            return;
        yield sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!${range}`,
        });
    }),
    clearRangeWithDefaultValue: (range_1, ...args_1) => __awaiter(void 0, [range_1, ...args_1], void 0, function* (range, rowCount = 218, columnCount = 1, value = "FALSE") {
        if (range.includes("!"))
            return;
        yield sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: {
                    range: `${SHEET_NAME}!${range}`,
                    //range: `DKP Entry!E5:E223`,
                    values: Array.from({ length: rowCount }, () => Array(columnCount).fill(value)),
                },
                valueInputOption: "USER_ENTERED",
            },
        });
    }),
    batchUpdateMemberRows: (requests) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("BATCH UPDATE!", SPREADSHEET_ID, requests.length);
        const response = yield sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: requests,
                valueInputOption: "USER_ENTERED",
            },
        });
        console.log(`Cells updated: ${response.data.totalUpdatedRows}`);
    }),
};
const generateDKPEntryHeaderEntries = (channelName, hnmSheetValue, isClaimed) => {
    return [
        {
            range: `${SHEET_NAME}!A1:A1`, // channel name
            values: [[channelName]],
        },
        {
            range: `${SHEET_NAME}!E1:I2`, //
            values: [[hnmSheetValue]],
        },
        {
            range: `${SHEET_NAME}!A3:B3`, //
            values: [["=NOW()"]],
        },
        {
            range: `${SHEET_NAME}!E3`, // Claim
            values: [[isClaimed ? "TRUE" : "FALSE"]],
        },
    ];
};
exports.generateDKPEntryHeaderEntries = generateDKPEntryHeaderEntries;
const generateDKPEntryMemberRowEntries = (windowsPerMember, isClaimed) => {
    const requests = [];
    Object.keys(windowsPerMember)
        .sort(alphaSort)
        .forEach((name, index) => {
        requests.push({
            range: `${SHEET_NAME}!B${index + 5}`,
            values: [[name]],
        });
        requests.push({
            range: `${SHEET_NAME}!D${index + 5}`,
            values: [[`${windowsPerMember[name].windows}`]],
        });
        requests.push({
            range: `${SHEET_NAME}!E${index + 5}`,
            values: [[isClaimed ? "TRUE" : "FALSE"]],
        });
    });
    return requests;
};
exports.generateDKPEntryMemberRowEntries = generateDKPEntryMemberRowEntries;
const alphaSort = (a, b) => {
    return a.localeCompare(b);
};
