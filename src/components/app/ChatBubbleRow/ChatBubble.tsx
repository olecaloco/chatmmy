import { Message } from "@/models";
import { memo, ReactNode } from "react";
import ChatBubbleTextOnly from "./ChatBubbleTextOnly";
import ChatBubbleMediaOnly from "./ChatBubbleMediaOnly";
import ChatBubbleTextAndMedia from "./ChatBubbleTextAndMedia";

const ChatBubble = memo(({ message, isMyMessage }: { message: Message; isMyMessage: boolean }) => {
    let node: ReactNode = "";
    const messageHasMedia = message.media && message.media.length > 0 ? true : false;


    if (message.content && !messageHasMedia) {
        node = <ChatBubbleTextOnly message={message} isMyMessage={isMyMessage} />
    } else if (!message.content && messageHasMedia) {
        node = <ChatBubbleMediaOnly message={message} />
    } else if (message.content && messageHasMedia) {
        node = <ChatBubbleTextAndMedia message={message} isMyMessage={isMyMessage} />
    }

    return node;
}, (previous, next) => {
    if (previous.message.id !== next.message.id) {
        return false;
    }

    return true;
})

export default ChatBubble;