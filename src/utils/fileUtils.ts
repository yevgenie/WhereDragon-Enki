import * as fs from "fs"

// Expand the types of the object if needed, avoid typeof "any"
// typeof "Channel" in only current use case
// WARN: Tests seem to send other objects
export const writeToJSONFile = (object: any, filePath = "./test_output.json") => {
    fs.writeFile(filePath, JSON.stringify(object, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("JSON file has been saved:", filePath);
        }
    });
};
