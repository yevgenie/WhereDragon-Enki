import { Client, Channel, Collection, Message } from "discord.js";

export interface Command {
    name: string;
    aliases: string[];
    execute: (message: Message, args: string[], client: ClientWithCommands) => void;
}

export interface ClientWithCommands extends Client {
    commands?: Collection<string, Command>;
    lastPopChannel?: Channel | null;
    timeZone?: string;
}


