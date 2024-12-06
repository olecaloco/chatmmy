import { formatTimestamp } from "@/lib/utils";

const ChatTimestamp = ({ createdAt }: { createdAt?: Date; }) => (
    <span className="block text-xs text-muted-foreground font-bold mt-2 mb-4">
        {formatTimestamp(createdAt)}
    </span>
);

export default ChatTimestamp;