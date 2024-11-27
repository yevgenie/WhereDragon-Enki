import * as fs from "fs";
import * as readline from "readline";
let lastPosition = 0;

const fileName = "C:\\ffxi\\HorizonXI\\Game\\chatlogs\\Syragon_2024.11.25.log";

let timestampsWithinTenSeconds: string[] = [];
let firstTimestamp: Date | null = null;

function processLine(line: string) {
  const testMatch = line.match(/\[(\d{2}):(\d{2}):(\d{2})\]\s*>\.test/);
  if (testMatch) {
    const [, hours, minutes, seconds] = testMatch;
    const currentTimestamp = new Date();
    currentTimestamp.setHours(
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );

    if (!firstTimestamp) {
      firstTimestamp = currentTimestamp;
      timestampsWithinTenSeconds.push(testMatch[0]);
    } else if (currentTimestamp.getTime() - firstTimestamp.getTime() <= 10000) {
      // 10,000 ms = 10 seconds
      timestampsWithinTenSeconds.push(testMatch[0]);
    } else {
      // If we're here, it means this timestamp is more than 10 seconds after the first one
      // You might want to do something with timestampsWithinTenSeconds here, like logging or processing
      console.log("Timestamps within 10 seconds:", timestampsWithinTenSeconds);
      // Reset for the next group
      timestampsWithinTenSeconds = [testMatch[0]];
      firstTimestamp = currentTimestamp;
    }

    console.log(
      `Timestamp of >.test: ${subtractThreeHours(
        `${hours}:${minutes}:${seconds}`
      )}`
    );
  }
}

function subtractThreeHours(timeString: string): string {
  // Split the input string into hours, minutes, and seconds
  let [hours, minutes, seconds] = timeString.split(":").map(Number);

  // Subtract 3 hours
  hours -= 3;

  // Handle wrap around for negative hours
  if (hours < 0) {
    hours += 24;
  }

  // Format the time back to HH:MM:SS
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export const watchChatLogsForTods = () => {
  fs.watchFile(fileName, { persistent: true }, (curr, prev) => {
    if (curr.mtime.getTime() !== prev.mtime.getTime()) {
      // Create a new stream from the last processed position
      const stream = fs.createReadStream(fileName, {
        encoding: "utf8",
        start: lastPosition,
      });
      const lineReader = readline.createInterface({ input: stream });

      lineReader.on("line", (line) => {
        processLine(line);
      });

      lineReader.on("close", () => {
        // Update lastPosition after reading new content
        lastPosition = curr.size;
      });
    }
  });
};
