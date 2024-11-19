import { Message, TextChannel } from "discord.js";
import { formatTimestampToDate } from "./utils";
import { ParsedWindowsPerMember, HNMTypeChannelKeys } from "../models";

export const channelHeaderRows = (channel: { name: string }) => {
  return buildHeaderRowsToDelimitedCSV(
    channel.name as unknown as string,
    0.25,
    2,
    0
  );
};

export const channelPlayerRows = (channel: { name: string }) => {
  return buildPlayerWindowRowsToDelimitedCSV({
    Syragon: 1,
    Dogs: 1,
    Shei: 0.5,
  });
};

export const channelMessagesToWindows = (
  channel: TextChannel & { messages: any[] }
): ParsedWindowsPerMember => {
  const channelHNMTypeKey: HNMTypeChannelKeys | null =
    extractMHNMPartOfChannelName(channel.name as string);
  const windowsPerMember: ParsedWindowsPerMember = {};
  switch (channelHNMTypeKey) {
    case "sim":
    case "shi":
    case "ka":
      channel.messages.forEach((message) => {
        const memberName =
          message.memberDisplayName ??
          message.author.globalName ??
          message.author.username;
        const alreadyChecked = !!windowsPerMember[memberName];
        if (!alreadyChecked) {
          if (message.content.toLocaleLowerCase().trim() === "x") {
            windowsPerMember[memberName] = {
              windows: 1,
              message: message.content.trim(),
              checkForError: false,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          } else if (
            message.content.includes("x") &&
            message.content.includes("forgot")
          ) {
            windowsPerMember[memberName] = {
              windows: 1,
              message: message.content.trim(),
              checkForError: true,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }
        }
        if (alreadyChecked) {
          if (
            message.content.includes("x") &&
            message.content.includes("out")
          ) {
            windowsPerMember[memberName] = {
              windows: 0,
              message: `${
                windowsPerMember[memberName].message
              } -> ${message.content.trim()}`,
              checkForError: false,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }
        }
      });
      return windowsPerMember;
    case "tia":
      const { validWindows, invalidWindows } =
        splitWindowsIntoValidInvalid(channel);

      // invalidWindows.forEach((window) => {
      //   console.log("INVALID WINDOW CHECK? -->");
      //   window.forEach((message) => {
      //     console.log(message.content);
      //   });
      //   console.log("// ------------------");
      // });

      const validJobXinPattern = /x.*?[a-z]{3}/i;
      const validXKillPattern = /x-kill(?:.*[a-z]{3})/i;
      validWindows.forEach((window, windowIndex) => {
        window.forEach((message: any) => {
          const memberName =
            message.memberDisplayName ??
            message.author.globalName ??
            message.author.username;
          if (memberName === "Alise") return;

          // if someone x-job's on last window, give them xClaim and xKill by default
          // note this will have to be a claimed processed camp at time of command to count for claim/kill points
          const isLastWindow = windowIndex + 1 === validWindows.length;
          if (validJobXinPattern.test(message.content)) {
            const validXKill = validXKillPattern.test(message.content);
            if (!windowsPerMember[memberName]) {
              windowsPerMember[memberName] = {
                windows: isLastWindow && validXKill ? 0 : 1,
                message: message.content.trim(),
                checkForError: false,
                xClaim: isLastWindow && !validXKill,
                xKill: isLastWindow,
                timestamp: formatTimestampToDate(message.createdTimestamp),
              };
            } else {
              windowsPerMember[memberName].windows += isLastWindow && validXKill ? 0 : 1;
              windowsPerMember[memberName].xClaim = isLastWindow && !validXKill;
              windowsPerMember[memberName].xKill = isLastWindow;
              windowsPerMember[memberName].message = `${
                windowsPerMember[memberName].message
              } | ${message.content.trim()}`;
              windowsPerMember[memberName].timestamp = formatTimestampToDate(
                message.createdTimestamp
              );
            }
          }
        });
      });
      console.log(windowsPerMember);
      return windowsPerMember;
    default:
      return windowsPerMember;
  }
};

const buildHeaderRowsToDelimitedCSV = (
  channelName: string,
  windowPoints: number = 0,
  claimKillPoints: number = 0,
  killOnlyPoints = 0
) => {
  const target = "Behe";
  const row1 = [
    channelName,
    "",
    "HNM Target:",
    "",
    target,
    "",
    "",
    "",
    "",
    "",
    "Window Points",
    "",
    "Claim+Kill Pts",
    "",
    "Kill Only Points",
    "",
    "Publish",
    "ENTRY",
    "",
    "",
    "",
    "",
    "Target",
    target,
    "",
    "",
  ].join("\t");

  const row2 = [
    "DKP Process Date:",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    windowPoints,
    "",
    claimKillPoints,
    "",
    killOnlyPoints,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("\t");

  const row3 = [
    "9/11/2024 15:39:15",
    "",
    "Claim:",
    "",
    "FALSE",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("\t");

  const row4 = [
    "",
    "Player Name",
    "",
    "# of Windows",
    "C+K",
    "KO",
    "WinPts",
    "C+K",
    "KO",
    "",
    "Points Awarded",
    "",
    "Manager Special",
    "",
    "Previous Points",
    "",
    "New Point Total",
    "",
    "DKP SPENT",
    "on",
    "",
    "FINAL POINTS",
    "",
    "",
    "NOTES",
    "",
  ].join("\t");

  return [row1, row2, row3, row4].join("\n");
};

const splitWindowsIntoValidInvalid = (
  channel: TextChannel & { messages: any[] }
) => {
  const messagesByWindow = splitMessagesIntoWindows(channel.messages);
  const validWindows = messagesByWindow.filter((msgs) =>
    checkIfValidClaimWindowForTiamat(msgs)
  );
  const invalidWindows = messagesByWindow.filter(
    (msgs) => !checkIfValidClaimWindowForTiamat(msgs)
  );

  return {
    validWindows,
    invalidWindows,
  };
};

const splitMessagesIntoWindows = (
  messages: Array<{ content: string }>
): Array<Array<{ content: string }>> => {
  // Use reduce to build up our result array
  return messages.reduce(
    (acc: Array<Array<{ content: string }>>, msg: { content: string }) => {
      if (msg.content.includes("in 5-Minutes x-in")) {
        acc.push([msg]);
      } else {
        if (acc.length === 0) {
          acc.push([]);
        }
        acc[acc.length - 1].push(msg);
      }
      return acc;
    },
    []
  );
};

const checkIfValidClaimWindowForTiamat = (
  messages: Array<{ content: string }>
) => {
  // @Kanryu @Dogs please check / confirm requirements here for Tiamat valid windows
  const tankPattern = /x.*?(pld|nin|drk)/i;
  const whmPattern = /x.*?(whm)/i;
  const brdPattern = /x.*?(brd)/i;
  const sleepPattern = /x.*?(blm|rdm)/i;

  const hasTank = messages.some((msg) => tankPattern.test(msg.content));
  const hasWHM = messages.some((msg) => whmPattern.test(msg.content));
  const hasBRD = messages.some((msg) => brdPattern.test(msg.content));
  const hasSleeper = messages.some((msg) => sleepPattern.test(msg.content));

  const hasSixPlus =
    messages.filter((msg) => msg.content.includes("x-")).length > 6;

  return hasTank && hasWHM && hasBRD && (hasSixPlus || hasSleeper);
};

const buildPlayerWindowRowsToDelimitedCSV = (attendance: {
  [memberName: string]: number;
}) => {
  const headerRow = ["Player", "Timestamp", "Windows", "Message"];
  const rows = Object.keys(attendance).map((player) => {
    return [player, "1/1/1", attendance[player], "x?"].join("\t");
  });

  return [headerRow.join("\t"), ...rows].join("\n");
};

export const extractMHNMPartOfChannelName = (
  input: string
): HNMTypeChannelKeys => {
  const regex = /-(\w{2,3})(?=\d|$)/;
  const match = input.match(regex);
  return (match ? match[1] : null) as HNMTypeChannelKeys; // Return the captured group or null if no match
};
