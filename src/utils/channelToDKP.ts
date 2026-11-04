import { TextChannel } from "discord.js";
import { ParsedWindowsPerMember, HNMTypeChannelKeys } from "../models";
import { MessageWithDisplayName } from "../types/MessageData";
import { getDateDataFromUnixTimeStamp } from "./timeUtils";
import { matchesGlob } from "node:path";

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

export const extractNumberAfterXAlt = (s: string): number | null => {
    const regex = /^[xX]\s*(-alt)?\s*(\d+)/;
    const match = s.match(regex);

    if (match) {
        return parseInt(match[2], 10);
    } else {
        return null;
    }
};

export type XMsgType =
    | "X"
    | "X-POP"
    | "X-ALT-POP"
    | "X-KILL"
    | "X-ALT-KILL"
    | "X-CLAIM"
    | "X-ALT-CLAIM"
    | "X-OUT"
    | "X-SCOUT"
    | "INVALID"
    | "X-ALT";

const getMessageType: (message: string) => XMsgType = (message) => {
    const msg = message.toLocaleLowerCase().trim();
    // TODO: Make less strict and use in diff HNM types. For now this is for KV only
    switch (true) {
        case msg === "x-pop":
            return "X-POP";
        case msg === "x-alt-pop":
            return "X-ALT-POP";
        case msg === "x-kill" || validXKillPattern.test(msg):
            return "X-KILL";
        case msg === "x-alt-kill" || validXAltKillPattern.test(msg):
            return "X-ALT-KILL";
        case msg === "x-claim":
            return "X-CLAIM";
        case msg === "x-alt-claim":
            return "X-ALT-CLAIM";
        case msg === "x-out":
            return "X-OUT";
        case msg === "x-scout":
            return "X-SCOUT";
        case msg === "x-forgot":
        case msg === "x":
            return "X";
        case msg === "x-alt":
            return "X-ALT";
        case (validFirstXinPattern.test(msg) && !validFirstXAltPattern.test(msg) && !msg.includes("kill")) ||
            (msg.includes("x") && msg.includes("forgot")):
            return "X";
        case (validFirstXAltPattern.test(msg) && !msg.includes("kill")) ||
            (msg.includes("x") && msg.includes("forgot")):
            return "X-ALT";
        default:
            return "INVALID";
    }
};

