import { Messages } from "@/components/app/messages";
import { Suggestions } from "@/components/app/suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/helpers/authContext";
import {
    fetchPreviousMessages,
    getChatSnapshot,
    getEmotes,
    sendMessageToDb,
} from "@/lib/api";
import { Emote_API, Message } from "@/models";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { DocumentData } from "firebase/firestore";
import { Image, Send } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ReplyingTo } from "@/components/app/replyingTo";
import { FilePreview } from "@/components/app/filePreview";
import { FilePreview as FilePreviewInterface } from "@/lib/types";

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
    const { user } = useAuthContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emotesRef = useRef<Emote_API[]>([]);

    const [filePreviews, setFilePreviews] = useState<FilePreviewInterface[]>(
        []
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [firstMessageDoc, setFirstMessageDoc] = useState<DocumentData | null>(
        null
    );
    const [loadingPrevious, setLoadingPrevious] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [incompleteEmote, setIncompleteEmote] = useState("");
    const [emoteQueue, setEmoteQueue] = useState<{ [key: string]: string }[]>(
        []
    );
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    const navigate = useNavigate();

    const suggestions = useMemo(
        () =>
            emotesRef.current.filter((e) => {
                return e.name
                    .toLowerCase()
                    .includes(incompleteEmote.toLowerCase());
            }),
        [incompleteEmote]
    );

    useEffect(() => {
        if (user === null) navigate({ to: "/signin" });
    }, [navigate, user]);

    useEffect(() => {
        const storedEmotes = window.localStorage.getItem("emotes");
        if (!storedEmotes) {
            getEmotes((response) => {
                window.localStorage.setItem(
                    "emotes",
                    JSON.stringify(response.emotes)
                );
                emotesRef.current = response.emotes;
            });
        } else {
            const parsedEmotes = JSON.parse(storedEmotes);
            emotesRef.current = parsedEmotes;
        }
    }, []);

    useEffect(() => {
        const unsub = getChatSnapshot((snapshot) => {
            const _messages: Message[] = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    _messages.push(change.doc.data());
                }
            });

            if (!snapshot.empty) {
                setFirstMessageDoc((p) => {
                    if (p) return p;
                    return snapshot.docs[snapshot.size - 1];
                });
            }

            setMessages((m) => [..._messages, ...m]);
        });

        return unsub;
    }, []);

    const processContent = async (value: string) => {
        let _emoteQueue = [...emoteQueue];
        let content = value.replace(/\n/g, "\\n");
        const now = new Date();

        const words = content.trim().split(/\s+/);
        if (words.length === 1) {
            const key = words[0];
            const _singleQueue = emoteQueue.reduce(
                (acc, emote) => ({ ...acc, ...emote }),
                {}
            );
            if (_singleQueue[key]) {
                const url = _singleQueue[key].replace("1x", "2x");
                _emoteQueue = [{ [key]: url }];
            }
        }

        const data: any = {
            content: content.trim(),
            senderId: user?.uid,
            createdAt: now,
            emoteUrls: _emoteQueue,
        };

        if (replyingTo) {
            data.replyingTo = replyingTo.id;
            data.replyingToContent = replyingTo.content;
            data.replyingToEmoteUrls = replyingTo.emoteUrls;
        }

        if (user) {
            try {
                sendMessageToDb(data).then(() => {
                    fetch(`https://ntfy.sh/${user.uid}`, {
                        method: "POST",
                        body: content.trim(),
                        headers: {
                            Title: "Chatmmy",
                            Icon: "https://chatmmy-fullstack.onrender.com/pwa-64x64.png",
                            Click: "https://chatmmy-edcbc.web.app",
                        },
                    });
                });
            } catch (error) {
                console.error(error);
            }
        }

        setEmoteQueue([]);
        setReplyingTo(null);

        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
        }
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (inputRef.current) {
            setShowSuggestions(false);
            const value = inputRef.current.value;

            if (value) {
                processContent(value);
            }
        }
    };

    const onSuggestionClick = (emoteName: string) => {
        if (inputRef.current) {
            const text = inputRef.current.value;
            const newText = text.replace(
                /:(\w+)(?!:)(?<!:\w+:)/g,
                `${emoteName}`
            );
            inputRef.current.value = newText;
            setShowSuggestions(false);

            const emote = suggestions.find((e) => e.name === emoteName);

            if (emote) {
                const { host } = emote.data;
                const url = host.url + "/" + "1x.webp";
                setEmoteQueue([...emoteQueue, { [emoteName]: url }]);
            }

            inputRef.current.focus();
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;

        // Split text into words and potential emote parts
        const parts = text
            .split(/\s+/)
            .filter((part) => part !== "" || part !== undefined);

        // Find the last potential emote part
        const lastEmotePart = parts.reduceRight((acc, part) => {
            if (
                part.startsWith(":") &&
                !part.endsWith(":") &&
                !/^:\w+:$/.test(part)
            ) {
                return part.slice(1);
            }
            return acc;
        }, "");

        if (lastEmotePart) {
            if (!showSuggestions) {
                setShowSuggestions(true);
            }

            setIncompleteEmote(lastEmotePart);
        } else {
            setShowSuggestions(false);
        }
    };

    const debounced = useDebouncedCallback(handleInput, 250);

    const onReply = (message: Message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    };

    const handleLoadMore = async () => {
        if (!firstMessageDoc) return;

        setLoadingPrevious(true);

        const documents = await fetchPreviousMessages(firstMessageDoc);

        if (!documents.empty) {
            const _messages = documents.docs.map((d) => d.data());
            setFirstMessageDoc(documents.docs[documents.size - 1]);
            setMessages((m) => [...m, ..._messages]);
        }

        setLoadingPrevious(false);
    };

    if (!user) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            const previews = fileArray.map((file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);

                return new Promise<FilePreviewInterface>((resolve) => {
                    reader.onloadend = () => {
                        resolve({ name: file.name, src: reader.result });
                    };
                });
            });

            Promise.all(previews).then((results) => {
                setFilePreviews(results);
            });
        }
    };

    const onRemoveFiles = () => {
        setFilePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <>
            <Messages
                messages={messages}
                onReply={onReply}
                handleLoadMore={handleLoadMore}
                loadMoreLoading={loadingPrevious}
            />

            <form className="relative" onSubmit={onSubmit}>
                {showSuggestions && suggestions.length > 0 && (
                    <Suggestions
                        suggestions={suggestions}
                        onSuggestionClick={onSuggestionClick}
                    />
                )}

                <ReplyingTo
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                />
                <FilePreview files={filePreviews} onRemoveFiles={onRemoveFiles} />

                <div className="flex gap-2 p-4 pb-10 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        title="Upload"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image />
                    </Button>
                    <Input
                        className="hidden"
                        ref={fileInputRef}
                        type="file"
                        name="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
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
