import { useEmoteContext } from "@/contexts/EmoteContextProvider";
import { normalizeMessage } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";
import { memo } from "react";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const RepliedToBubble = memo(
    ({ message, isMyMessage }: Props) => {
        const emotes = useEmoteContext();

        const fragments = message.replyingToContent!.split(" ");
        const allEmotes = fragments.every((fragment) => {
            const emote = emotes[fragment];
            if (emote) return true;
            else return false;
        });

        return (
            <div
                className={cn("p-2 mb-1 mt-4 rounded bg-muted opacity-80", {
                    "border-4 border-l-primary": isMyMessage,
                    "border-4 border-l-white": !isMyMessage,
                })}
            >
                <span className="block mb-2 text-xs">Replied To:</span>
                <div
                    className={cn({
                        flex: allEmotes,
                    })}
                >
                    {normalizeMessage(
                        message.replyingToContent!,
                        "not-replying",
                        emotes,
                    )}
                </div>
            </div>
        );
    },
    (previous, next) => {
        if (previous.message.id !== next.message.id) {
            return false;
        }

        return true;
    },
);

export default RepliedToBubble;
