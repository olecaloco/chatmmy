import { normalizeMessage } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";
import { memo } from "react";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const ChatBubbleTextOnly = ({
    message,
    isMyMessage
}: Props) => {

    const singleToken = message.content.split(" ").length === 1 ? true : false;
    const hasEmotes = message.emoteUrls && message.emoteUrls.length > 0 ? true : false;
    const emoteOnly = singleToken && hasEmotes ? true : false;

    return (
        <div
            className={cn(
                "p-2 rounded",
                {
                    "bg-primary text-primary-foreground": isMyMessage && !emoteOnly,
                    "bg-muted": !isMyMessage && !emoteOnly,
                }
            )}
        >
            {normalizeMessage(message.content)}
        </div>
    )
}

export default memo(ChatBubbleTextOnly);