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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToTabDelimitedCsv = objectToTabDelimitedCsv;
exports.exportToCsv = exportToCsv;
exports.readCsv = readCsv;
exports.compareCsvFiles = compareCsvFiles;
exports.loadJsonFile = loadJsonFile;
exports.formatTimestampToDate = formatTimestampToDate;
const fs_1 = require("fs");
const csv_parser_1 = __importDefault(require("csv-parser"));
// Function to convert an object to a tab-delimited CSV format
function objectToTabDelimitedCsv(data) {
    if (data.length === 0) {
        return "";
    }
    // Extract the headers
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((header) => row[header]).join("\t"));
    // Join headers and rows into a single string
    return [headers.join("\t"), ...rows].join("\n");
}
// Function to export the object to a CSV file
function exportToCsv(filePath, data) {
    // const csvString = objectToTabDelimitedCsv(data);
    (0, fs_1.writeFileSync)(filePath, data);
    console.log(`Data has been exported to ${filePath}`);
}
function readCsv(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        return new Promise((resolve, reject) => {
            (0, fs_1.createReadStream)(filePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (data) => results.push(data))
                .on("end", () => resolve(results))
                .on("error", (error) => reject(error));
        });
    });
}
function compareCsvFiles(file1, file2) {
    return __awaiter(this, void 0, void 0, function* () {
        const data1 = yield readCsv(file1);
        const data2 = yield readCsv(file2);
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
        return data1.every((row, index) => JSON.stringify(row) === JSON.stringify(data2[index]));
    });
}
function loadJsonFile(filePath) {
    const jsonData = (0, fs_1.readFileSync)(filePath, "utf-8"); // Read file synchronously
    return JSON.parse(jsonData); // Parse the JSON string into an object
}
function formatTimestampToDate(timestamp) {
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
