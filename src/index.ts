import * as dotenv from "dotenv";
// WARN: Refactor imports
import client from "./client"
import * as modules from "./utils/moduleUtils"
import { watchChatLogsForTods } from "./tod-watcher";

dotenv.config();

modules.loadEvents(client)
modules.loadCommands(client)

watchChatLogsForTods();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(TOKEN);
