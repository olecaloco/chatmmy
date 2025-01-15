import { Message } from "@/models";

interface Props {
    message: Message
}

const ChatBubbleMediaOnly = ({ message }: Props) => {
    return (
        <>
            {message.media?.map((m, i) => (
                <a key={i} draggable="false" href={m} data-fancybox="gallery">
                    <img className="w-32 h-52 object-cover rounded" draggable="false" src={m} alt="" loading="lazy" />
                </a>
            ))}
        </>
    )
}

export default ChatBubbleMediaOnly;