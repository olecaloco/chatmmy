import { normalizeMessage } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message, STATUS } from "@/models";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const ChatBubbleTextAndMedia = ({ message, isMyMessage }: Props) => {
    return (
        <>
            {message.media?.map((m, i) => (
                <a key={i} href={m} draggable="false" data-fancybox="gallery">
                    <img className="w-32 h-52 object-cover rounded" draggable="false" src={m} alt="" loading="lazy" />
                </a>
            ))}
            <div
                className={cn(
                    "p-2 rounded",
                    {
                        "opacity-50": isMyMessage && message.status === STATUS.SENDING,
                        "bg-primary text-primary-foreground": isMyMessage,
                        "bg-muted": !isMyMessage,
                    }
                )}
            >
                {normalizeMessage(message.content)}
            </div>
        </>
    )
}

export default ChatBubbleTextAndMedia;