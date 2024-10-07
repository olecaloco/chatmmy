export interface EmoteUrl {
    [key: string]: string;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    emoteUrls: EmoteUrl[];
    createdAt?: Date;
    replyingTo?: string;
    replyingToContent?: string;
    replyingToEmoteUrls?: EmoteUrl[];
}

export interface Emote_API {
    id: string;
    name: string;
    data: any;
}