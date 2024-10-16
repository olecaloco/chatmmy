import { Message } from "@/models";
import { MessageItem } from "./messageItem";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { memo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export const Messages = memo(({
    messages,
    loadMoreLoading,
    onReply,
    handleLoadMore,
}: {
    messages: Message[];
    loadMoreLoading: boolean;
    onReply: (message: Message) => void;
    handleLoadMore: () => void;
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
            <ScrollToBottomButton showButton={showButton} scrollToBottom={scrollToBottom} />
            <div
                ref={scrollableRef}
                onScroll={() => debounced()}
                className="h-full flex flex-col-reverse space-y-reverse px-4 overflow-y-auto"
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
                {messages.length > 0 && (
                    <LoadMoreButton
                        loading={loadMoreLoading}
                        handleLoadMore={handleLoadMore}
                    />
                )}
            </div>
        </div>
    );
}, (prev, next) => {
    if (prev.messages.length === next.messages.length) { 
        return true;
    } else {
        return false;
    }
});

const LoadMoreButton = ({
    handleLoadMore,
    loading,
}: {
    handleLoadMore: () => void;
    loading: boolean;
}) => (
    <Button
        className="rounded-none mb-4"
        disabled={loading}
        variant="ghost"
        onClick={handleLoadMore}
    >
        {loading ? (
            <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
        ) : (
            "Load old messages"
        )}
    </Button>
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
            "absolute bottom-1 left-1/2 w-7 h-7 -translate-x-1/2 z-10 rounded-full bg-blue-500 hover:bg-blue-600",
            {
                hidden: !showButton,
            }
        )}
        variant="secondary"
        size="icon"
        onClick={scrollToBottom}
    >
        <ChevronDown className="w-4 h-4" />
    </Button>
);
