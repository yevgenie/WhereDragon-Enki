import { TextChannel } from "discord.js";
import { ParsedWindowsPerMember, HNMTypeChannelKeys } from "../models";
import { MessageWithDisplayName } from "../types/MessageData";
import { getDateDataFromUnixTimeStamp } from "./timeUtils";

export const channelHeaderRows = (channel: { name: string }) => {
    return buildHeaderRowsToDelimitedCSV(
        channel.name as unknown as string,
        0.25,
        2,
        0
    );
};

// NOTE: Assuming this gets fleshed out later on?
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

export const extractNumberAfterX = (s: string): number | null => {
    const regex = /^[xX]\s*(-)?\s*(\d+)/;
    const match = s.match(regex);

    if (match) {
        return parseInt(match[2], 10);
    } else {
        return null;
    }
};

export const validJobXinPattern =
    /^x.*?(scout|tod|blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b/i;
export const validXKillPatternTiamat =
    /x.*?(kill.*?(?:\b[a-z]{3}\b)|(?:\b[a-z]{3}\b).*?kill)/i;
export const validXKillPattern = /x.*kill/i;
export const validFirstXinPattern =
    /^x-?\s*(?:(?!(?<!sc)out\b)(?![0-9])([^(]\S+\s+scout|\w+(?:\s+\w+)*|\([^)]+\))?)?$/i;

export const channelMessagesToWindows = (
    channel: TextChannel & { messages: MessageWithDisplayName[] },
    popWindow?: number,
    validTiamatWindows?: number[]
): { windowsPerMember: ParsedWindowsPerMember; enkiResponse: string } => {

    const channelHNMTypeKey = extractMHNMPartOfChannelName(
        channel.name as string
    )?.replace(/\d/g, "") as HNMTypeChannelKeys | null;
    const windowsPerMember: ParsedWindowsPerMember = {};
    let enkiResponse: string = "Done.";

    switch (channelHNMTypeKey) {
        case "sim":
        case "shi":
        case "ka":
            {
                channel.messages.forEach((message) => {
                    let memberName =
                        message.memberDisplayName ??
                        message.author.globalName ??
                        message.author.username;
                    const messageContent = message.content.trim().toLocaleLowerCase();

                    const xInFor = extractXinForMember(messageContent);
                    const xOutFor = extractXOutFor(messageContent);

                    if (xInFor !== null) {
                        memberName = xInFor;
                    }

                    if (xOutFor !== null) {
                        memberName = xOutFor;
                    }

                    if (!windowsPerMember[memberName]) {
                        const windowNumberForXIn = extractNumberAfterX(messageContent);
                        // eg "x"
                        // todo: add admin :greencheck: check for scouts
                        if (
                            xInFor ||
                            messageContent === "x" ||
                            (messageContent.includes("x") &&
                                (messageContent.includes("scout") ||
                                    messageContent.includes("tod"))) ||
                            (windowNumberForXIn !== null && windowNumberForXIn > 0)
                        ) {
                            windowsPerMember[memberName] = {
                                windows: 1,
                                message: messageContent,
                                xClaim: true,
                                xKill: true,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
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
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }
                    }

                    // eg. "x-out"
                    if (xOutFor && windowsPerMember[memberName]) {
                        if (
                            messageContent.includes("x") &&
                            messageContent.includes("out") &&
                            !messageContent.includes("scout")
                        ) {
                            windowsPerMember[memberName] = {
                                windows: 1,
                                xClaim: false,
                                xKill: false,
                                message: `${windowsPerMember[memberName].message
                                    } -> ${messageContent.trim()}`,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }
                    }
                });

                return { windowsPerMember, enkiResponse };
            }
        case "tia":
            {
                const { validWindows, invalidWindows } = splitWindowsIntoValidInvalid(
                    channel,
                    validTiamatWindows
                );

                const invalidWindowsWithXIns = invalidWindows.filter((messages) =>
                    messages.some((msg) => {
                        return (
                            msg.memberDisplayName !== "Alise" && msg.content.includes("x-")
                        );
                    })
                );
                if (invalidWindowsWithXIns.length > 0) {
                    const invalidWindowNumbers: number[] = [];
                    invalidWindowsWithXIns.forEach((window) => {
                        let windowNumber = 0;
                        window.forEach((msg) => {
                            if (windowNumber > 0) return;
                            windowNumber = extractWindowNumber(msg.content);
                            if (windowNumber > 0) {
                                invalidWindowNumbers.push(windowNumber);
                            }
                        });
                    });

                    enkiResponse = `Found ${invalidWindowsWithXIns.length} invalid window${invalidWindowsWithXIns.length === 1 ? "" : "s"
                        } (#${invalidWindowNumbers.join(
                            ", #"
                        )}). Run the process command with 'valid-${invalidWindowNumbers.join(
                            "-"
                        )}' to process these windows.`;
                }

                let windowCheckedInMembers: string[] = [];
                validWindows.forEach((window, windowIndex) => {
                    let windowTimedOutForXIns = false;
                    let popMsgTimestamp = 0;
                    windowCheckedInMembers = [];
                    // FIXME: Find the type.
                    window.forEach((message: any) => {
                        const memberName =
                            message.memberDisplayName ??
                            message.author.globalName ??
                            message.author.username;

                        const messageContent = message.content.trim().toLocaleLowerCase();

                        const isLastWindow = windowIndex + 1 === validWindows.length;

                        if (memberName === "Alise") {
                            // BOT MSG
                            if (messageContent.includes("closed no more x-in")) {
                                windowTimedOutForXIns = true;
                            }

                            if (!windowTimedOutForXIns && messageContent.includes("pop")) {
                                popMsgTimestamp =
                                    new Date(message.createdTimestamp).getTime() + 60000; // add 60 seconds to POP msg if executed before no more x-in
                            }

                            return;
                        }

                        if (windowCheckedInMembers.includes(memberName)) {
                            return;
                        }

                        if (windowTimedOutForXIns && !isLastWindow) {
                            return;
                        }

                        if (
                            !windowTimedOutForXIns &&
                            (!popMsgTimestamp ||
                                new Date(message.createdTimestamp).getTime() < popMsgTimestamp) &&
                            validJobXinPattern.test(messageContent)
                        ) {
                            if (!windowsPerMember[memberName]) {
                                windowsPerMember[memberName] = {
                                    windows: 1,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: isLastWindow, // is checked for claimed flag Tiamat at final step to get credit
                                    xKill: isLastWindow,
                                    timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                                };
                            } else {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].windows += 1;
                                windowsPerMember[memberName].xClaim = isLastWindow;
                                windowsPerMember[memberName].xKill = isLastWindow;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp = getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                );
                            }
                        } else if (
                            (validXKillPatternTiamat.test(messageContent) ||
                                validJobXinPattern.test(messageContent)) && // allow for x-job to be treated like x-kill in case they x-'ed in past the 60sec cut off
                            isLastWindow
                        ) {
                            // Can x-kill after windowTimedOutForXIns and isLastWindow
                            if (!windowsPerMember[memberName]) {
                                windowsPerMember[memberName] = {
                                    windows: 0,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: false,
                                    xKill: true,
                                    timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                                };
                            } else {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].xClaim = false;
                                windowsPerMember[memberName].xKill = true;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp = getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                );
                            }
                        }
                    });
                });

                return { windowsPerMember, enkiResponse };
            }
        case "beh":
        case "faf":
        case "ada":
            {
                const isKingsChannel = true;
                const windows = splitMessagesIntoWindows(
                    channel.messages,
                    isKingsChannel
                );

                const popWindowMessage = channel.messages.find((msg) =>
                    msg.content.includes("POP: Window")
                );

                const { windowNumber: totalWindows, claimLSName } = popWindow
                    ? { windowNumber: popWindow, claimLSName: "NA" }
                    : popWindowMessage
                        ? extractWindowInfo(popWindowMessage.content)
                        : { windowNumber: 7, claimLSName: "Unknown" };

                const firstWindowMessage = windows[1][0].content.toLocaleLowerCase();
                const notFirstWindowAdjuster =
                    extractWindowNumber(firstWindowMessage) - 1;

                windows.forEach((window, windowIndex) => {
                    window.forEach((message: any) => {
                        let memberName =
                            message.memberDisplayName ??
                            message.author.globalName ??
                            message.author.username;
                        if (memberName === "Alise") return;

                        const messageContent = message.content.trim().toLocaleLowerCase();
                        const xInFor = extractXinForMember(messageContent);
                        const xOutFor = extractXOutFor(messageContent);

                        if (xInFor !== null) {
                            memberName = xInFor;
                        }

                        if (xOutFor !== null) {
                            memberName = xOutFor;
                        }

                        const isXOut =
                            messageContent.includes("x") &&
                            messageContent.includes("out") &&
                            !messageContent.includes("scout");

                        const validXKill = validXKillPattern.test(messageContent);

                        const windowNumberForXIn = extractNumberAfterX(messageContent);
                        const firstWindowXIn = validFirstXinPattern.test(messageContent);

                        // eg "x" or "x1"
                        if (
                            !validXKill &&
                            (firstWindowXIn ||
                                xInFor ||
                                (windowNumberForXIn === 1 && !windowsPerMember[memberName]))
                        ) {
                            windowsPerMember[memberName] = {
                                windows: totalWindows - notFirstWindowAdjuster,
                                message: messageContent,
                                xClaim: true,
                                xKill: true,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }

                        // eg "x2" "x 3" "X2 darkfarkee"
                        if (
                            !validXKill &&
                            !isXOut &&
                            !firstWindowXIn &&
                            windowNumberForXIn &&
                            windowNumberForXIn > 1
                        ) {
                            windowsPerMember[memberName] = {
                                windows: totalWindows + -(windowNumberForXIn - 1),
                                message: messageContent,
                                checkForError: false,
                                xClaim: true,
                                xKill: true,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }

                        // eg "x-out" "xout" "x out"
                        if ((isXOut || xOutFor) && windowsPerMember[memberName]) {
                            // TODO: Heavy testing here on x-outs. Sigh.
                            // if (memberName === "Koobu") {
                            //   console.log({
                            //     memberName,
                            //     windowIndex,
                            //     w: windowsPerMember[memberName].windows,
                            //   });
                            // }
                            windowsPerMember[memberName].xOutWindow = windowIndex;
                            windowsPerMember[memberName].xClaim = false; // X-out will always force x-claim to false
                            windowsPerMember[memberName].xKill = false; // X-out will always force x-kill to false
                            const lateXInDiff =
                                totalWindows - windowsPerMember[memberName].windows;
                            windowsPerMember[memberName].windows = windowIndex - lateXInDiff; // index is 0 based, so +1 to adjust to window number. X-out happens after the last window process so +1 to adjust for that.
                            windowsPerMember[memberName].timestamp = getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString();
                            windowsPerMember[
                                memberName
                            ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                        }
                        // eg "x-kill" "xkill" "x kill"
                        if (validXKill) {
                            windowsPerMember[memberName] = {
                                windows: 0,
                                message: messageContent,
                                xKill: true,
                                xClaim: false, // x-kill only forces x-claim false
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }
                    });
                });
                // console.log({ windowsPerMember });
                return { windowsPerMember, enkiResponse };
            }
        case "kv":
            {
                channel.messages.forEach((message) => {
                    const memberName =
                        message.memberDisplayName ??
                        message.author.globalName ??
                        message.author.username;
                    const messageContent = message.content.trim().toLocaleLowerCase();
                    // eg "x"  "x forgot" "x-forgot" "x Barrymckonichon"
                    if (
                        messageContent === "x" ||
                        (validFirstXinPattern.test(messageContent) &&
                            !messageContent.includes("kill")) ||
                        (messageContent.includes("x") && messageContent.includes("forgot")) // todo: do we want an amdin check for forgot like for scouts?
                    ) {
                        windowsPerMember[memberName] = {
                            windows: 1,
                            message: messageContent,
                            xClaim: true,
                            xKill: false,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                        };
                    }

                    // eg "x-kill" "xkill" "x kill"
                    const validXKill = validXKillPattern.test(messageContent);

                    if (validXKill) {
                        console.log({ validXKill, memberName, messageContent });
                    } else if (!validXKill) {
                        console.log({ validXKill, memberName, messageContent });
                    }

                    if (validXKill) {
                        if (windowsPerMember[memberName]) {
                            // must have had an "x" prior to the "x-kill"
                            windowsPerMember[memberName].xKill = true;
                        } else {
                            // x-kill without camping / claim credit
                            windowsPerMember[memberName] = {
                                windows: 0,
                                message: messageContent,
                                xKill: true,
                                xClaim: false,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }
                    }
                });

                return { windowsPerMember, enkiResponse };
            }
        case "jorm":
        case "vrt":
        case "vrtra":
            {
                channel.messages.forEach((message) => {
                    let memberName =
                        message.memberDisplayName ??
                        message.author.globalName ??
                        message.author.username;
                    const messageContent = message.content.trim().toLocaleLowerCase();

                    const xInFor = extractXinForMember(messageContent);
                    const xOutFor = extractXOutFor(messageContent);

                    if (xInFor !== null) {
                        memberName = xInFor;
                    }

                    if (xOutFor !== null) {
                        memberName = xOutFor;
                    }

                    if (!windowsPerMember[memberName]) {
                        // eg "x"
                        // todo: add admin :greencheck: check for scouts
                        if (
                            !messageContent.includes("kill") && // not x-kill
                            (messageContent.includes("x") || xInFor) // x or x-for
                        ) {
                            windowsPerMember[memberName] = {
                                windows: 1,
                                message: messageContent,
                                xClaim: true,
                                xKill: true,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                            // eg "x forgot" "x-forgot"
                        }
                    }
                    // x-kill
                    if (messageContent.includes("x-kill")) {
                        windowsPerMember[memberName] = {
                            windows: 0,
                            message: messageContent,
                            xClaim: false,
                            xKill: true,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                        };
                        // eg "x forgot" "x-forgot"
                    }
                    // eg. "x-out"
                    if (windowsPerMember[memberName]) {
                        if (
                            (messageContent.includes("x") &&
                                messageContent.includes("out") &&
                                !messageContent.includes("scout")) ||
                            xOutFor
                        ) {
                            windowsPerMember[memberName] = {
                                windows: 1,
                                xClaim: false,
                                xKill: false,
                                message: `${windowsPerMember[memberName].message
                                    } -> ${messageContent.trim()}`,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(message.createdTimestamp).toString(),
                            };
                        }
                    }
                });
                return { windowsPerMember, enkiResponse };
            }
        default:
            return { windowsPerMember, enkiResponse };
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
    channel: TextChannel & { messages: MessageWithDisplayName[] },
    validTiamatWindows?: number[]
) => {
    const messagesByWindow = splitMessagesIntoWindows(channel.messages);

    const validWindows = messagesByWindow.filter((msgs) => {
        const windowNumber = extractWindowNumber(msgs[0].content);
        console.log("windowNumber", windowNumber);
        return (
            validTiamatWindows?.includes(windowNumber) ||
            checkIfValidClaimWindowForTiamat(msgs)
        );
    });

    const invalidWindows = messagesByWindow.filter((msgs) => {
        const windowNumber = extractWindowNumber(msgs[0].content);
        return (
            !validTiamatWindows?.includes(windowNumber) &&
            !checkIfValidClaimWindowForTiamat(msgs)
        );
    });

    console.log({
        validTiamatWindows,
        i: invalidWindows.length,
        v: validWindows.length,
    });

    return {
        validWindows,
        invalidWindows,
    };
};

const extractWindowNumber = (input: string): number => {
    const regex = /-*window\s(\d+)-*/i;
    const match = input.match(regex);

    if (match && match[1]) {
        return parseInt(match[1], 10);
    } else {
        return 0;
    }
};

const splitMessagesIntoWindows = (
    messages: Array<{ content: string; memberDisplayName?: string }>,
    isKingsChannel: boolean = false
): Array<Array<{ content: string; memberDisplayName?: string }>> => {
    const windowPattern = /--\sWindow\s\d/i;
    // Use reduce to build up our result array
    return messages.reduce(
        (
            acc: Array<Array<{ content: string; memberDisplayName?: string }>>,
            msg: { content: string; memberDisplayName?: string }
        ) => {
            if (
                msg.content.includes("in 5-Minutes x-in") ||
                (isKingsChannel && windowPattern.test(msg.content.toLocaleLowerCase()))
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
    messages: Array<{ content: string; memberDisplayName?: string }>
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

export function extractMHNMPartOfChannelName(text: string): string {
    const words = [
        "vrtra",
        "vrt",
        "jorm",
        "ka",
        "kv",
        "faf",
        "ada",
        "tia",
        "shi",
        "sim",
        "beh",
    ];

    for (const word of words) {
        const searchStr = `-${word}`;
        if (text.includes(searchStr)) {
            return word;
        }
    }
    return "";
}

export const extractDayNumberAfterKing = (s: string): number | null => {
    const strings = ["ada", "beh", "faf"];

    const regexPattern = `^(?:\\w{3}\\d+-)?(?:${strings.join("|")})(\\d+)`;
    const regex = new RegExp(regexPattern, "i");

    const match = s.match(regex);

    if (match) {
        return parseInt(match[1], 10);
    } else {
        return null;
    }
};

export const extractXinForMember = (input: string): string | null => {
    const regex = /x-for-([a-z]+)/i;

    const match = regex.exec(input);

    if (match && match[1]) {
        return match[1];
    }

    return null;
};

export const extractXOutFor = (input: string): string | null => {
    const regex = /x-out-for-([a-z]+)/i;

    const match = regex.exec(input);

    if (match && match[1]) {
        return match[1];
    }

    return null;
};
