/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import Icon from "@/assets/icon.svg";
import { getUserData } from "@/lib/api";

type UserData = {
  id: string;
  tokens: string[]
}

interface User {
  user: FirebaseUser | null;
  userData: UserData | null;
}

const userObj: User = { user: null, userData: null};
export const AuthContext = React.createContext(userObj);

export const useAuthContext = () => React.useContext<User>(AuthContext);

const Loader = () => (
  <div className="h-dvh flex items-center justify-center flex-1">
    <img className="w-24" src={Icon} alt="Chatmmy" />
  </div>
)

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userData, setData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {

        setUser(user);

        getUserData(user.uid)
            .then((snapshot) => {
                if (snapshot.exists() && snapshot.data()) {
                    const snapshotData = snapshot.data();
                    setData({ id: snapshotData.id, tokens: snapshotData.tokens });
                }

                setUser(user);
            }).catch(e => {
              console.error(e)
              setUser(user);
            });

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData }}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};