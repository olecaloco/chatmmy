import { cn, isValidHttpUrl } from "./utils";

export function normalizeMessage(message: string, type: "not-reply" | "reply" = "not-reply") {
    if (!message) return;

    let contentParts = message.split(" ");
    const reply = type === "reply" ? true : false;
    const emotesString = window.localStorage.getItem("emotes");

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

        if (emotesString) {
            const emotes = JSON.parse(emotesString);
            const emote = emotes.find((e: any) => e.name === word);

            if (emote) {
                const url = emote.data.host.url;
                const fileName = contentParts.length === 1 ? "2x.webp" : "1x.webp";
                const fullPath = `${url}/${fileName}`;

                return <img key={index} src={fullPath} alt={word} className={cn("inline-block", { "h-6": reply })} title={word} loading="lazy" />
            }
        }

        return word + " ";
    });

    return _content;
}
