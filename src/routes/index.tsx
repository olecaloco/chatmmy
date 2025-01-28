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
    uploadFile,
} from "@/lib/api";
import { Message } from "@/models";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { DocumentData } from "firebase/firestore";
import { Image, LoaderCircle, Send } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ReplyingTo } from "@/components/app/replyingTo";
import { FilePreview } from "@/components/app/filePreview";
import { FilePreview as FilePreviewInterface } from "@/lib/types";
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const firstMessageDocRef = useRef<DocumentData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emotesRef = useRef<{ [key: string]: string }>({});

    const [filePreviews, setFilePreviews] = useState<FilePreviewInterface[]>(
        []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [incompleteEmote, setIncompleteEmote] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    const navigate = useNavigate();

    const suggestions = useMemo(() => {
        if (emotesRef.current) {
            const keys = Object.keys(emotesRef.current);
            const foundKeys = keys.filter(k => k.toLowerCase().includes(incompleteEmote.toLowerCase()));
            const sorted = [...foundKeys].sort((a, b) => {
                const lowerA = a.toLowerCase();
                const lowerB = b.toLowerCase();
                if (lowerA < lowerB) return -1;
                if (lowerA > lowerB) return 1;
                return 0;
            });
            return sorted.map(f => ({ name: f, url: emotesRef.current[f] }));
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
            getEmotes().then(emotes => {
                if (!emotes) return;
                createEmoteHashMap(emotes);
            })
        } else {
            const parsedEmotes = JSON.parse(storedEmotesMap);
            emotesRef.current = parsedEmotes;
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getChatSnapshot((snapshot) => {
            setMessages(snapshot.docs.map(d => d.data()));

            if (!snapshot.empty && !firstMessageDocRef.current) {
                firstMessageDocRef.current = snapshot.docs[snapshot.size - 1];
            }

            isFirstFetch.current = false;
        });

        return () => unsubscribe();
    }, [user]);

    const processContent = async (value: string, files: FileList | null) => {
        const data = processMessageData(value, replyingTo, user?.uid);

        try {
            if (!isUploading && files && files[0]) {
                setIsUploading(true);
                const url = await uploadFile(files[0]);
                data.media = [url];
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!isUploading) {
                sendMessageToDb(data)
                    .then(() => {
                        if (notificationPermissionStatus !== "granted") return;
                        if (!userData || !userData.tokens || userData.tokens.length === 0) return;

                        const body = !data.content && data.media ? "An image has been posted" : data.content.trim()

                        userData.tokens.forEach(token => {
                            sendNotification(token, "A New Message", body, user?.photoURL);
                        });
                    })
                    .catch(e => console.error(e));
            }
        }

        resetValues();
    };

    const resetValues = () => {
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

        // Prevent submission when there's no text or file input
        if (!value && (!files || files.length === 0)) return;

        processContent(value, files);
    };

    const onSuggestionClick = (emoteName: string) => {
        if (inputRef.current) {
            const currentText = inputRef.current.value;
            const splittedText = currentText.split(" ");
            splittedText[splittedText.length - 1] = emoteName

            setShowSuggestions(false);
            inputRef.current.value = splittedText.join(" ").trim();
            inputRef.current.focus();
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        const textParts = text.split(" ")
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
            />

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

                <FilePreview
                    isUploading={isUploading}
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
                        {!isUploading ? <Send /> : <LoaderCircle className="animate-spin" />}
                    </Button>
                </div>
            </form>
        </>
    );
}
