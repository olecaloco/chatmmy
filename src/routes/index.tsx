import { Messages } from "@/components/app/messages";
import { Suggestions } from "@/components/app/suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/helpers/authContext";
import {
    createEmoteHashMap,
    getChatSnapshot,
    getEmotes,
    sendMessageToDb,
    sendNotification,
} from "@/lib/api";
import { Message } from "@/models";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { DocumentData } from "firebase/firestore";
import { Send } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ReplyingTo } from "@/components/app/replyingTo";
import useFcmToken from "@/hooks/use-fcm-token";
import { processMessageData } from "@/lib/utils";

export const Route = createFileRoute("/")({
    beforeLoad: ({ context, location }) => {
        if (!context.user.user) {
            throw redirect({
                to: "/signin",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: Index,
});

function Index() {
    const { notificationPermissionStatus } = useFcmToken();

    const { user, userData } = useAuthContext();
    const isFirstFetch = useRef(true);

    const firstMessageDocRef = useRef<DocumentData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emotesRef = useRef<{ [key: string]: string }>({});
    const [messages, setMessages] = useState<Message[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [incompleteEmote, setIncompleteEmote] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    const navigate = useNavigate();

    const suggestions = useMemo(() => {
        if (emotesRef.current) {
            const keys = Object.keys(emotesRef.current);
            const foundKeys = keys.filter((k) =>
                k.toLowerCase().includes(incompleteEmote.toLowerCase())
            );
            const sorted = [...foundKeys].sort((a, b) => {
                const lowerA = a.toLowerCase();
                const lowerB = b.toLowerCase();
                if (lowerA < lowerB) return -1;
                if (lowerA > lowerB) return 1;
                return 0;
            });
            return sorted.map((f) => ({ name: f, url: emotesRef.current[f] }));
        } else {
            return [];
        }
    }, [incompleteEmote]);

    useEffect(() => {
        if (user === null) navigate({ to: "/signin" });
    }, [navigate, user]);

    useEffect(() => {
        const storedEmotesMap = window.localStorage.getItem("emotesHashMap");

        if (!storedEmotesMap) {
            getEmotes().then((emotes) => {
                if (!emotes) return;
                createEmoteHashMap(emotes);
            });
        } else {
            const parsedEmotes = JSON.parse(storedEmotesMap);
            emotesRef.current = parsedEmotes;
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getChatSnapshot((snapshot) => {
            setMessages(snapshot.docs.map((d) => d.data()));

            if (!snapshot.empty && !firstMessageDocRef.current) {
                firstMessageDocRef.current = snapshot.docs[snapshot.size - 1];
            }

            isFirstFetch.current = false;
        });

        return () => unsubscribe();
    }, [user]);

    const processContent = async (value: string) => {
        const data = processMessageData(value, replyingTo, user?.uid);

        sendMessageToDb(data)
            .then(() => {
                if (notificationPermissionStatus !== "granted") return;
                if (
                    !userData ||
                    !userData.tokens ||
                    userData.tokens.length === 0
                )
                    return;

                const body = data.content.trim();

                userData.tokens.forEach((token) => {
                    sendNotification(
                        token,
                        "A New Message",
                        body,
                        user?.photoURL
                    );
                });
            })
            .catch((e) => console.error(e));

        resetValues();
    };

    const resetValues = () => {
        setReplyingTo(null);

        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
        }
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setShowSuggestions(false);
        const value = inputRef.current!.value;

        // Prevent submission when there's no text or file input
        if (!value) return;

        processContent(value);
    };

    const onSuggestionClick = (emoteName: string) => {
        if (inputRef.current) {
            const currentText = inputRef.current.value;
            const splittedText = currentText.split(" ");
            splittedText[splittedText.length - 1] = emoteName;

            setShowSuggestions(false);
            inputRef.current.value = splittedText.join(" ").trim();
            inputRef.current.focus();
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        const textParts = text.split(" ");
        const lastPart = textParts[textParts.length - 1];
        const isLastPartEmote = lastPart.startsWith(":");
        const emoteFragment = lastPart.slice(1);

        if (isLastPartEmote && emoteFragment) {
            if (!showSuggestions) setShowSuggestions(true);
            setIncompleteEmote(emoteFragment);
        } else {
            setShowSuggestions(false);
        }
    };

    const debounced = useDebouncedCallback(handleInput, 250);

    const onReply = (message: Message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    };

    if (!user) return null;

    return (
        <>
            <Messages messages={messages} onReply={onReply} />

            <form className="relative" onSubmit={onSubmit}>
                {showSuggestions && suggestions.length > 0 && (
                    <Suggestions
                        suggestions={suggestions}
                        onSuggestionClick={onSuggestionClick}
                    />
                )}

                {replyingTo && (
                    <ReplyingTo
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                    />
                )}

                <div className="flex gap-2 p-4 pb-10 border-t">
                    <Input
                        className="bg-muted flex-1 rounded-full"
                        ref={inputRef}
                        autoComplete="off"
                        placeholder="Message"
                        onChange={(e) => debounced(e)}
                    />

                    <Button className="rounded-full" title="Send" size="icon">
                        <Send />
                    </Button>
                </div>
            </form>
        </>
    );
}
