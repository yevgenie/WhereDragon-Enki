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

export const extractWindowInfo = (
  input: string
): { windowNumber: number; claimLSName: string } => {
  const pattern = /-{2,} POP: Window (\d+) \| (.+) -{2,}/;
  const match = input.match(pattern);

  if (match) {
    return {
      windowNumber: parseInt(match[1], 10),
      claimLSName: match[2].trim(),
    };
  } else {
    throw new Error("The string does not match the expected format.");
  }
};

const extractNumberAfterX = (s: string): number | null => {
  const regex = /^x\s*(\d+)$/;
  const match = s.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  } else {
    return null;
  }
};

export const channelMessagesToWindows = (
  channel: TextChannel & { messages: any[] }
): ParsedWindowsPerMember => {
  const channelHNMTypeKey: HNMTypeChannelKeys | null =
    extractMHNMPartOfChannelName(channel.name as string);
  const windowsPerMember: ParsedWindowsPerMember = {};

  const validJobXinPattern = /x.*?[a-z]{3}/i;
  const validXKillPatternTiamat = /x.*kill.*[a-z]{3}/i;
  const validXKillPattern = /x.*kill/i;

  switch (channelHNMTypeKey) {
    case "sim":
    case "shi":
    case "ka":
      channel.messages.forEach((message) => {
        const memberName =
          message.memberDisplayName ??
          message.author.globalName ??
          message.author.username;
        const messageContent = message.content.trim().toLocaleLowerCase();
        const alreadyChecked = !!windowsPerMember[memberName];
        if (!alreadyChecked) {
          // eg "x"
          if (messageContent === "x") {
            windowsPerMember[memberName] = {
              windows: 1,
              message: messageContent,
              xClaim: true,
              xKill: true,
              checkForError: false,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
            // eg "x forgot" "x-forgot"
          } else if (
            messageContent.includes("x") &&
            messageContent.includes("forgot")
          ) {
            windowsPerMember[memberName] = {
              windows: 1,
              xClaim: true,
              xKill: true,
              message: messageContent,
              checkForError: true,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }
        }

        // eg. "x-out"
        if (alreadyChecked) {
          if (messageContent.includes("x") && messageContent.includes("out")) {
            windowsPerMember[memberName] = {
              windows: 0,
              xClaim: false,
              xKill: false,
              message: `${
                windowsPerMember[memberName].message
              } -> ${messageContent.trim()}`,
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

      validWindows.forEach((window, windowIndex) => {
        window.forEach((message: any) => {
          const memberName =
            message.memberDisplayName ??
            message.author.globalName ??
            message.author.username;
          if (memberName === "Alise") return;

          const messageContent = message.content.trim().toLocaleLowerCase();

          // if someone x-job's on last window, give them xClaim and xKill by default
          // note this will have to be a claimed processed camp at time of command to count for claim/kill points
          const isLastWindow = windowIndex + 1 === validWindows.length;
          if (validJobXinPattern.test(messageContent)) {
            const validXKill = validXKillPatternTiamat.test(messageContent);
            if (!windowsPerMember[memberName]) {
              windowsPerMember[memberName] = {
                windows: isLastWindow && validXKill ? 0 : 1,
                message: messageContent,
                checkForError: false,
                xClaim: isLastWindow && !validXKill,
                xKill: isLastWindow,
                timestamp: formatTimestampToDate(message.createdTimestamp),
              };
            } else {
              windowsPerMember[memberName].windows +=
                isLastWindow && validXKill ? 0 : 1;
              windowsPerMember[memberName].xClaim = isLastWindow && !validXKill;
              windowsPerMember[memberName].xKill = isLastWindow;
              windowsPerMember[
                memberName
              ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
              windowsPerMember[memberName].timestamp = formatTimestampToDate(
                message.createdTimestamp
              );
            }
          }
        });
      });
      return windowsPerMember;
    case "beh":
    case "faf":
    case "ada":
      const isKingsChannel = true;
      const windows = splitMessagesIntoWindows(
        channel.messages,
        isKingsChannel
      );

      const popWindowMessage = channel.messages.find((msg) =>
        msg.content.includes("POP: Window")
      );

      const { windowNumber: totalWindows, claimLSName } = popWindowMessage
        ? extractWindowInfo(popWindowMessage.content)
        : { windowNumber: 7, claimLSName: "Unknown" };

      windows.forEach((window, windowIndex) => {
        window.forEach((message: any, windowIndex: number) => {
          const memberName =
            message.memberDisplayName ??
            message.author.globalName ??
            message.author.username;
          if (memberName === "Alise") return;

          const messageContent = message.content.trim().toLocaleLowerCase();

          const isXOut =
            messageContent.includes("x") && messageContent.includes("out");
          const firstWindowXIn = messageContent === "x";
          const windowNumberForXIn = extractNumberAfterX(messageContent);

          // eg "x" or "x1"
          if (firstWindowXIn || windowNumberForXIn === 1) {
            windowsPerMember[memberName] = {
              windows: totalWindows,
              message: messageContent,
              xClaim: true,
              xKill: true,
              checkForError: false,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }

          // eg "x2" "x 3"
          if (
            !isXOut &&
            !firstWindowXIn &&
            windowNumberForXIn &&
            windowNumberForXIn > 1
          ) {
            windowsPerMember[memberName] = {
              windows: totalWindows - (windowNumberForXIn - 1),
              message: messageContent,
              checkForError: false,
              xClaim: true,
              xKill: true,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }

          // eg "x-out" "xout" "x out"
          if (isXOut) {
            // TODO: Heavy testing here on x-outs. Sigh.
            windowsPerMember[memberName].xOutWindow = windowIndex;
            windowsPerMember[memberName].xClaim = false; // X-out will always force x-claim to false
            windowsPerMember[memberName].xKill = false; // X-out will always force x-kill to false
            windowsPerMember[memberName].windows -= windowIndex + 1;
            windowsPerMember[memberName].timestamp = formatTimestampToDate(
              message.createdTimestamp
            );
            windowsPerMember[
              memberName
            ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
          }

          // eg "x-kill" "xkill" "x kill"
          const validXKill = validXKillPattern.test(messageContent);
          if (validXKill) {
            console.log("HERE", memberName);
            windowsPerMember[memberName] = {
              windows: 0,
              message: messageContent,
              xKill: true,
              xClaim: false, // x-kill only forces x-claim false
              checkForError: false,
              timestamp: formatTimestampToDate(message.createdTimestamp),
            };
          }
        });
      });
      // console.log({ windowsPerMember });
      return windowsPerMember;
    default:
      return windowsPerMember;
  }
};

// Note: No longer used since not generating sheets but instead doing google api entry direct into existing sheets. Leaving for reference.
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
  messages: Array<{ content: string }>,
  isKingsChannel: boolean = false
): Array<Array<{ content: string }>> => {
  // Use reduce to build up our result array
  return messages.reduce(
    (acc: Array<Array<{ content: string }>>, msg: { content: string }) => {
      if (
        msg.content.includes("in 5-Minutes x-in") ||
        (isKingsChannel && msg.content.includes("-- Window "))
      ) {
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
