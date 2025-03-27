import { Message, Events } from 'discord.js';
import { ClientWithCommands } from '../types/ClientWithCommands'
import { sendNextCamp } from '../utils/channelUtils';

export const name = Events.MessageCreate;

export const execute = (message: Message, client: ClientWithCommands) => {
    if ((message.author.bot && message.content.includes("DKP Review"))) {
        sendNextCamp(message)
    }
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.commands?.get(commandName);
    if (!command) {
        console.warn(`[WARNING] Command '${commandName}' not found.`);
        return;
    }

    try {
        command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
};

