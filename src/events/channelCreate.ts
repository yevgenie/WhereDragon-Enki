import { Events, TextChannel } from "discord.js";
import { scheduleWindowMessages } from "../utils/channelUtils";

export const name = Events.ChannelCreate;

export const execute = (channel: TextChannel) => {
    if (channel instanceof TextChannel) {
        if (!channel.topic) return false;
        const timestampRegex = /^<t:\d+:[TRdDfFt]>$/;
        if (timestampRegex.test(channel.topic.trim())) {
            console.log("SCHEDULING CRON FOR CHANNEL:", channel.name, channel.id);
            scheduleWindowMessages(channel.id, channel.client);
        }
    }
};

