import { Message } from "@/models";
import { MessageItem } from "./messageItem";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { memo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export const Messages = memo(
    ({
        messages,
        onReply,
    }: {
        messages: Message[];
        onReply: (message: Message) => void;
    }) => {
        const scrollableRef = useRef<HTMLDivElement>(null);
        const [showButton, setShowButton] = useState(false);

        const handleScroll = () => {
            if (!scrollableRef.current) return;
            const { scrollTop } = scrollableRef.current;
            const shouldShow = scrollTop < 0;
            setShowButton(shouldShow);
        };

        const scrollToBottom = () => {
            if (scrollableRef.current) {
                scrollableRef.current.scrollTop = 0;
            }
        };

        const debounced = useDebouncedCallback(handleScroll, 250);

        return (
            <div className="flex-1 relative overflow-hidden">
                <ScrollToBottomButton
                    showButton={showButton}
                    scrollToBottom={scrollToBottom}
                />
                <div
                    ref={scrollableRef}
                    onScroll={() => debounced()}
                    className="h-full flex flex-col-reverse space-y-px space-y-reverse px-4 pb-4 overflow-y-auto"
                >
                    {messages.map((message, index) => (
                        <MessageItem
                            messages={messages}
                            messageIndex={index}
                            key={message.id}
                            message={message}
                            onReply={onReply}
                        />
                    ))}
                </div>
            </div>
        );
    }
);

const ScrollToBottomButton = ({
    showButton,
    scrollToBottom,
}: {
    showButton: boolean;
    scrollToBottom: () => void;
}) => (
    <Button
        className={cn(
            "absolute bottom-1 left-1/2 w-7 h-7 -translate-x-1/2 z-10 rounded-full",
            {
                hidden: !showButton,
            }
        )}
        size="icon"
        onClick={scrollToBottom}
    >
        <ChevronDown className="w-4 h-4" />
    </Button>
);
