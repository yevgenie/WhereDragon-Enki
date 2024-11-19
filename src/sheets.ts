import { google } from "googleapis";
import path from "path";
import { extractMHNMPartOfChannelName } from "./helpers/channelToDKP";
import {
  HNMTypeChannelKeyToSheetStringMap,
  ParsedWindowsPerMember,
} from "./models";
import {
  generateDKPEntryHeaderEntries,
  generateDKPEntryMemberRowEntries,
  WDSheetsAPI,
} from "./sheets-api";

// Used for Shiki / Sim / KA (x without windows)
export async function writeToDKPEntrySheetBasic(
  channelName: string,
  windowsPerMember: ParsedWindowsPerMember,
  isClaimed?: boolean
) {
  console.log("Writing to DKP Entry sheet...", {
    channelName,
    n: Object.keys(windowsPerMember).length,
  });

  const hnmType = extractMHNMPartOfChannelName(channelName);
  const hnmSheetValue = hnmType
    ? HNMTypeChannelKeyToSheetStringMap[hnmType]
    : "UNKNOWN";

  try {
    // CLEAR PREVIOUS STEPS - VERY IMPORTANT!
    await WDSheetsAPI.clear("B5:B223");
    await WDSheetsAPI.clear("D5:D223");

    // 218 rows put in the value FALSE for the claim column as the clear operation:
    await WDSheetsAPI.clearRangeWithDefaultValue("E5:E223", 218, 1, "FALSE");
    await WDSheetsAPI.clearRangeWithDefaultValue("F5:F223", 218, 1, "FALSE");

    const requests = [
      ...generateDKPEntryHeaderEntries(channelName, hnmSheetValue, !!isClaimed),
      ...generateDKPEntryMemberRowEntries(windowsPerMember, !!isClaimed),
    ];

    await WDSheetsAPI.batchUpdateMemberRows(requests);
  } catch (error) {
    console.error("Error updating the sheet:", error);
  }

  console.log("Done!");
}
