import { Client, GatewayIntentBits, Collection } from "discord.js";
import { Command, ClientWithCommands } from "./types/ClientWithCommands";

const client: ClientWithCommands = new Client({ // Trying to stick with an interface but might need to be a class
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection<string, Command>();
client.lastPopChannel = null;
client.timeZone = "America/Los_Angeles";

export default client;