export const validJobXinPattern =
    /^x.*?(scout|tod|blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b/i;
export const validJobXAltinPattern =
    /^x-alt.*?(scout|tod|blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b/i;
export const validJobXinNoPaddingPattern =
    /^x-*?(blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b$/i;
export const validJobXinSpacePaddingPattern =
    /^x\s-\s*?(blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b$/i;
export const validJobXAltinNoPaddingPattern =
    /^x\s-\salt\s-\s*?(blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b$/i;
export const validJobXAltinSpacePaddingPattern =
    /^x\s-alt-\s*?(blm|rdm|whm|rng|sam|nin|mnk|war|bst|drk|pld|brd|smn|drg|thf)\b$/i;
export const validXKillPatternTiamat =
    /x.*?(kill.*?(?:\b[a-z]{3}\b)|(?:\b[a-z]{3}\b).*?kill)/i;
export const validXAltKillPatternTiamat =
    /x-alt.*?(kill.*?(?:\b[a-z]{3}\b)|(?:\b[a-z]{3}\b).*?kill)/i;
export const validXKillPattern = /x.*kill/i;
export const validXAltKillPattern = /x-alt.*kill/i;
export const validFirstXinPattern =
    /^x-?\s*(?:(?!(?<!sc)out\b)(?![0-9])([^(]\S+\s+scout|\w+(?:\s+\w+)*|\([^)]+\))?)?$/i;
export const validFirstXAltPattern =
    /^x-alt-?\s*(?:(?!(?<!sc)out\b)(?![0-9])([^(]\S+\s+scout|\w+(?:\s+\w+)*|\([^)]+\))?)?$/i;

export const channelMessagesToWindows = (
    channel: TextChannel & { messages: MessageWithDisplayName[] },
    popWindow?: number,
    validTiamatWindows?: number[],
    validTOAUWindows?: number[]
): { windowsPerMember: ParsedWindowsPerMember; enkiResponse: string } => {
    const channelHNMTypeKey = extractMHNMPartOfChannelName(
        channel.name as string
    )?.replace(/\d/g, "") as HNMTypeChannelKeys | null;
    const windowsPerMember: ParsedWindowsPerMember = {};
    let enkiResponse: string = "Done.";
    const altCampMember = new Map<string, boolean>();

    const memberOnlyMessages = channel.messages.filter((msg) => !msg.author.bot);

    switch (channelHNMTypeKey) {
        case "bs":
        case "sim":
        case "shi":
        case "ka": {
            memberOnlyMessages.forEach((message) => {
                let memberName =
                    message.memberDisplayName ??
                    message.author.globalName ??
                    message.author.username;
                const messageContent = message.content.trim().toLocaleLowerCase();

                const xInFor = extractXinForMember(messageContent);
                const xAltFor = extractXAltForMember(messageContent);
                const xOutFor = extractXOutFor(messageContent);
                const xAltOutFor = extractXAltOutFor(messageContent);

                if (xInFor !== null) {
                    memberName = xInFor;
                }

                if (xAltFor !== null) {
                    memberName = xAltFor;
                }

                if (xOutFor !== null) {
                    memberName = xOutFor;
                }

                if (xAltOutFor !== null) {
                    memberName = xAltOutFor;
                }

        if (!windowsPerMember[memberName] || (windowsPerMember[memberName] && altCampMember.get(memberName) && !messageContent.includes("alt"))) {
          const windowNumberForXIn = extractNumberAfterX(messageContent);
          // eg "x"
          // todo: add admin :greencheck: check for scouts
          if (
            (xInFor && !xAltFor) ||
            messageContent === "x" ||
            (messageContent.includes("x") && !messageContent.includes("x-alt") &&
              (messageContent.includes("scout") ||
                messageContent.includes("tod"))) ||
            (windowNumberForXIn !== null && windowNumberForXIn > 0)
          ) 
          if (altCampMember.get(memberName)) {
            windowsPerMember[memberName] = {
              windows: 1.5, // Include the 0.5 from x-alt
              message: messageContent,
              xClaim: true,
              xKill: true,
              checkForError: false,
              timestamp: getDateDataFromUnixTimeStamp(
                message.createdTimestamp
              ).toString(),
              } 
            } else {
              windowsPerMember[memberName] = {
                windows: 1, // Overwrites the 0.5 from x-alt
                message: messageContent,
                xClaim: true,
                xKill: true,
                checkForError: false,
                timestamp: getDateDataFromUnixTimeStamp(
                  message.createdTimestamp
                ).toString(),
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
              timestamp: getDateDataFromUnixTimeStamp(
                message.createdTimestamp
              ).toString(),
            };
          }
        }

                if (!windowsPerMember[memberName]) {
                    const windowNumberForXAlt = extractNumberAfterXAlt(messageContent);
                    // eg "x-alt"
                    // todo: add admin :greencheck: check for scouts
                    if (
                        xAltFor ||
                        messageContent === "x-alt" ||
                        (messageContent.includes("x-alt") &&
                            (messageContent.includes("scout") ||
                                messageContent.includes("tod"))) ||
                        (windowNumberForXAlt !== null && windowNumberForXAlt > 0)
                    ) {
                        windowsPerMember[memberName] = {
                            windows: 0.5,
                            message: messageContent,
                            xClaim: true,
                            xKill: true,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                        altCampMember.set(memberName, true)
                        // eg "x forgot" "x-forgot"
                    } else if (
                        messageContent.includes("x-alt") &&
                        messageContent.includes("forgot")
                    ) {
                        windowsPerMember[memberName] = {
                            windows: 0.5,
                            xClaim: true,
                            xKill: true,
                            message: messageContent,
                            checkForError: true,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                        altCampMember.set(memberName, true)
                    }
                }

                // eg. "x-out"
                if ((xOutFor || xAltOutFor) && windowsPerMember[memberName]) {
                    if (
                        messageContent.includes("x") &&
                        messageContent.includes("out") &&
                        !messageContent.includes("scout")
                    ) {
                        windowsPerMember[memberName] = {
                            windows: 0,
                            xClaim: false,
                            xKill: false,
                            message: `${windowsPerMember[memberName].message
                                } -> ${messageContent.trim()}`,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                }
            });

            return { windowsPerMember, enkiResponse };
        }
        case "tia": {
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

                    // console.log({
                    //   memberName,
                    //   windowIndex,
                    //   validJobXinPattern: validJobXinPattern.test(messageContent),
                    //   validJobXAltinPattern: validJobXAltinPattern.test(messageContent),
                    // });

                    if ( // x-job
                        !windowTimedOutForXIns &&
                        (!popMsgTimestamp ||
                            new Date(message.createdTimestamp).getTime() < popMsgTimestamp) &&
                        validJobXinPattern.test(messageContent)
                    ) {
                        if (!windowsPerMember[memberName]) {
                            if (messageContent.includes("alt")) {
                                windowsPerMember[memberName] = {
                                    windows: 0.5,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: isLastWindow, // is checked for claimed flag Tiamat at final step to get credit
                                    xKill: isLastWindow,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            } else {
                                windowsPerMember[memberName] = {
                                    windows: 1,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: isLastWindow, // is checked for claimed flag Tiamat at final step to get credit
                                    xKill: isLastWindow,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            }
                        } else {
                            if (messageContent.includes("alt")) {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].windows += 0.5;
                                windowsPerMember[memberName].xClaim = isLastWindow;
                                windowsPerMember[memberName].xKill = isLastWindow;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp =
                                    getDateDataFromUnixTimeStamp(message.createdTimestamp);
                            } else {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].windows += 1;
                                windowsPerMember[memberName].xClaim = isLastWindow;
                                windowsPerMember[memberName].xKill = isLastWindow;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp =
                                    getDateDataFromUnixTimeStamp(message.createdTimestamp);
                            }
                        }
                    } else if (
                        (validXKillPatternTiamat.test(messageContent) ||
                            validXAltKillPatternTiamat.test(messageContent) ||
                            validJobXinPattern.test(messageContent)) && // allow for x-job and x-alt-job to be treated like x-kill in case they x-'ed in past the 60sec cut off
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
                                timestamp: getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                ).toString(),
                            };
                        } else {
                            windowCheckedInMembers.push(memberName);
                            windowsPerMember[memberName].xClaim = false;
                            windowsPerMember[memberName].xKill = true;
                            windowsPerMember[
                                memberName
                            ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                            windowsPerMember[memberName].timestamp =
                                getDateDataFromUnixTimeStamp(message.createdTimestamp);
                        }
                    }
                });
            });

            return { windowsPerMember, enkiResponse };
        }
        case "cer":
        case "hyd":
        case "khi": {
            const { validWindows, invalidWindows } = splitTOAUWindowsIntoValidInvalid(
                channel,
                validTOAUWindows
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

                    // console.log({
                    //   memberName,
                    //   windowIndex,
                    //   validJobXinPattern: validJobXinPattern.test(messageContent),
                    //   validJobXAltinPattern: validJobXAltinPattern.test(messageContent),
                    // });

                    if ( // x-job
                        !windowTimedOutForXIns &&
                        (!popMsgTimestamp ||
                            new Date(message.createdTimestamp).getTime() < popMsgTimestamp) &&
                        validJobXinPattern.test(messageContent)
                    ) {
                        if (!windowsPerMember[memberName]) {
                            if (messageContent.includes("alt")) {
                                windowsPerMember[memberName] = {
                                    windows: 0.5,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: isLastWindow, // is checked for claimed flag Tiamat at final step to get credit
                                    xKill: isLastWindow,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            } else {
                                windowsPerMember[memberName] = {
                                    windows: 1,
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: isLastWindow, // is checked for claimed flag Tiamat at final step to get credit
                                    xKill: isLastWindow,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            }
                        } else {
                            if (messageContent.includes("alt")) {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].windows += 0.5;
                                windowsPerMember[memberName].xClaim = isLastWindow;
                                windowsPerMember[memberName].xKill = isLastWindow;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp =
                                    getDateDataFromUnixTimeStamp(message.createdTimestamp);
                            } else {
                                windowCheckedInMembers.push(memberName);
                                windowsPerMember[memberName].windows += 1;
                                windowsPerMember[memberName].xClaim = isLastWindow;
                                windowsPerMember[memberName].xKill = isLastWindow;
                                windowsPerMember[
                                    memberName
                                ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                                windowsPerMember[memberName].timestamp =
                                    getDateDataFromUnixTimeStamp(message.createdTimestamp);
                            }
                        }
                    } else if (
                        (validXKillPatternTiamat.test(messageContent) ||
                            validXAltKillPatternTiamat.test(messageContent) ||
                            validJobXinPattern.test(messageContent)) && // allow for x-job and x-alt-job to be treated like x-kill in case they x-'ed in past the 60sec cut off
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
                                timestamp: getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                ).toString(),
                            };
                        } else {
                            windowCheckedInMembers.push(memberName);
                            windowsPerMember[memberName].xClaim = false;
                            windowsPerMember[memberName].xKill = true;
                            windowsPerMember[
                                memberName
                            ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                            windowsPerMember[memberName].timestamp =
                                getDateDataFromUnixTimeStamp(message.createdTimestamp);
                        }
                    }
                });
            });

            return { windowsPerMember, enkiResponse };
        }

        case "beh":
        case "faf":
        case "ada": {
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
                    const xAltFor = extractXAltForMember(messageContent);
                    const xOutFor = extractXOutFor(messageContent);
                    const xAltOutFor = extractXAltOutFor(messageContent);

                    if (xInFor !== null) {
                        memberName = xInFor;
                    }

                    if (xAltFor !== null) {
                        memberName = xAltFor;
                    }

                    if (xOutFor !== null) {
                        memberName = xOutFor;
                    }

                    if (xAltOutFor !== null) {
                        memberName = xAltOutFor;
                    }

                    const isXOut =
                        messageContent.includes("x") &&
                        messageContent.includes("out") &&
                        !messageContent.includes("scout") &&
                        !messageContent.includes("alt");

                    const isXAltOut =
                        messageContent.includes("x") &&
                        messageContent.includes("alt") &&
                        messageContent.includes("out") &&
                        !messageContent.includes("scout");

                    const isAltMessage = messageContent.includes("alt")

                    const validXKill = validXKillPattern.test(messageContent);
                    const validXAltKill = validXAltKillPattern.test(messageContent);

                    const windowNumberForXIn = extractNumberAfterX(messageContent);
                    const windowNumberForXAlt = extractNumberAfterXAlt(messageContent);
                    const firstWindowXIn = validFirstXinPattern.test(messageContent);
                    const firstWindowXAlt = validFirstXAltPattern.test(messageContent);

                    // eg "x" or "x1"
                    if (!isAltMessage) {
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
                                timestamp: getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                ).toString(),
                            };
                        }
                    }

                    if (isAltMessage) {
                        // eg "x-alt" or "x-alt1"
                        if (
                            !validXAltKill &&
                            (firstWindowXAlt || // Change to firstWindowXAltIn?
                                xAltFor ||
                                (windowNumberForXAlt === 1 && !windowsPerMember[memberName]))
                        ) {
                            windowsPerMember[memberName] = {
                                windows: (totalWindows - notFirstWindowAdjuster) / 2,
                                message: messageContent,
                                xClaim: true,
                                xKill: true,
                                checkForError: false,
                                timestamp: getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                ).toString(),
                            };
                            altCampMember.set(memberName, true)
                        }
                    }

                    // eg "x2" "x 3" "X2 darkfarkee"
                    if (!isAltMessage || (!isAltMessage && altCampMember.get(memberName))) {
                        if (
                            !validXKill &&
                            !isXOut &&
                            !firstWindowXIn &&
                            windowNumberForXIn &&
                            windowNumberForXIn > 1
                        ) {
                            if (!altCampMember.get(memberName)) {
                                windowsPerMember[memberName] = {
                                    windows: totalWindows + -(windowNumberForXIn - 1),
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: true,
                                    xKill: true,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            }
                            if (altCampMember.get(memberName)) {
                                // console.log({
                                //   memberName,
                                //   windowIndex,
                                //   w: windowsPerMember[memberName].windows,
                                // });
                                windowsPerMember[memberName] = {
                                    windows: (windowsPerMember[memberName].windows / 2) + totalWindows + -(windowNumberForXIn - 1),
                                    message: messageContent,
                                    checkForError: false,
                                    xClaim: true,
                                    xKill: true,
                                    timestamp: getDateDataFromUnixTimeStamp(
                                        message.createdTimestamp
                                    ).toString(),
                                };
                            }
                        }
                    }

                    // eg "x-alt2" "x-alt 3" "X-alt2 darkfarkee"
                    if (isAltMessage) {
                        if (
                            !validXAltKill &&
                            !isXOut &&
                            !firstWindowXAlt && // Change to firstWindowXAltIn?
                            windowNumberForXAlt &&
                            windowNumberForXAlt > 1
                        ) {
                            windowsPerMember[memberName] = {
                                windows: (totalWindows + -(windowNumberForXAlt - 1)) / 2,
                                message: messageContent,
                                checkForError: false,
                                xClaim: true,
                                xKill: true,
                                timestamp: getDateDataFromUnixTimeStamp(
                                    message.createdTimestamp
                                ).toString(),
                            };
                        }
                    }

                    // eg "x-out" "xout" "x out"
                    if ((isXOut || xOutFor || isXAltOut || xAltOutFor) && windowsPerMember[memberName]) {
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
                        // x-out
                        if (isXOut || xOutFor) {
                            const lateXInDiff =
                                totalWindows - windowsPerMember[memberName].windows;
                            windowsPerMember[memberName].windows = windowIndex - lateXInDiff; // index is 0 based, so +1 to adjust to window number. X-out happens after the last window process so +1 to adjust for that.
                        }
                        if (isXAltOut || xAltOutFor) {
                            // console.log({
                            //   memberName,
                            //   windowIndex,
                            //   w: windowsPerMember[memberName].windows,
                            // });
                            const lateXInDiff =
                                totalWindows - windowsPerMember[memberName].windows;
                            windowsPerMember[memberName].windows = windowIndex - lateXInDiff + 0.5; // index is 0 based, so +1 to adjust to window number. X-out happens after the last window process so +1 to adjust for that.
                        }
                        // x-alt-out
                        windowsPerMember[memberName].timestamp =
                            getDateDataFromUnixTimeStamp(message.createdTimestamp).toString();
                        windowsPerMember[
                            memberName
                        ].message = `${windowsPerMember[memberName].message} | ${messageContent}`;
                    }
                    // eg "x-kill" "xkill" "x kill"
                    if (validXKill || validXAltKill) {
                        windowsPerMember[memberName] = {
                            windows: 0,
                            message: messageContent,
                            xKill: true,
                            xClaim: false, // x-kill only forces x-claim false
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                });
            });
            // console.log({ windowsPerMember });
            return { windowsPerMember, enkiResponse };
        }
        case "kv": {
            memberOnlyMessages.forEach((message) => {
                const memberName =
                    message.memberDisplayName ??
                    message.author.globalName ??
                    message.author.username;
                const messageContent = message.content.trim().toLocaleLowerCase();

                const messageType = getMessageType(messageContent);

                if (messageType === "X") {
                    windowsPerMember[memberName] = {
                        windows: 1,
                        message: messageContent,
                        xClaim: false,
                        xKill: false,
                        checkForError: false,
                        timestamp: getDateDataFromUnixTimeStamp(
                            message.createdTimestamp
                        ).toString(),
                    };
                }

                if (messageType === "X-ALT") {
                    windowsPerMember[memberName] = {
                        windows: 0.5,
                        message: messageContent,
                        xClaim: false,
                        xKill: false,
                        checkForError: false,
                        timestamp: getDateDataFromUnixTimeStamp(
                            message.createdTimestamp
                        ).toString(),
                    };
                }
                // x in DKP down to .5
                // NEW x-pop grants 1 additional DKP for being present in the alliance when KV popped but was claimed by another group
                // x + x-pop for a total of 1.5 DKP
                // NEW x-claim grants 2.5 additional DKP for being present in the alliance and claiming KV for WD
                // x + x-claim for a total of 3 DKP
                // x-kill no change, still grants an additional 2 point to anyone who kills it
                // x + x-claim + x-kill will give a total of 5 DKP
                if (messageType === "X-POP") {
                    windowsPerMember[memberName] = {
                        windows: 3,
                        message: messageContent,
                        xClaim: false,
                        xKill: false,
                        checkForError: false,
                        timestamp: getDateDataFromUnixTimeStamp(
                            message.createdTimestamp
                        ).toString(),
                    };
                }

                if (messageType === "X-ALT-POP") {
                    windowsPerMember[memberName] = {
                        windows: 1.5,
                        message: messageContent,
                        xClaim: false,
                        xKill: false,
                        checkForError: false,
                        timestamp: getDateDataFromUnixTimeStamp(
                            message.createdTimestamp
                        ).toString(),
                    };
                }

                if (messageType === "X-CLAIM") {
                    if (windowsPerMember[memberName]) {
                        windowsPerMember[memberName].windows = 1;
                        windowsPerMember[memberName].xClaim = true;
                    } else {
                        windowsPerMember[memberName] = {
                            windows: 1, // Back to normal, only use 3 windows to hack the "1.5" points on non-claimed pop
                            message: messageContent,
                            xClaim: true,
                            xKill: false,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                }

                if (messageType === "X-ALT-CLAIM") {
                    if (windowsPerMember[memberName]) {
                        windowsPerMember[memberName].windows = 1;
                        windowsPerMember[memberName].xClaim = true;
                    } else {
                        windowsPerMember[memberName] = {
                            windows: 0.5, // Back to normal, only use 3 windows to hack the "0.75" points on non-claimed pop
                            message: messageContent,
                            xClaim: true,
                            xKill: false,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                }

                if (messageType === "X-KILL" || messageType === "X-ALT-KILL") {
                    // must have had an "x" prior to the "x-kill"
                    if (windowsPerMember[memberName]) {
                        windowsPerMember[memberName].xKill = true;
                    } else {
                        // x-kill without camping / claim credit
                        windowsPerMember[memberName] = {
                            windows: 0,
                            message: messageContent,
                            xKill: true,
                            xClaim: false,
                            checkForError: false,
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                }

                // eg. "x-out"
                if (windowsPerMember[memberName]) {
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
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
                        };
                    }
                }
            });

            return { windowsPerMember, enkiResponse };
        }
        case "jorm":
        case "vrt":
        case "vrtra": {
            memberOnlyMessages.forEach((message) => {
                let memberName =
                    message.memberDisplayName ??
                    message.author.globalName ??
                    message.author.username;
                const messageContent = message.content.trim().toLocaleLowerCase();

                const xInFor = extractXinForMember(messageContent);
                const xOutFor = extractXOutFor(messageContent);
                const xAltOutFor = extractXAltOutFor(messageContent);

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
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
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
                        timestamp: getDateDataFromUnixTimeStamp(
                            message.createdTimestamp
                        ).toString(),
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
                            timestamp: getDateDataFromUnixTimeStamp(
                                message.createdTimestamp
                            ).toString(),
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

const splitTOAUWindowsIntoValidInvalid = (
    channel: TextChannel & { messages: MessageWithDisplayName[] },
    validTOAUWindows?: number[]
) => {
    const messagesByWindow = splitMessagesIntoWindows(channel.messages);

    const validWindows = messagesByWindow.filter((msgs) => {
        const windowNumber = extractWindowNumber(msgs[0].content);
        console.log("windowNumber", windowNumber);
        return (
            validTOAUWindows?.includes(windowNumber) ||
            checkIfValidClaimWindowForTOAU(msgs)
        );
    });

    const invalidWindows = messagesByWindow.filter((msgs) => {
        const windowNumber = extractWindowNumber(msgs[0].content);
        return (
            !validTOAUWindows?.includes(windowNumber) &&
            !checkIfValidClaimWindowForTOAU(msgs)
        );
    });

    console.log({
        validTOAUWindows,
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

    // console.log({
    //   hasTank: hasTank,
    //   hasWHM: hasWHM,
    //   hasBRD: hasBRD,
    //   hasSleeper: hasSleeper,
    // });

    const hasSixPlus =
        messages.filter((msg) => msg.content.match(validJobXinNoPaddingPattern)).length > 6 ||
        messages.filter((msg) => msg.content.match(validJobXinSpacePaddingPattern)).length > 6 ||
        messages.filter((msg) => msg.content.match(validJobXAltinNoPaddingPattern)).length > 6 ||
        messages.filter((msg) => msg.content.match(validJobXAltinSpacePaddingPattern)).length > 6;

    // console.log({
    //   hasSixPlus: hasSixPlus,
    // });

    return hasTank && hasWHM && hasBRD && (hasSixPlus || hasSleeper);
};

const checkIfValidClaimWindowForTOAU = (
    messages: Array<{ content: string; memberDisplayName?: string }>
) => {
    const tankPattern = /x.*?(pld|nin|drk)/i;
    const whmPattern = /x.*?(whm)/i;
    const brdPattern = /x.*?(brd)/i;
    const rdmPattern = /x.*?(rdm)/i;

    const hasTank = messages.some((msg) => tankPattern.test(msg.content));
    const hasWHM = messages.some((msg) => whmPattern.test(msg.content));
    const hasBRD = messages.some((msg) => brdPattern.test(msg.content));
    const hasRDM = messages.some((msg) => rdmPattern.test(msg.content));

    // console.log({
    //   hasTank: hasTank,
    //   hasWHM: hasWHM,
    //   hasBRD: hasBRD,
    //   hasRDM: hasRDM,
    // });

    return hasTank && hasWHM && hasBRD && hasRDM;
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
        "bs",
        "faf",
        "ada",
        "tia",
        "shi",
        "sim",
        "beh",
        "cer",
        "hyd",
        "khi",
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

export const extractXAltForMember = (input: string): string | null => {
    const regex = /x-alt-for-([a-z]+)/i;

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

export const extractXAltOutFor = (input: string): string | null => {
    const regex = /x-alt-out-for-([a-z]+)/i;

    const match = regex.exec(input);

    if (match && match[1]) {
        return match[1];
    }

    return null;
};
