import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  Redirect,
  SplashScreen,
  router,
  useNavigationContainerRef,
} from "expo-router";
import { useFonts } from "expo-font";
import { isFirstLaunch, initializeDatabase } from "@/services/database";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingScreen from "@/components/Splash";
import { getAuth } from "firebase/auth";
import { collection, getDocs, where } from "firebase/firestore";
import { query } from "firebase/database";
import { database } from "@/services/firebaseConfig";
import { updateUser } from "@/legendstate/AmpelaStates";

export { ErrorBoundary } from "expo-router";

async function fetchInitialData(
  setIsFirstTime,
  setInitialRouteName,
  setLoaded
) {
  try {
    const firstLaunch = await isFirstLaunch();
    const isFirstTimeLaunch = firstLaunch?.status ?? 1;
    setIsFirstTime(isFirstTimeLaunch);

    if (isFirstTimeLaunch) {
      await initializeDatabase();
    }

    const usersCollectionRef = collection(database, "doctors");
    const q = query(
      usersCollectionRef,
      where("userId", "==", getAuth().currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    if (isFirstTimeLaunch) {
      setInitialRouteName("(discovery)");
    } else if (getAuth().currentUser) {
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        updateUser({
          id: getAuth().currentUser.uid,
          username: userData.username,
          email: userData.email,
          profileImage: userData.profileImage,
        });

        setInitialRouteName("(drawer)/(main)");
      } else {
        setInitialRouteName("(drawer)/settings/completeprofile");
      }
    } else {
      setInitialRouteName("(discovery)/login");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoaded(true);
  }
}

SplashScreen.preventAutoHideAsync();

export default function index() {
  const navigation = useNavigationContainerRef();
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [initialRouteName, setInitialRouteName] = useState("(discovery)");
  const [loaded, setLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  const [fontsLoaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
  });

  fetchInitialData(setIsFirstTime, setInitialRouteName, setLoaded);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (navigation?.isReady && initialRouteName && fontsLoaded && loaded) {
      SplashScreen.hideAsync();
      router.replace(initialRouteName);
    }
  }, [navigation?.isReady, initialRouteName, fontsLoaded, loaded]);

  return <LoadingScreen />;
}
