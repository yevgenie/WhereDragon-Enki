import { createReadStream, readFileSync, writeFileSync } from "fs";
import csv from "csv-parser";

// Function to convert an object to a tab-delimited CSV format
export function objectToTabDelimitedCsv(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  // Extract the headers
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => row[header]).join("\t")
  );

  // Join headers and rows into a single string
  return [headers.join("\t"), ...rows].join("\n");
}

// Function to export the object to a CSV file
export function exportToCsv(filePath: string, data: string): void {
  // const csvString = objectToTabDelimitedCsv(data);
  writeFileSync(filePath, data);
  console.log(`Data has been exported to ${filePath}`);
}

export interface CsvRow {
  [key: string]: string;
}

export async function readCsv(filePath: string): Promise<CsvRow[]> {
  const results: CsvRow[] = [];
  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

export async function compareCsvFiles(
  file1: string,
  file2: string
): Promise<boolean> {
  const data1 = await readCsv(file1);
  const data2 = await readCsv(file2);

  // console.log({ data1, data2 });

  // Compare lengths first for quick failure
  if (data1.length !== data2.length) {
    return false;
  }

  // // Sort the data to ensure the comparison is order-independent
  // const sortedData1 = data1.sort((a, b) =>
  //   JSON.stringify(a).localeCompare(JSON.stringify(b))
  // );
  // const sortedData2 = data2.sort((a, b) =>
  //   JSON.stringify(a).localeCompare(JSON.stringify(b))
  // );

  // // Compare each row
  // return sortedData1.every(
  //   (row, index) => JSON.stringify(row) === JSON.stringify(sortedData2[index])
  // );
  return data1.every(
    (row, index) => JSON.stringify(row) === JSON.stringify(data2[index])
  );
}

export function loadJsonFile(filePath: string): any {
  const jsonData = readFileSync(filePath, "utf-8"); // Read file synchronously
  return JSON.parse(jsonData); // Parse the JSON string into an object
}

export function formatTimestampToDate(timestamp: number) {
  const date = new Date(timestamp);

  // Extracting date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Formatting to "YYYY-MM-DD HH:mm:ss"
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
