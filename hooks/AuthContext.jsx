import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "@/services/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isConnected, isInternetReachable } = useNetInfo();

  useEffect(() => {
    if (isConnected && isInternetReachable) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsAuthenticated(true);
          const q = query(
            collection(database, "users"),
            where("userId", "==", user?.uid)
          );
          // console.log(user);
          const querySnapshot = await getDocs(q);
          let userProfile = null;

          querySnapshot.forEach((doc) => {
            userProfile = doc.data();
          });

          if (userProfile) {
            // console.log("User profile:", userProfile);

            setUserProfile(userProfile);
          } else {
            // console.error("No such user document!");
          }

          setUser(user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserProfile(null);
        }
      });
      return unsub;
    }
  }, [isConnected, isInternetReachable]);

  return (
    <AuthContext.Provider value={{ user, userProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
