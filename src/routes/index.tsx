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
    uploadFile,
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
    const isFirstFetch = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const firstMessageDocRef = useRef<DocumentData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emotesRef = useRef<Emote_API[]>([]);

    const [filePreviews, setFilePreviews] = useState<FilePreviewInterface[]>(
        []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
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
        if (!user) return;

        const unsub = getChatSnapshot((snapshot) => {
            const _messages = [] as Message[];

            snapshot.docChanges().forEach((change) => {
                const messageData = change.doc.data();

                if (change.type === "added") {
                    if (
                        !change.doc.metadata.fromCache &&
                        messageData.senderId === user.uid &&
                        !isFirstFetch.current
                    ) {
                        fetch(`https://ntfy.sh/${user.uid}`, {
                            method: "POST",
                            body: messageData.content.trim(),
                            headers: {
                                Title: "Chatmmy",
                                Icon: "https://chatmmy-edcbc.web.app/favicon.ico",
                                Click: "https://chatmmy-edcbc.web.app",
                            },
                        });
                    }

                    _messages.push(messageData);
                }
            });

            if (!snapshot.empty && !firstMessageDocRef.current) {
                firstMessageDocRef.current = snapshot.docs[snapshot.size - 1];
            }

            isFirstFetch.current = false;
            setMessages((m) => [..._messages, ...m]);
        });

        return unsub;
    }, [user]);

    const processEmoteQueue = (value: string) => {
        let _emoteQueue = [...emoteQueue];
        const content = value.trim();

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

        return _emoteQueue;
    }

    const processMessageData = (value: string, fileOnly = false) => {
        const content = value.trim();
        const now = new Date();
        const _emoteQueue = processEmoteQueue(value);

        const data: any = {
            content: content ?? "",
            senderId: user?.uid,
            createdAt: now,
            emoteUrls: fileOnly ? [] : _emoteQueue,
            media: [],
        };

        if (replyingTo) {
            data.replyingTo = replyingTo.id;
            data.replyingToContent = replyingTo.content;
            data.replyingToEmoteUrls = replyingTo.emoteUrls;
            if (replyingTo.media) {
                data.replyingToMedia = replyingTo.media;
            }
        }

        return data;
    }

    const processContent = async (value: string, files: FileList | null) => {
        const data = processMessageData(value);

        try {
            if (!isUploading && files && files[0]) {
                setIsUploading(true);
                const url = await uploadFile(files[0]);
                data.media = [url];
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!isUploading) sendMessageToDb(data).catch(e => console.error(e));
        }

        resetValues();
    };

    const resetValues = () => {
        setEmoteQueue([]);
        setReplyingTo(null);
        setFilePreviews([]);
        setIsUploading(false);

        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isUploading) return;

        setShowSuggestions(false);
        const value = inputRef.current!.value;
        const files = fileInputRef.current!.files;

        processContent(value, files);
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
        if (!firstMessageDocRef.current) return;

        setLoadingPrevious(true);
        const documents = await fetchPreviousMessages(firstMessageDocRef.current);

        if (!documents.empty) {
            const _messages = documents.docs.map((d) => d.data());
            firstMessageDocRef.current = documents.docs[documents.size - 1];
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

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const clipboardItems = event.clipboardData.items;
        const itemsAreAllString = [...clipboardItems].every(item => item.kind === "string");

        if (itemsAreAllString) return;
        event.preventDefault();

        for (let i = 0; clipboardItems.length > i; i++) {
            const item = clipboardItems[i];

            if (item.kind === "file" && item.type.startsWith('image')) {
                const file = item.getAsFile();

                // Populate the hidden file input with the image file
                if (file && fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInputRef.current.files = dataTransfer.files;

                    const changeEvent = new Event('change', { bubbles: true });
                    fileInputRef.current.dispatchEvent(changeEvent);
                }

                break; // We don't need to check further once an image is found
            }
        }
    }

    const onRemoveFiles = () => {
        setFilePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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

                <FilePreview
                    files={filePreviews}
                    onRemoveFiles={onRemoveFiles}
                />

                <div className="flex gap-2 p-4 pb-10 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        title="Upload"
                        size="icon"
                        disabled={isUploading}
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
                        onPaste={handlePaste}
                        disabled={isUploading}
                    />
                    <Button className="rounded-full" title="Send" size="icon" disabled={isUploading}>
                        <Send />
                    </Button>
                </div>
            </form>
        </>
    );
}
