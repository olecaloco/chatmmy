import { Message } from "@/models";

interface Props {
    message: Message
}

const ChatBubbleMediaOnly = ({ message }: Props) => {
    return (
        <div>
            {message.media?.map((m, i) => (
                <a key={i} href={m} data-fancybox="gallery">
                    <img className="w-32 h-52 object-cover rounded" src={m} alt="" />
                </a>
            ))}
        </div>
    )
}

export default ChatBubbleMediaOnly;