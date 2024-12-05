import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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

const saveToken = async (token: string) => {
    const user = auth.currentUser;

    if (user) {
        const user_uid = user.uid === "8fn9OA8aMjSWiP9VxOB0PxkiBvj2" ? "UcqmsUDy1cXzBYyPOX12NqwaLpc2" : "8fn9OA8aMjSWiP9VxOB0PxkiBvj2"
        const userRef = doc(db, "users", user_uid);  // Reference to the user's document in the 'users' collection

        try {
            // Update the user's name in Firestore
            await updateDoc(userRef, {
                token: token,  // Update the 'name' field (or any other field)
            });
        } catch (error) {
            console.error("Error updating user's name in Firestore:", error);
        }
    } else {
        console.log("No user is logged in.");
    }
}

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            const token = await getToken(fcmMessaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            saveToken(token);
            return token;
        }
        return null;
    } catch (err) {
        // @ts-ignore
        alert(err.message);
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