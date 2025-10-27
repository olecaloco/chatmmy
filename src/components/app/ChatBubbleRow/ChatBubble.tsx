import { Message } from "@/models";
import { memo } from "react";
import ChatBubbleTextOnly from "./ChatBubbleTextOnly";

const ChatBubble = memo(
    ({ message, isMyMessage }: { message: Message; isMyMessage: boolean }) => {
        return (
            <ChatBubbleTextOnly message={message} isMyMessage={isMyMessage} />
        );
    },
    (previous, next) => {
        if (previous.message.id !== next.message.id) {
            return false;
        }

        return true;
    }
);

export default ChatBubble;
