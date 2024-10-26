export interface EmoteUrl {
    [key: string]: string;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    emoteUrls: EmoteUrl[];
    createdAt?: Date;
    media?: string[];
    replyingTo?: string;
    replyingToContent?: string;
    replyingToEmoteUrls?: EmoteUrl[];
    replyingToMedia?: string[];
}

export interface Emote_API {
    id: string;
    name: string;
    data: any;
}