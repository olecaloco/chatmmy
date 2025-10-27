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
        return (
            <div
                className={cn("p-2 mb-1 mt-4 rounded bg-muted opacity-80", {
                    "border-4 border-l-primary": isMyMessage,
                    "border-4 border-l-white": !isMyMessage,
                })}
            >
                <span className="block mb-2 text-xs">Replied To:</span>
                <div>{normalizeMessage(message.replyingToContent!)}</div>
            </div>
        );
    },
    (previous, next) => {
        if (previous.message.id !== next.message.id) {
            return false;
        }

        return true;
    }
);

export default RepliedToBubble;
