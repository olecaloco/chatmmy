import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { saveDeviceToken } from "./lib/api";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

export const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(firebaseApp) : null;
};

(async function() {
    const m = await messaging();
    if (!m) return;

    onMessage(m, () => {});
})();

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            const token = await getToken(fcmMessaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            saveDeviceToken(token);
            return token;
        }
        return null;
    } catch (err) {
        console.error("An error occurred while fetching the token:", err);
        return null;
    }
};

// if (import.meta.env.DEV) {
//     const { connectAuthEmulator } = await import("firebase/auth");
//     const { connectFirestoreEmulator } = await import("firebase/firestore");
//     const { connectStorageEmulator } = await import("firebase/storage");

//     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectStorageEmulator(storage, "127.0.0.1", 9199);
// }