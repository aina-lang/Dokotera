import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { auth, database, storage } from "@/services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, collection, query, where, addDoc } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import {
  clearAsyncStorage,
  preferenceState,
  updateCycleMenstruelData,
  updateUser,
  userState,
} from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";
import { router, useNavigation } from "expo-router";
import {
  addCyclesToSQLite,
  deleteAllCycles,
  updateUserSqlite,
} from "@/services/database";

import Animated, { BounceIn } from "react-native-reanimated";
import { fetchCyclesFromFirebase } from "@/services/firestoreAPI";
import { ref } from "firebase/database";
import { getDownloadURL, uploadBytes } from "firebase/storage";

const { width } = Dimensions.get("window");

const Login = () => {
  const user = useSelector(() => userState.get());
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginErrorPresent, setLoginErrorPresent] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleLoginEmailChange = (text) => {
    setLoginEmail(text);
    if (!text) {
      setLoginEmailError("Veuillez saisir votre adresse e-mail");
    } else if (!validateEmail(text)) {
      setLoginEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setLoginEmailError("");
    }
  };

  const handleLoginPasswordChange = (text) => {
    setLoginPassword(text);
    if (!text) {
      setLoginPasswordError("Veuillez saisir votre mot de passe");
    } else {
      setLoginPasswordError("");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then(async (userCredential) => {
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user).then((response) => {
            console.log(response);
          });
          setVerificationModalVisible(true);
        } else {
          const usersCollectionRef = collection(database, "doctors");
          const q = query(
            usersCollectionRef,
            where("userId", "==", userCredential.user.uid)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            updateUser({
              id: userCredential.user.uid,
              username: userData.username,
              email: userData.email,
              profileImage: userData.profileImage,
            });
            navigation.navigate("(drawer)");
          }
          setLoading(false);
          router.push("(drawer)/settings/completeprofile");
        }
        setLoading(false);
      })
      .catch((error) => {
        let errorMessage;
        console.log(error);
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "Adresse e-mail non trouvée";
            break;
          case "auth/invalid-credential":
            errorMessage = "Vérifier votre identifiants et votre mot de passe ";
            break;
          case "auth/wrong-password":
            errorMessage = "Mot de passe incorrect";
            break;
          case "auth/invalid-email":
            errorMessage = "Adresse e-mail invalide";
            break;
          case "auth/user-disabled":
            errorMessage = "Ce compte a été désactivé";
            break;
          case "auth/network-request-failed":
            errorMessage = "Problème de connexion réseau";
            break;
          case "auth/too-many-requests":
            errorMessage = "Réessayer plus tard";
            break;
          default:
            errorMessage = "Erreur inconnue, veuillez réessayer";
        }
        setLoginError(errorMessage);
        setModalVisible(true);
        setLoading(false);
      });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!loginEmail || !loginPassword) {
      setLoginErrorPresent(true);
    } else {
      setLoginErrorPresent(false);
    }
  }, [loginEmail, loginPassword]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.confidentialityTitle}
        className="bg-[#FF7575] text-white rounded-br-[120px] pt-20"
      >
        {i18n.t("confidentialite")}
      </Text>

      <View style={styles.pageContainer}>
        <Text style={styles.infoText}>
          Si vous voulez poser des questions, commenter ou réagir, et envoyer
          des messages (forum, message privé), veuillez vous connecter ou créer
          un compte. Cela synchronisera également vos données.
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={handleLoginEmailChange}
          />
        </View>
        {loginEmailError && (
          <Text style={{ color: "red" }}>{loginEmailError}</Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={handleLoginPasswordChange}
          />
        </View>
        {loginPasswordError && (
          <Text style={{ color: "red" }}>{loginPasswordError}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                loginErrorPresent || loading ? "#e7e5e5" : "#FF7575",
            },
          ]}
          onPress={handleLogin}
          disabled={loginErrorPresent}
        >
          <Text style={styles.buttonText}>
            {loading ? "Chargement..." : "Se connecter"}
          </Text>
        </TouchableOpacity>
        {/* {loginError && <Text style={{ color: "red" }}>{loginError}</Text>} */}
        <Text className="text-center py-2">Ou</Text>
        <TouchableOpacity
          style={{
            padding: 15,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
          }}
          className=" mb-5"
          // onPress={() => navigation.goBack()}
          onPress={() => navigation.navigate("signup")}
        >
          <Text className="text-center" style={{ color: COLORS.accent500 }}>
            S'inscrire
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        transparent
      >
        <View className="bg-black/40 h-full p-3 items-center justify-center">
          <Animated.View
            entering={BounceIn}
            style={styles.modalContent}
            className="bg-white items-center justify-center"
          >
            <Text style={styles.modalText}>Erreur lors de la connexion:</Text>
            <Text style={styles.modalText}>{loginError}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      {/* Modal de chargement */}
      <Modal transparent={true} visible={isLoading} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>
              Chargement de vos données... {Math.round(progress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  confidentialityTitle: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  pageContainer: {
    width,
    padding: 20,
    justifyContent: "center",
  },
  infoText: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    padding: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#c0bdbd",
    borderRadius: 15,
    marginVertical: 10,
    width: Math.floor(Dimensions.get("window").width) - 40,
    backgroundColor: "rgb(243 244 246)",
  },
  button: {
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#FF7575",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
  },

  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#e7e5e5",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.accent600,
    borderRadius: 5,
  },
});

export default Login;
