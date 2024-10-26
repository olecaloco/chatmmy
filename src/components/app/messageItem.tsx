import { useAuthContext } from "@/helpers/authContext";
import { normalizeMessageContent } from "@/lib/normalizeMessage";
import { cn, formatTimestamp, isValidHttpUrl } from "@/lib/utils";
import { Message } from "@/models";
import { Button } from "../ui/button";
import { Reply } from "lucide-react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const ReplyContent = ({
    message,
    media,
    emotes,
    userOwnsMessage,
}: {
    message?: string;
    media?: string[];
    emotes?: Message["emoteUrls"];
    userOwnsMessage: boolean;
}) => {
    if (!message && media && media.length > 0) {
        return (
            <div
                className={cn("rounded-lg px-3 py-2 text-sm mb-2 border-l-4", {
                    "border-l-white bg-gray-200 dark:bg-gray-700": !userOwnsMessage,
                    "border-l-blue-500 bg-gray-700 dark:bg-gray-200":
                        userOwnsMessage,
                })}
            >
                <div className="mb-2 font-bold text-xs">Replying To:</div>
                <a href={media[0]} target="_blank">
                    <img className="w-32 h-52 rounded object-cover" src={media[0]} alt="" />
                </a>
            </div>
        )
    }

    return (
        <div
            className={cn("rounded-lg px-3 py-2 text-sm mb-2 border-l-4", {
                "border-l-white bg-gray-200 dark:bg-gray-700": !userOwnsMessage,
                "border-l-blue-500 bg-gray-700 dark:bg-gray-200":
                    userOwnsMessage,
            })}
        >
            <div className="mb-2 font-bold text-xs">Replying To:</div>
            {(media && media.length > 0) && <a href={media[0]} target="_blank"><img className="block mb-2 w-32 h-52 object-cover rounded" src={media[0]} alt="" /></a>}
            {normalizeMessageContent(message ?? "", emotes, false, userOwnsMessage)}
        </div>
    );
};

const MessageItemReplyButton = ({
    message,
    userOwnsMessage,
    onReply,
}: {
    message: Message;
    userOwnsMessage: boolean;
    onReply?: (message: Message) => void;
}) => (
    <Button
        className={cn(
            "absolute hidden w-8 h-8 top-0 rounded-full group-hover:inline-flex",
            {
                "left-full": !userOwnsMessage,
                "right-full": userOwnsMessage,
            }
        )}
        title="Reply"
        variant="ghost"
        size="icon"
        onClick={() => onReply && onReply(message)}
    >
        <Reply className="w-4 h-4" />
    </Button>
);

const MessageContent = ({
    message,
    userOwnsMessage,
}: {
    message: Message;
    userOwnsMessage: boolean;
}) => {
    if (
        message.content &&
        message.replyingTo &&
        message.content.split(/ /).length == 1 &&
        userOwnsMessage &&
        message.emoteUrls &&
        message.emoteUrls.length > 0
    ) {
        return (
            <div className="text-end">
                {normalizeMessageContent(
                    message.content,
                    message.emoteUrls,
                    false,
                    userOwnsMessage
                )}
            </div>
        );
    }

    return normalizeMessageContent(
        message.content,
        message.emoteUrls,
        false,
        userOwnsMessage
    );
};

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

    const prevMessage = messages[messageIndex - 1];
    const nextMessage = messages[messageIndex + 1];
    const isPrevAuthor = prevMessage?.senderId === message.senderId;
    const isNextAuthor = nextMessage?.senderId === message.senderId;
    let shouldShowTime = true;
    let spacerClass = "mb-px";
    let roundedClass = "";

    const isURL = isValidHttpUrl(message.content);

    let tokens = message.content.split(/ /g);
    let shouldShowBG = true;

    if (
        !isURL &&
        tokens.length === 1 &&
        message.emoteUrls &&
        message.emoteUrls.length > 0
    ) {
        shouldShowBG = false;
    }

    if (
        isPrevAuthor &&
        formatTimestamp(message.createdAt) ==
            formatTimestamp(prevMessage.createdAt)
    ) {
        shouldShowTime = false;
    }

    if (userOwnsMessage) {
        if (isPrevAuthor && isNextAuthor) {
            roundedClass = "rounded-lg rounded-e-none";
        } else if (isPrevAuthor) {
            roundedClass = "rounded-lg rounded-br-none";
        } else {
            roundedClass = "rounded-lg rounded-tr-none";
            spacerClass = "mb-2";
        }

        if (shouldShowTime) {
            roundedClass = "rounded-lg rounded-tr-none";
        }
    } else {
        if (isPrevAuthor && isNextAuthor) {
            roundedClass = "rounded-lg rounded-s-none";
        } else if (isPrevAuthor) {
            roundedClass = "rounded-lg rounded-bl-none";
        } else {
            roundedClass = "rounded-lg rounded-tl-none";
            spacerClass = "mb-2";
        }

        if (shouldShowTime) {
            roundedClass = "rounded-lg rounded-tl-none";
        }
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
        <div
            className={cn(
                "relative group w-max max-w-[75%] gap-2 flex items-center",
                spacerClass,
                {
                    "ml-auto": userOwnsMessage,
                    "flex-row-reverse": !userOwnsMessage,
                }
            )}
        >
            <MessageItemReplyButton
                message={message}
                userOwnsMessage={userOwnsMessage}
                onReply={onReply}
            />
            <div>
                <animated.div
                    {...bind()}
                    style={{ ...style }}
                    className={cn(
                        "px-3 py-2 text-sm touch-none [overflow-wrap:anywhere]",
                        roundedClass,
                        {
                            "p-0": !message.content,
                            "bg-primary": userOwnsMessage && shouldShowBG,
                            "ml-auto text-primary-foreground": userOwnsMessage,
                            "bg-muted": !userOwnsMessage && shouldShowBG,
                        }
                    )}
                >
                    {message.media && message.media.length > 0 && (
                        <a href={message.media[0]} target="_blank">
                            <img
                                className="block mb-2 w-32 h-52 object-cover rounded"
                                src={message.media[0]}
                            />
                        </a>
                    )}
                    {(message.replyingToContent || message.replyingToMedia) && (
                        <ReplyContent
                            message={message.replyingToContent}
                            media={message.replyingToMedia}
                            emotes={message.replyingToEmoteUrls}
                            userOwnsMessage={userOwnsMessage}
                        />
                    )}
                    <MessageContent
                        message={message}
                        userOwnsMessage={userOwnsMessage}
                    />
                </animated.div>
                {shouldShowTime && (
                    <MessageTimestamp
                        userOwnsMessage={userOwnsMessage}
                        createdAt={message.createdAt}
                    />
                )}
            </div>
        </div>
    );
};

const MessageTimestamp = ({
    userOwnsMessage,
    createdAt,
}: {
    userOwnsMessage: boolean;
    createdAt?: Date;
}) => (
    <span
        className={cn(
            "block text-xs text-muted-foreground font-bold mt-1 mb-4",
            {
                "text-right": userOwnsMessage,
            }
        )}
    >
        {formatTimestamp(createdAt)}
    </span>
);
