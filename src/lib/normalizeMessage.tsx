import { cn, isValidHttpUrl } from "./utils";

export function normalizeMessage(message: string, reply: "not-replying" | "replying" = "not-replying") {
    if (!message) return;

    let contentParts = message.split(" ");
    const emotesString = window.localStorage.getItem("emotesHashMap");
    const emotes = emotesString ? JSON.parse(emotesString) : null;

    let _content = contentParts.map((word, index) => {
        if (isValidHttpUrl(word)) {
            return <a
                className="underline"
                key={index}
                href={word}
            >
                {word}
            </a>
        }

        if (emotes) {
            const emote = emotes[word];

            if (emote) {
                const fileName = contentParts.length === 1 && reply !== "replying" ? "2x.webp" : "1x.webp";
                const fullPath = `${emote}/${fileName}`;

                return <img
                    key={index}
                    src={fullPath}
                    alt={word}
                    className={cn("inline-block mx-1 select-none", { "h-6": reply === "replying" })}
                    draggable="false"
                    title={word}
                    loading="lazy"
                />
            }
        }

        return word + " ";
    });

    return _content;
}
