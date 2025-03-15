import { auth, db, storage } from "@/firebase";
import { Checklist, Message } from "@/models";
import {
    addDoc,
    collection,
    deleteDoc,
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
    setDoc,
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

const checklistConverter: FirestoreDataConverter<Checklist> = {
    toFirestore: (checklist) => checklist,
    fromFirestore: (snapshot: QueryDocumentSnapshot<Checklist>, options) => {
        const data = snapshot.data(options);
        
        return {
            ...data,
            id: snapshot.id
        } as Checklist
    }
}

export function createEmoteHashMap(emotes: any[]) {
    const hashmap: {[key: string]: string} = {};

    for (let i = 0; i < emotes.length; i++) {
        const emoteObj = emotes[i];
        const emoteName = emoteObj.name;
        const emoteURL = emoteObj.data.host.url;

        hashmap[emoteName] = emoteURL;
    }

    const hashmapString = JSON.stringify(hashmap);
    window.localStorage.setItem("emotesHashMap", hashmapString);
}

export async function getEmotes() {
    try {
        const fetchGlobal = fetch("https://7tv.io/v3/emote-sets/global");
        const fetchEmoteSet = fetch(`https://7tv.io/v3/emote-sets/${import.meta.env.VITE_7TV_CHANNEL_ID}`);

        const [globalResponse, setResponse] = await Promise.all([fetchGlobal, fetchEmoteSet]);
        const globalEmotes = await globalResponse.json();
        const setEmotes = await setResponse.json();

        const emotes = [...globalEmotes.emotes, ...setEmotes.emotes];
        
        return emotes;
    } catch (error) {
        console.error(error);
    }
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

export async function sendMessageToDb(data: Message) {
    return addDoc(collection(db, "messages"), data);
}

/**
 * 
 * @param file 
 * @returns A string url for the uploaded image
 */
export async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("image", file);

    const data = await fetch("https://chatmmy-notifier.onrender.com/image-processing", {
        "method": "POST",
        body: fd
    });

    const blob = await data.blob()

    const now = new Date().getTime();
    const name = `${now}-${file.name}`
    const imageRef = ref(storage, name);
    const snapshot = await uploadBytes(imageRef, blob);
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

export function getChecklistsSnapshot(
    callback: (snapshot: QuerySnapshot<Checklist>) => void
) {
    const q = query(
        collection(db, "checklists"),
        orderBy("createdAt", "desc"),
        limit(DOC_LIMIT)
    ).withConverter(checklistConverter);

    return onSnapshot(q, callback);
}

export async function getChecklist(id: string) {
    const d = doc(db, `checklists/${id}`).withConverter(checklistConverter);
    const snapshot = await getDoc(d);

    if (!snapshot.exists()) return undefined;

    return snapshot.data();
}

export async function saveChecklist(checklist: Checklist, id?: string): Promise<string> {
    if (!id || id === "createForm") {
        const document = await addDoc(collection(db, "checklists"), checklist);
        return document.id;
    } else {
        const d = doc(db, `checklists/${id}`);
        await setDoc(d, checklist, { merge: true });
        return id;
    }
}

export async function deleteChecklist(id: string) {
    const d = doc(db, `checklists/${id}`);
    await deleteDoc(d);
}