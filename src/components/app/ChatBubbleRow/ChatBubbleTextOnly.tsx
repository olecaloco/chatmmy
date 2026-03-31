import { useEmoteContext } from "@/contexts/EmoteContextProvider";
import { normalizeMessage } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";
import { memo, useMemo } from "react";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const ChatBubbleTextOnly = ({ message, isMyMessage }: Props) => {
    const emotes = useEmoteContext();
    const fragments = message.content.split(" ");
    const singleToken = fragments.length === 1 ? true : false;
    const allEmotes = fragments.every((fragment) => {
        const emote = emotes[fragment];
        if (emote) return true;
        else return false;
    });
    let emoteOnly = false;

    if ((singleToken && emotes) || allEmotes) {
        const emote = emotes[fragments[0]];
        if (emote) emoteOnly = true;
    }

    const content = useMemo(() => {
        return normalizeMessage(message.content, "not-replying", emotes);
    }, [message.content, emotes]);

    return (
        <div
            className={cn("p-2 rounded", {
                flex: allEmotes,
                "bg-primary text-primary-foreground": isMyMessage && !emoteOnly,
                "bg-muted": !isMyMessage && !emoteOnly,
            })}
        >
            {content}
        </div>
    );
};

export default memo(ChatBubbleTextOnly);
