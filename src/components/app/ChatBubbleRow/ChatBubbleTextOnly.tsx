import { useEmoteContext } from "@/contexts/EmoteContextProvider";
import { normalizeMessage } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";
import { memo } from "react";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const ChatBubbleTextOnly = ({ message, isMyMessage }: Props) => {
    const emotes = useEmoteContext();
    const fragments = message.content.split(" ");
    const singleToken = fragments.length === 1 ? true : false;
    let emoteOnly = false;

    if (singleToken && emotes) {
        const emote = emotes[fragments[0]];
        if (emote) emoteOnly = true;
    }

    return (
        <div
            className={cn("p-2 rounded", {
                "bg-primary text-primary-foreground": isMyMessage && !emoteOnly,
                "bg-muted": !isMyMessage && !emoteOnly,
            })}
        >
            {normalizeMessage(message.content, "not-replying", emotes)}
        </div>
    );
};

export default memo(ChatBubbleTextOnly);
