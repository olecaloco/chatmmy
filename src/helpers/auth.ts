/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged as _onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/firebase";

export function onAuthStateChanged(cb: any) {
    return _onAuthStateChanged(auth, cb);
}

export async function signInWithEmailPassword(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        alert(error.message)
        console.error("Error signing in with Google", error);
    }
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google", error);
    }
}

export async function signOut() {
    try {
        return auth.signOut();
    } catch (error) {
        console.error("Error signing out with Google", error);
    }
}