import { normalizeMessageContent } from "@/lib/normalizeMessage";
import { cn } from "@/lib/utils";
import { Message } from "@/models";

interface Props {
    message: Message;
    isMyMessage: boolean;
}

const RepliedToBubble = ({ message, isMyMessage }: Props) => {
    const replyHasMedia = message.replyingToMedia && message.replyingToMedia.length > 0 ? true : false;

    return (
        <div
            className={
                cn("p-2 mb-1 mt-4 rounded bg-muted opacity-80", {
                    "border-4 border-l-primary": isMyMessage,
                    "border-4 border-l-white": !isMyMessage
                })
            }
        >
            <span className="block mb-2 text-xs">Replied To:</span>
            {(replyHasMedia && message.replyingToMedia) && (
                <img className="w-32 h-52 rounded object-cover" src={message.replyingToMedia[0]} alt="" />
            )}
            <div>
                {
                    normalizeMessageContent(
                        message.replyingToContent!,
                        message.replyingToEmoteUrls,
                        true,
                        isMyMessage
                    )
                }
            </div>
        </div>
    )
}

export default RepliedToBubble;