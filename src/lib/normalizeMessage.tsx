import { Message } from "@/models";
import { cn, isValidHttpUrl } from "./utils";

export function normalizeMessageContent(message: string, emotes?: Message["emoteUrls"], reply?: boolean, userOwnsMessage?: boolean) {
    if (!message) return;

    let content = message.replace(/\\n/g, '\n');
    let contentParts = content.split(/ /g);

    let _content = contentParts.map((word, index) => {
        if (isValidHttpUrl(word)) {
            return <a
                className={cn("text-blue-500 visited:text-purple-600 underline", {
                    "dark:text-[#8cc7e5] dark:visited:text-[#ff91a4]": !userOwnsMessage
                })}
                key={index}
                href={word}
            >
                {word}
            </a>
        }

        if (emotes && emotes.length > 0) {
            const emote = emotes.find(e => e[word]);
            if (emote) {
                const value = emote[word];
                return <img key={index} src={value} alt={word} className={cn("inline-block", { "h-6": reply })} title={word} />
            }
        }

        return word + " ";
    });

    return _content;
}
