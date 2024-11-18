"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const fs_1 = require("fs");
const sheets_1 = require("./sheets");
const channelToDKP_1 = require("./helpers/channelToDKP");
const fs_2 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv.config();
function isToday(date) {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear());
}
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds, // Enable guild-related events
        discord_js_1.GatewayIntentBits.GuildMessages, // Enable message-related events in guilds
        discord_js_1.GatewayIntentBits.GuildMessageTyping, // Enable typing events in guilds
        discord_js_1.GatewayIntentBits.GuildMessageReactions, // Enable reaction events in guilds
        discord_js_1.GatewayIntentBits.GuildPresences, // Enable presence events for guild members
        discord_js_1.GatewayIntentBits.GuildMembers, // Enable member-related events
        discord_js_1.GatewayIntentBits.GuildVoiceStates, // Enable voice state events for guild members
        discord_js_1.GatewayIntentBits.GuildIntegrations, // Enable integration events
        discord_js_1.GatewayIntentBits.GuildWebhooks, // Enable webhook events
        discord_js_1.GatewayIntentBits.DirectMessages, // Enable direct message events
        discord_js_1.GatewayIntentBits.DirectMessageReactions, // Enable reaction events in direct messages
        discord_js_1.GatewayIntentBits.DirectMessageTyping, // Enable typing events in direct messages
        discord_js_1.GatewayIntentBits.MessageContent, // Enable access to message content
    ],
});
client.once("ready", () => {
    console.log("Bot is online!");
});
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
function isOlderThanThreeHours(message) {
    return Date.now() - message.createdTimestamp > THREE_HOURS_MS;
}
function isImageOnlyMessage(message) {
    // Check for attachments and ensure message content is empty or just whitespace
    return message.attachments.size > 0 && message.content.trim() === "";
}
function fetchData(fileUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const { default: fetch } = yield Promise.resolve().then(() => __importStar(require("node-fetch")));
        // Now you can use fetch
        const response = yield fetch(fileUrl);
        return response.json();
    });
}
function downloadAttachment(attachment, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileUrl = attachment.url;
        const fileName = `${Date.now()}_${attachment.name || "image"}`;
        const response = yield fetchData(fileUrl);
        const fileStream = fs_2.default.createWriteStream(path_1.default.join(folderPath, fileName));
        return new Promise((resolve, reject) => {
            var _a, _b;
            (_a = response.body) === null || _a === void 0 ? void 0 : _a.pipe(fileStream);
            (_b = response.body) === null || _b === void 0 ? void 0 : _b.on("error", reject);
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
        });
    });
}
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (message.author.bot)
        return; // Ignore bot messages
    if (message.content.indexOf("!are you here?") === 0) {
        message.channel.send("Yes");
    }
    let attachmentCount = 0;
    if (message.content.indexOf("!meme dl") === 0) {
        try {
            const channel = message.channel;
            let lastMessageId;
            while (true) {
                const fetchedMessages = yield channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId,
                });
                console.log("Fetched 100...");
                for (const message of fetchedMessages.values()) {
                    if (isImageOnlyMessage(message)) {
                        attachmentCount++;
                        for (const [, attachment] of message.attachments) {
                            if (attachment.contentType &&
                                attachment.contentType.startsWith("image/")) {
                                try {
                                    yield downloadAttachment(attachment, "../../downloads");
                                    console.log(`Downloaded: ${attachment.name}`);
                                }
                                catch (error) {
                                    console.error(`Failed to download ${attachment.name}:`, error);
                                }
                            }
                        }
                    }
                    if (isOlderThanThreeHours(message)) {
                        console.log("Stopping fetch: Message is older than 3 hours");
                        return; // Exit the function when we hit a message older than 3 hours
                    }
                    if (fetchedMessages.size === 0)
                        break;
                    lastMessageId = (_a = fetchedMessages.last()) === null || _a === void 0 ? void 0 : _a.id;
                }
            }
        }
        catch (error) {
            message.channel.send("Error fetching memes.");
        }
        console.log(`Found ${attachmentCount} memes from the last 3 hours.`);
        // message.channel.send(
        //   `Found ${attachmentCount} memes from the last 3 hours.`
        // );
    }
    if (message.content.indexOf("!process") === 0) {
        const isClaimed = message.content.includes("claimed");
        try {
            // Get the channel where the command was sent
            const channel = message.channel;
            const allMessages = [];
            let lastMessageId;
            // Fetch messages in batches
            while (true) {
                const fetchedMessages = yield channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId,
                });
                // If no messages are fetched, break the loop
                if (fetchedMessages.size === 0)
                    break;
                allMessages.push(...[...fetchedMessages.values()]);
                lastMessageId = (_b = fetchedMessages.last()) === null || _b === void 0 ? void 0 : _b.id; // Update the lastMessageId to the last fetched message
            }
            // await writeToJSONFile({ ...channel, messages: allMessages });
            const allMessagesData = [];
            yield allMessages.reverse().forEach((msg) => __awaiter(void 0, void 0, void 0, function* () {
                const { createdTimestamp, author, content, member } = msg;
                const { nickname: memberName, displayName: memberDisplayName } = member !== null && member !== void 0 ? member : {};
                allMessagesData.push(Object.assign(Object.assign({}, msg), { memberDisplayName,
                    createdTimestamp,
                    author,
                    content }));
            }));
            // await writeToJSONFile({
            //   ...message.channel,
            //   messages: allMessagesData,
            // });
            const windowsPerMember = (0, channelToDKP_1.channelMessagesToWindows)(Object.assign(Object.assign({}, message.channel), { messages: allMessagesData }));
            // await writeToJSONFile(parsed);
            if (message.channel instanceof discord_js_1.TextChannel ||
                message.channel instanceof discord_js_1.NewsChannel) {
                yield (0, sheets_1.writeToDKPEntrySheetBasic)(message.channel.name, windowsPerMember, isClaimed);
            }
            else {
                message.channel.send("This command cannot be executed in this type of channel.");
            }
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            message.channel.send("Error fetching messages.");
        }
    }
}));
const TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(TOKEN);
// Channel Name
// HNM Target
// DKP Process Date (now?)
// Window Points (depends on Target)
// Player Names
// Claim+Kill | Kill | Window Points
// Specify the file path
const filePath = "./test_output.json";
// Convert the object to a JSON string
// const jsonString = JSON.stringify(myObject, null, 2); // Pretty print with 2 spaces
const writeToJSONFile = (object) => {
    (0, fs_1.writeFile)(filePath, JSON.stringify(object, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        }
        else {
            console.log("JSON file has been saved:", filePath);
        }
    });
};
