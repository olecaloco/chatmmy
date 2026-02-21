import { createEmoteHashMap, getEmotes } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

export type EmoteType = { [key: string]: string } | null;

export const emoteContext = createContext<EmoteType>(null);

export const EmoteContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [emotes, setEmotes] = useState<EmoteType>(null);

    useEffect(() => {
        const storedEmotesMap = window.localStorage.getItem("emotesHashMap");

        if (!storedEmotesMap) {
            getEmotes().then((emotes) => {
                if (!emotes) return;
                createEmoteHashMap(emotes);
            });
        } else {
            const parsedEmotes = JSON.parse(storedEmotesMap);
            setEmotes(parsedEmotes);
        }
    }, []);

    return (
        <emoteContext.Provider value={emotes}>{children}</emoteContext.Provider>
    );
};

export const useEmoteContext = () => {
    const context = useContext(emoteContext);
    if (context === null) {
        throw new Error(
            "useEmoteContext must be used within an EmoteContextProvider",
        );
    }
    return context;
};
