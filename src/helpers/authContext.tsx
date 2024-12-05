import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import Icon from "@/assets/icon.svg";
import { doc, onSnapshot } from "firebase/firestore";

type UserData = {
    id: string;
    tokens: string[]
}

interface User {
    user: FirebaseUser | null;
    userData: UserData | null;
}

const userObj: User = { user: null, userData: null };
export const AuthContext = createContext(userObj);

export const useAuthContext = () => useContext<User>(AuthContext);

const Loader = () => (
    <div className="h-dvh flex items-center justify-center flex-1">
        <img className="w-24" src={Icon} alt="Chatmmy" />
    </div>
)

export const AuthContextProvider = ({ children }: any) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), snapshot => {
            const data = snapshot.data();
            if (!snapshot.exists() || !data) return;

            setData({ id: data.id, tokens: data.tokens })
        });

        return () => unsubscribe();
    }, [user])

    return (
        <AuthContext.Provider value={{ user, userData }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};