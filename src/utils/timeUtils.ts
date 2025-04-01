//const { tzOffset } = require("../config.json");

export function parseTime(hnm: string, timeStamp: string): string | null {
    let unixTimestamp: string | null;

    if (timeStamp.length == 6) {
        unixTimestamp = formatTime(timeStamp);
    } else if (timeStamp.length == 15) {
        unixTimestamp = formatDateTime(timeStamp);
    } else {
        // TODO: Use this to throw an error and tell the sender to correct the date
        unixTimestamp = null;
    }
    return unixTimestamp;
}

export function formatTime(timeStamp: string): string {
    const dateData = new Date(getDateDataFromTime(timeStamp));

    // TODO: Implement getting hnmOffset time based on the HNM.
    const hnmOffset = 21; // WARN: this is a positional offset 22hr == position 21

    dateData.setUTCHours(dateData.getUTCHours() + hnmOffset);

    return Date.UTC(
        dateData.getUTCFullYear(),
        dateData.getUTCMonth(),
        dateData.getUTCDate(),
        dateData.getUTCHours(),
        dateData.getUTCMinutes(),
        dateData.getUTCSeconds(),
    )
        .toString()
        .slice(0, -3);
}

// FIXME: Why are both format function the same? Just add an if
// statement?
export function formatDateTime(timeStamp: string): string {
    const dateData = new Date(getDateDataFromDateTime(timeStamp));

    // TODO: Implement getting hnmOffset time based on the HNM.
    const hnmOffset = 21; // WARN: this is a positional offset 22hr == position 21

    dateData.setUTCHours(dateData.getUTCHours() + hnmOffset);

    return Date.UTC(
        dateData.getUTCFullYear(),
        dateData.getUTCMonth(),
        dateData.getUTCDate(),
        dateData.getUTCHours(),
        dateData.getUTCMinutes(),
        dateData.getUTCSeconds(),
    )
        .toString()
        .slice(0, -3);
}

export function getDateDataFromTime(timeStamp: string): Date {
    const hour = parseInt(timeStamp.slice(0, 2));
    const minute = parseInt(timeStamp.slice(2, 4));
    const second = parseInt(timeStamp.slice(4, 6));

    const now = new Date();

    const offsetDateTimeUTC = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            hour,
            minute,
            second,
        ),
    );

    return offsetDateTimeUTC // FIXME: Just used to clear error needs work
    //return offsetDateTimeUTC(offsetDateTimeUTC)
}

export function getDateDataFromDateTime(timeStamp: string): Date {
    const year = parseInt(timeStamp.slice(0, 4))
    const month = parseInt(timeStamp.slice(4, 6))
    const dayOfMonth = parseInt(timeStamp.slice(6, 8))
    const hour = parseInt(timeStamp.slice(9, 11))
    const minute = parseInt(timeStamp.slice(11, 13))
    const second = parseInt(timeStamp.slice(13, 15))

    const offsetDateTimeUTC = new Date(
        Date.UTC(year, month - 1, dayOfMonth, hour, minute, second),
    );
    console.log("kk");
    printDateTime(offsetDateTimeUTC);

    return offsetDateTimeUTC // FIXME: Just used to clear an error
    //return getOffsetDateTimeUTC(offsetDateTimeUTC)
}

export function getDateDataFromUnixTimeStamp(timeStamp: number): string {
    const unixDateTime: Date = new Date(timeStamp);
    const tzOffset: number = getUTCOffset(timeStamp);

    let year = unixDateTime.getUTCFullYear();
    let month = unixDateTime.getUTCMonth() + 1;
    let dayOfMonth = unixDateTime.getUTCDate();
    let hours = unixDateTime.getUTCHours();
    const minutes = unixDateTime.getUTCMinutes();
    const seconds = unixDateTime.getUTCSeconds();

    if (hours + tzOffset >= 24) {
        dayOfMonth++;
        hours = (hours + tzOffset) % 24;

        const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
        if (dayOfMonth > daysInMonth) {
            dayOfMonth = 1;
            month++;

            if (month > 12) {
                month = 1;
                year++;
            }
        }
    } else if (hours + tzOffset < 0) {
        dayOfMonth--;
        hours = 24 + (hours + tzOffset);

        if (dayOfMonth < 1) {
            month--;
            if (month < 1) {
                month = 12;
                year--;
            }
            dayOfMonth = new Date(year, month, 0).getUTCDate();
        }
    } else {
        hours += tzOffset;
    }

    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")} ` +
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedDate;
}

//export function getOffsetDateTimeUTC(offsetDateTimeUTC: Date): number {
//    const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
//        timeZone: "America/New_York",
//        hourCycle: "h23",
//        hour: "numeric",
//        minute: "numeric",
//        second: "numeric",
//    });
//
//    const tzOffset = dateTimeFormat
//        .formatToParts(offsetDateTimeUTC)
//        .reduce((offset, part) => {
//            if (part.type === "timeZoneName") {
//                return part.value.includes("PDT") ? 7 : 8;
//            }
//            return offset;
//        }, 8);
//
//    //if (offsetDateTimeUTC.getUTCHours() - tzOffset < 0) {
//    //    offsetDateTimeUTC.setUTCDate(offsetDateTimeUTC.getUTCDate() - 1);
//    //}
//    //offsetDateTimeUTC.setUTCHours(offsetDateTimeUTC.getUTCHours() - tzOffset);
//
//    return tzOffset;
//    //return offsetDateTimeUTC;
//}

//export function getUTCOffset(timeZone: string): number {
//    const now = new Date();
//
//    // Format date in the target time zone
//    const match = now.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" })
//        .match(/GMT([+-]\d+):?(\d+)?/);
//
//    if (!match) return 0; // If no offset found, assume UTC (0)
//
//    const [_, hours, minutes] = match.map(Number); // Convert extracted values to numbers
//    return (hours || 0) + (minutes || 0) / 60; // Compute decimal offset
//}

export function printDateTime(dateTime: Date): void {
    console.log(
        dateTime.getUTCFullYear(),
        dateTime.getUTCMonth(),
        dateTime.getUTCDate(),
        dateTime.getUTCHours(),
        dateTime.getUTCMinutes(),
        dateTime.getUTCSeconds(),
    );
}

export function getUTCOffset(timestamp: number, timeZone: string = "America/New_York"): number {
    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset",
    });

    const match = formatter.formatToParts(date).find((part) => part.type === "timeZoneName");

    if (!match || !match.value.includes("GMT")) return 0; // Default to UTC if missing

    const offsetMatch = match.value.match(/GMT([+-]\d+):?(\d+)?/);
    if (!offsetMatch) return 0;

    const [, hours, minutes] = offsetMatch.map(Number);
    return (hours || 0) + (minutes || 0) / 60;
}

