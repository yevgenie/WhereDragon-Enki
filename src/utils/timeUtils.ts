import { DateData, HnmTimerData } from "../types/HnmTimerData";
import { botTZ } from "../config.json";

export function parseTime(hnmTimerData: HnmTimerData): string | null {
    // TODO: Cause an error if it remains as null
    let unixTimestamp: string | null = null;

    if (hnmTimerData.timeStamp != null) {
        // TODO: Implement getting hnmOffset time based on the HNM.
        const hnmOffset = 21; // WARN: this is a positional offset 22hr == position 21

        if (hnmTimerData.timeStamp?.length == 6) {
            const dateData = new Date(getDateDataFromTime(hnmTimerData.timeStamp));
            dateData.setUTCHours(dateData.getUTCHours() + hnmOffset);

            const formatedTimestamp: Date = new Date(
                dateData.getUTCFullYear(),
                dateData.getUTCMonth(),
                dateData.getUTCDate(),
                dateData.getUTCHours(),
                dateData.getUTCMinutes(),
                dateData.getUTCSeconds(),
            )

            unixTimestamp = getUnixTimeStampFromDateData(formatedTimestamp);
        } else if (hnmTimerData.timeStamp?.length == 15) {
            const dateData = new Date(getDateDataFromDateTime(hnmTimerData.timeStamp));
            dateData.setUTCHours(dateData.getUTCHours() + hnmOffset);

            const formatedTimestamp: Date = new Date(
                dateData.getUTCFullYear(),
                dateData.getUTCMonth(),
                dateData.getUTCDate(),
                dateData.getUTCHours(),
                dateData.getUTCMinutes(),
                dateData.getUTCSeconds(),
            )

            unixTimestamp = getUnixTimeStampFromDateData(formatedTimestamp);
        }
    }

    return unixTimestamp;
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
    )

    return offsetDateTimeUTC
}

export function getDateDataFromDateTime(timeStamp: string): Date {
    const year = parseInt(timeStamp.slice(0, 4))
    const month = parseInt(timeStamp.slice(4, 6))
    const dayOfMonth = parseInt(timeStamp.slice(6, 8))
    const hour = parseInt(timeStamp.slice(9, 11))
    const minute = parseInt(timeStamp.slice(11, 13))
    const second = parseInt(timeStamp.slice(13, 15))

    const offsetDateTimeUTC = new Date(
        Date.UTC(year, month, dayOfMonth, hour, minute, second),
    );
    // printDateTime(offsetDateTimeUTC);

    return offsetDateTimeUTC
}


function getUnixTimeStampFromDateData(timeStamp: Date): string {
    const unixDateTime: string = Date.UTC(
        timeStamp.getUTCFullYear(),
        timeStamp.getUTCMonth(),
        timeStamp.getUTCDate(),
        timeStamp.getUTCHours(),
        timeStamp.getUTCMinutes(),
        timeStamp.getUTCSeconds(),
    ).toString().slice(0, -3);

    const tzOffset: number = getUTCOffset(parseInt(unixDateTime));

    let year = timeStamp.getUTCFullYear();
    let month = timeStamp.getUTCMonth();
    let dayOfMonth = timeStamp.getUTCDate();
    let hours = timeStamp.getUTCHours();
    const minutes = timeStamp.getUTCMinutes();
    const seconds = timeStamp.getUTCSeconds();

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

    const formatedTimestamp: string = Date.UTC(
        year,
        month,
        dayOfMonth,
        hours,
        minutes,
        seconds
    )
        .toString()
        .slice(0, -3);

    return formatedTimestamp;
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

function printDateTime(dateTime: Date): void {
    console.log(
        dateTime.getUTCFullYear(),
        dateTime.getUTCMonth(),
        dateTime.getUTCDate(),
        dateTime.getUTCHours(),
        dateTime.getUTCMinutes(),
        dateTime.getUTCSeconds(),
    );
}

function getUTCOffset(timestamp: number, timeZone: string = botTZ): number {
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

export function parseOffset(dateData: DateData): DateData {
    const { tzOffset } = dateData;
    let { year, month, dayOfMonth, hours } = dateData;

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

    return dateData;
}
