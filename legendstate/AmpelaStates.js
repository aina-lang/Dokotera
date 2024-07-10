import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "@/services/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

configureObservablePersistence({
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: {
    asyncStorage: {
      AsyncStorage,
    },
  },
  pluginRemote: ObservablePersistFirebase,
});

// Define observables
const cycleMenstruelState = observable({
  id: null,
  lastMenstruationDate: null,
  cycleDuration: null,
  menstruationDuration: null,
  cyclesData: [],
});

const preferenceState = observable({
  theme: "",
  language: "",
});

const userState = observable({
  id: null,
  username: "",
  password: "",
  profession: "",
  lastMenstruationDate: null,
  durationMenstruation: null,
  cycleDuration: null,
  email: "",
  profileImage: null,
});

persistObservable(cycleMenstruelState, {
  local: "cycleMenstruel",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err) => console.error(err),
    firebase: {
      refPath: () => `cycleMenstruel`,
      mode: "realtime",
    },
  },
});

persistObservable(preferenceState, {
  local: "preference",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err) => console.error(err),
    firebase: {
      refPath: () => `preference`,
      mode: "realtime",
    },
  },
});

persistObservable(userState, {
  local: "user",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err) => console.error(err),
    firebase: {
      refPath: () => `user`,
      mode: "realtime",
    },
  },
});

// Update functions
export const updateCycleMenstruelData = (data) => {
  cycleMenstruelState.set((prevState) => ({
    cyclesData: data,
  }));
};

export const updatePreference = (data) => {
  preferenceState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

export const updateUser = (data) => {
  userState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared");
  } catch (error) {
    console.error("Failed to clear AsyncStorage:", error);
  }
};

export { cycleMenstruelState, preferenceState, userState };
