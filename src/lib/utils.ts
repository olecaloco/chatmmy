import { Message } from "@/models";
import { type ClassValue, clsx } from "clsx"
import { format, isToday } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractColonedWord(input: string): string | null {
  const colonWordRegex = /@(\w+)@/;
  const match = input.match(colonWordRegex);
  return match ? match[1] : null;
}

export function isValidHttpUrl(url: string) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

export const formatTimestamp = (date?: Date): string => {
  if (!date) return "";

  if (isToday(date)) {
      return format(date, "hh:mm a");
  } else {
      return format(date, "MMM d, hh:mm a");
  }
};

export const processMessageData = (
  value: string,
  replyingTo: Message | null,
  userId?: string
) => {
  const content = value.trim();
  const now = new Date();

  const data: any = {
      content: content ?? "",
      senderId: userId,
      createdAt: now,
      emoteUrls: [],
      media: [],
  };

  if (replyingTo) {
      data.replyingTo = replyingTo.id;
      data.replyingToContent = replyingTo.content;
      data.replyingToEmoteUrls = replyingTo.emoteUrls;
  }

  return data;
}