import Fancybox from "@/components/fancybox";
import { normalizeMessageContent } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const ChatBubbleTextAndMedia = ({ message, isMyMessage }: Props) => {
    return (
        <div
            className={cn(
                "p-2 rounded",
                {
                    "bg-primary text-primary-foreground": isMyMessage,
                    "bg-muted": !isMyMessage,
                }
            )}
        >
            <Fancybox>
                {message.media?.map((m, i) => (
                    <a key={i} href={m} data-fancybox="gallery">
                        <img className="w-32 h-52 object-cover rounded" src={m} alt="" />
                    </a>
                ))}
            </Fancybox>
            <div className="mt-2">
                {
                    normalizeMessageContent(
                        message.content,
                        message.emoteUrls,
                        false,
                        isMyMessage
                    )
                }
            </div>
        </div>
    )
}

export default ChatBubbleTextAndMedia;