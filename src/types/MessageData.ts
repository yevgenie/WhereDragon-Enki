import { Message, User } from "discord.js"

export type MessageData = {
    memberDisplayName: string;
    createdTimestamp: number;
    author: User;
    content: string;
}

export interface MessageWithDisplayName extends Message {
    memberDisplayName?: string;
}
