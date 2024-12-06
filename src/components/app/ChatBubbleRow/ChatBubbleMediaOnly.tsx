import { Message } from "@/models";

interface Props {
    message: Message
}

const ChatBubbleMediaOnly = ({ message }: Props) => {
    return (
        <div>
            {message.media?.map((m, i) => <img key={i} className="w-32 h-52 object-cover rounded" src={m} alt="" />)}
        </div>
    )
}

export default ChatBubbleMediaOnly;