import { Events } from "discord.js"
import { ClientWithCommands } from "../types/ClientWithCommands";

export const name = Events.ClientReady;
export const once = true;

export const execute = (client: ClientWithCommands) => {
    console.log(`Ready! Logged in as ${client.user?.username}.`)
};

