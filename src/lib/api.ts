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

export function setupEmotesHashmap(emotes: any) {
    console.log(emotes);
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

    if (!user) return;
    
    const usersRef = collection(db, "users");

    try {
        const snapshot = await getDocs(usersRef);

        if (snapshot.empty) throw new Error("No users found!");

        const doc = snapshot.docs.find(doc => doc.id !== user.uid);

        if (!doc) throw new Error("User document not found!")
        
        const ref = doc.ref;
        const data = doc.data();
        const tokens = [...data.tokens, token];
        const tokenSet = new Set(tokens);
        const filteredTokens = [...tokenSet];
        await updateDoc(ref, { tokens: filteredTokens });

    } catch (error) {
        console.error("Error updating user's name in Firestore:", error);
    }   
}

export async function sendNotification(token: string, title: string, message: string, icon?: string | null) {
    return fetch("https://chatmmy-notifier.onrender.com/send-notification", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token,
            title: title,
            message: message,
            icon: icon,
            link: "https://chatmmy.edcbc.web.app",
        }),
    });
}