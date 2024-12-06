import { auth, db, storage } from "@/firebase";
import { Message } from "@/models";
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    FirestoreDataConverter,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    QuerySnapshot,
    startAfter,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { DOC_LIMIT } from "./constants";

const converter: FirestoreDataConverter<Message> = {
    toFirestore: (message) => message,
    fromFirestore: (snapshot: QueryDocumentSnapshot<Message>, options) => {
        const data = snapshot.data(options);
        const createdAt = data.createdAt as Timestamp | undefined;

        return {
            ...data,
            createdAt: createdAt ? createdAt.toDate() : createdAt,
            id: snapshot.id,
        };
    },
};

export function getEmotes(callback: (response: any) => void) {
    fetch(`https://7tv.io/v3/emote-sets/${import.meta.env.VITE_7TV_CHANNEL_ID}`)
        .then((data) => data.json())
        .then(callback)
        .catch((err) => console.error(err));
}

export function getChatSnapshot(
    callback: (snapshot: QuerySnapshot<Message>) => void
) {
    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        limit(DOC_LIMIT)
    ).withConverter(converter);

    return onSnapshot(q, callback);
}

export function getUserData(uid: string) {
    return getDoc(doc(db, 'users', uid));
}

export function fetchPreviousMessages(doc: DocumentData) {
    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        startAfter(doc),
        limit(DOC_LIMIT)
    ).withConverter(converter);

    return getDocs(q);
}

export function sendMessageToDb(data: Message) {
    return addDoc(collection(db, "messages"), data);
}

export function isAppleDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * 
 * @param file 
 * @returns A string url for the uploaded image
 */
export async function uploadFile(file: File) {
    const now = new Date().getTime();
    const name = `${now}-${file.name}`
    const imageRef = ref(storage, name);
    const snapshot = await uploadBytes(imageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
}

export async function saveDeviceToken(token: string) {
    const user = auth.currentUser;

    if (user) {
        const user_uid = user.uid === "8fn9OA8aMjSWiP9VxOB0PxkiBvj2" ? "UcqmsUDy1cXzBYyPOX12NqwaLpc2" : "8fn9OA8aMjSWiP9VxOB0PxkiBvj2"
        const userRef = doc(db, "users", user_uid);  // Reference to the user's document in the 'users' collection

        try {
            const doc = await getDoc(userRef);
            const data = doc.exists() ? doc.data() : null;

            if (data) {
                const tokens = [...data.tokens, token];
                const tokenSet = new Set(tokens);
                const filteredTokens = [...tokenSet];

                await updateDoc(userRef, { tokens: filteredTokens });
            }
        } catch (error) {
            console.error("Error updating user's name in Firestore:", error);
        }
    } else {
        console.log("No user is logged in.");
    }
}

export async function sendNotificationViaNtfy(id: string, message: string) {
    return fetch(`https://ntfy.sh/${id}`, {
        method: "POST",
        body: message,
        headers: {
            Title: "Chatmmy",
            Icon: "https://chatmmy-edcbc.web.app/favicon.ico",
            Click: "https://chatmmy-edcbc.web.app",
        },
    });
}

export async function sendNotificationViaFCM(token: string, title: string, message: string) {
    return fetch("https://chatmmy-notifier.onrender.com/send-notification", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token,
            title: title,
            message: message,
            link: "/",
        }),
    });
}