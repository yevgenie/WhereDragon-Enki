import * as path from 'path';
import * as fs from 'fs';
import { ClientWithCommands } from "../types/ClientWithCommands";

export async function loadEvents(client: ClientWithCommands) {
    const eventsDir = path.join(__dirname, '../events');

    const eventFiles = fs.readdirSync(eventsDir);

    for (const file of eventFiles) {
        const eventName = file.split('.')[0];

        try {
            const event = await import(path.join(eventsDir, file));

            if (event?.name && typeof event.execute === "function") {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client))
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client))
                }
                console.log(`Event ${eventName} loaded successfully.`);
            } else {
                console.warn(`No handler found for event: ${eventName}`);
            }
        } catch (error) {
            console.error(`Failed to load event ${eventName}:`, error);
        }
    }
}

export async function loadCommands(client: ClientWithCommands) {
    const commandsDir = path.join(__dirname, '../commands');

    const commandFiles = fs.readdirSync(commandsDir);

    for (const file of commandFiles) {
        const commandName = file.split('.')[0];

        try {
            const command = await import(path.join(commandsDir, file));

            if (command?.name && typeof command.execute === "function") {
                client.commands?.set(command?.name, command)
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach((alias: string) =>
                        client.commands?.set(alias, command),
                    );
                }
                console.log(`Command ${commandName} loaded successfully.`);
            } else {
                console.warn(`No handler found for command: ${commandName}`);
            }
        } catch (error) {
            console.error(`Failed to load event ${commandName}:`, error);
        }
    }
}
