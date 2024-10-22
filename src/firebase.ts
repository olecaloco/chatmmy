import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getMessaging, getToken } from "firebase/messaging";
// import { httpsCallable, getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
// export const messaging = getMessaging(firebaseApp);
// export const functions = getFunctions(firebaseApp, "asia-southeast1");
// const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
// const saveToken = httpsCallable(functions, "saveToken");

export const setupNotifications = async () => {
    // try {
    //     const permission = await Notification.requestPermission();

    //     if (permission === "granted") {
    //         console.log("Notification permission granted.");
    //         const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    //         window.localStorage.setItem("token", token);
    //         // await saveToken({ token });
    //     } else {
    //         console.log("Notification permission denied.");
    //     }
    // } catch (error) {
    //     console.error("Error setting up notifications:", error);
    // }
};

// if (import.meta.env.DEV) {
//     const { connectAuthEmulator } = await import("firebase/auth");
//     const { connectFirestoreEmulator } = await import("firebase/firestore");
//     const { connectFunctionsEmulator } = await import("firebase/functions");

//     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectFunctionsEmulator(functions, "127.0.0.1", 5001);
// }