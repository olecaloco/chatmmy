import { useAuthContext } from "@/helpers/authContext";
import { cn, formatTimestamp } from "@/lib/utils";
import { Message } from "@/models";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import RepliedToBubble from "./ChatBubbleRow/RepliedToBubble";
import ChatBubble from "./ChatBubbleRow/ChatBubble";
import ChatTimestamp from "./ChatBubbleRow/ChatTimestamp";

export const MessageItem = ({
    messages,
    messageIndex,
    message,
    onReply,
}: {
    messages: Message[];
    messageIndex: number;
    message: Message;
    onReply?: (message: Message) => void;
}) => {
    const { user } = useAuthContext();
    const userOwnsMessage = message.senderId === user?.uid;
    const isMessageLatest = messageIndex === 0;

    const hasReplyContent = (message.replyingToContent || (message.replyingToMedia && message.replyingToMedia.length > 0)) ? true : false;
    const prevMessage = messages[messageIndex - 1];
    const isPrevAuthor = prevMessage?.senderId === message.senderId;
    let shouldShowTime = true;

    if (
        isPrevAuthor &&
        formatTimestamp(message.createdAt) ==
        formatTimestamp(prevMessage.createdAt)
    ) {
        shouldShowTime = false;
    }

    // Animation
    const [style, api] = useSpring(() => ({
        from: {
            x: 0,
            transform: isMessageLatest ? "translateY(15px)" : undefined,
        },
        to: { x: 0, transform: isMessageLatest ? "translateY(0)" : undefined },
        config: { tension: 200, friction: 20 },
    }));

    const bind = useDrag(
        ({
            down,
            active,
            offset: [ox],
            movement: [mx],
            memo = { ox: null },
        }) => {
            let _x = 0;
            if (userOwnsMessage) _x = down ? (mx < 0 ? mx : 0) : 0;
            else _x = down ? (mx > 0 ? mx : 0) : 0;
            api.start({ x: _x, immediate: down });

            if (userOwnsMessage && !active && memo.ox < -10 && onReply) {
                onReply(message);
            } else if (!userOwnsMessage && !active && memo.ox > 10 && onReply) {
                onReply(message);
            }

            memo.ox = ox;

            return memo;
        },
        {
            bounds: {
                left: -20,
                right: 20,
            },
            filterTaps: true,
            rubberband: true,
        }
    );

    return (
        <div className={cn("flex flex-col text-sm", { "items-end": userOwnsMessage, "items-start": !userOwnsMessage })}>
            <animated.div
                {...bind()}
                style={{ ...style }}
                className={
                    cn("flex flex-col [overflow-wrap:anywhere] touch-none w-max max-w-[75%]", {
                        "items-end": userOwnsMessage,
                        "items-start": !userOwnsMessage
                    })
                }
            >
                {hasReplyContent && <RepliedToBubble message={message} isMyMessage={userOwnsMessage} />}
                <ChatBubble message={message} isMyMessage={userOwnsMessage} />
            </animated.div>
            {shouldShowTime && <ChatTimestamp createdAt={message.createdAt} />}
        </div>
    )
};
