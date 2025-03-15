export interface EmoteUrl {
    [key: string]: string;
}

export enum STATUS {
    SENT = "SENT",
    SENDING = "SENDING",
    FAILED = "FAILED"
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
    status?: STATUS
}

export interface Emote_API {
    id: string;
    name: string;
    data: any;
}

export interface Checklist {
    id?: string;
    title?: string;
    items: ChecklistItem[];
    createdAt: number;
    createdBy: string;
}

export interface ChecklistItem {
    id: number;
    checked: boolean;
    content: string;
}