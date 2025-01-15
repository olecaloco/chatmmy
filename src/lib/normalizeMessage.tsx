import { isValidHttpUrl } from "./utils";

export function normalizeMessage(message: string) {
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
                const fileName = contentParts.length === 1 ? "2x.webp" : "1x.webp";
                const fullPath = `${emote}/${fileName}`;

                return <img key={index} src={fullPath} alt={word} className="inline-block mx-1" title={word} loading="lazy" />
            }
        }

        return word + " ";
    });

    return _content;
}
