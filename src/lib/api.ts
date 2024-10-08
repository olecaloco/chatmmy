import { db } from "@/firebase";
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
} from "firebase/firestore";

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
        limit(50)
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
        limit(50)
    ).withConverter(converter);

    return getDocs(q);
}

export function sendMessageToDb(data: Message) {
    return addDoc(collection(db, "messages"), data);
}
