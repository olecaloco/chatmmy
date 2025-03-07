import { normalizeMessage } from "@/lib/normalizeMessage";
import { X } from "lucide-react";
import { Message } from "@/models";
import { Button } from "../ui/button";

export const ReplyingTo = ({
    replyingTo,
    setReplyingTo,
}: {
    replyingTo: Message | null;
    setReplyingTo: any;
}) => {
    return (
        <div className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 mt-2 bg-muted overflow-hidden">
                <div className="flex gap-2 items-center flex-1 truncate">
                    <span className="text-xs font-bold">
                        Replying To:
                    </span>
                    {(replyingTo?.media &&
                        replyingTo?.media.length > 0) && (
                            <img
                                className="w-12 h-12 object-cover"
                                src={replyingTo.media[0]}
                                alt=""
                                loading="lazy"
                            />
                        )}
                    <span className="text-sm">
                        {normalizeMessage(replyingTo?.content ?? "", "replying")}
                    </span>
                </div>
                <Button
                    className="w-6 h-6 p-0 rounded-full"
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                    type="button"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
};
