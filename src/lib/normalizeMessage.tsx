import { EmoteType } from "@/contexts/EmoteContextProvider";
import { cn, isValidHttpUrl } from "./utils";

export function normalizeMessage(
    message: string,
    reply: "not-replying" | "replying" = "not-replying",
    emotes: EmoteType = null,
) {
    if (!message) return;

    let contentParts = message.split(" ");
    const allEmotes = contentParts.every((fragment) => {
        const emote = emotes ? emotes[fragment] : null;
        if (emote) return true;
        else return false;
    });

    let _content = contentParts.map((word, index) => {
        if (isValidHttpUrl(word)) {
            return (
                <a className="underline" key={index} href={word}>
                    {word}
                </a>
            );
        }

        if (emotes) {
            const emote = emotes[word];

            if (emote) {
                const fileName =
                    (contentParts.length === 1 && reply !== "replying") ||
                    (allEmotes && reply !== "replying")
                        ? "2x.webp"
                        : "1x.webp";
                const fullPath = `${emote}/${fileName}`;

                return (
                    <img
                        key={index}
                        src={fullPath}
                        alt={word}
                        className={cn("inline-block mx-1 select-none", {
                            "h-6": reply === "replying",
                            "max-w-full": allEmotes,
                            "h-auto": allEmotes,
                            "flex-grow-1": allEmotes,
                            "flex-shrink-1": allEmotes,
                            "min-w-0": allEmotes,
                        })}
                        draggable="false"
                        title={word}
                        loading="lazy"
                    />
                );
            }
        }

        return word + " ";
    });

    return _content;
}
