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
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToDKPEntrySheetBasic = writeToDKPEntrySheetBasic;
const channelToDKP_1 = require("./helpers/channelToDKP");
const models_1 = require("./models");
const sheets_api_1 = require("./sheets-api");
// Used for Shiki / Sim / KA (x without windows)
function writeToDKPEntrySheetBasic(channelName, windowsPerMember, isClaimed) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Writing to DKP Entry sheet...", {
            channelName,
            n: Object.keys(windowsPerMember).length,
        });
        const hnmType = (0, channelToDKP_1.extractMHNMPartOfChannelName)(channelName);
        const hnmSheetValue = hnmType
            ? models_1.HNMTypeChannelKeyToSheetStringMap[hnmType]
            : "UNKNOWN";
        try {
            // CLEAR PREVIOUS STEPS - VERY IMPORTANT!
            yield sheets_api_1.WDSheetsAPI.clear("B5:B223");
            yield sheets_api_1.WDSheetsAPI.clear("D5:D223");
            // 218 rows put in the value FALSE for the claim column as the clear operation:
            yield sheets_api_1.WDSheetsAPI.clearRangeWithDefaultValue("E5:E223", 218, 1, "FALSE");
            const requests = [
                ...(0, sheets_api_1.generateDKPEntryHeaderEntries)(channelName, hnmSheetValue, !!isClaimed),
                ...(0, sheets_api_1.generateDKPEntryMemberRowEntries)(windowsPerMember, !!isClaimed),
            ];
            yield sheets_api_1.WDSheetsAPI.batchUpdateMemberRows(requests);
        }
        catch (error) {
            console.error("Error updating the sheet:", error);
        }
        console.log("Done!");
    });
}
