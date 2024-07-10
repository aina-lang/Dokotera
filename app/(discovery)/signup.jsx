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
import { auth, database } from "@/services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import {
  clearAsyncStorage,
  preferenceState,
  updateCycleMenstruelData,
  updateUser,
  userState,
} from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";
import { useNavigation } from "expo-router";
import {
  addCyclesToSQLite,
  deleteAllCycles,
  updateUserSqlite,
} from "@/services/database";

import Animated, { BounceIn } from "react-native-reanimated";
import { fetchCyclesFromFirebase } from "@/services/firestoreAPI";

const { width } = Dimensions.get("window");

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginErrorPresent, setLoginErrorPresent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [signupErrorPresent, setSignupErrorPresent] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);


  const handleSignupEmailChange = (text) => {
    setSignupEmail(text);
    if (!text) {
      setSignupEmailError("Veuillez saisir votre adresse e-mail");
    } else if (!validateEmail(text)) {
      setSignupEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setSignupEmailError("");
    }
  };

  const handleSignupPasswordChange = (text) => {
    setSignupPassword(text);
    if (!text) {
      setSignupPasswordError("Veuillez saisir votre mot de passe");
    } else if (!validatePassword(text)) {
      setSignupPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères, inclure au moins une majuscule, une minuscule et un chiffre"
      );
    } else {
      setSignupPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!text) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
    } else if (text !== signupPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then(async (userCredential) => {
        const { uid, email, emailVerified } = userCredential.user;

        if (emailVerified) {
        } else {
          await sendEmailVerification(userCredential.user).then((response) => {
            console.log(response);
          });

          setSignupEmail("");
          setSignupPassword("");
          setConfirmPassword("");
          setVerificationModalVisible(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        let errorMessage;
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Adresse e-mail invalide";
            break;
          case "auth/user-disabled":
            errorMessage = "Ce compte a été désactivé";
            break;
          case "auth/network-request-failed":
            errorMessage = "Problème de connexion réseau";
            break;
          case "auth/email-already-in-use":
            errorMessage = "L'adresse e-mail est déjà associée à un compte.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Le mot de passe est trop faible. Veuillez choisir un mot de passe plus fort.";
            break;
          default:
            errorMessage = "Erreur inconnue, veuillez réessayer";
        }
        setLoginError(errorMessage);
        setModalVisible(true);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };


  useEffect(() => {
    setLoginErrorPresent(!loginEmail || !loginPassword);
    setSignupErrorPresent(
      !signupEmail ||
        !signupPassword ||
        !confirmPassword ||
        signupPasswordError ||
        confirmPasswordError
    );
  }, [
    loginEmail,
    loginPassword,
    signupEmail,
    signupPassword,
    confirmPassword,
    signupPasswordError,
    confirmPasswordError,
  ]);

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
            onChangeText={handleSignupEmailChange}
            editable={!loading}
          />
        </View>
        {signupEmailError && (
          <Text style={styles.errorText}>{signupEmailError}</Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={handleSignupPasswordChange}
            editable={!loading}
          />
        </View>
        {signupPasswordError && (
          <Text style={styles.errorText}>{signupPasswordError}</Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={handleConfirmPasswordChange}
            editable={!loading}
          />
        </View>
        {confirmPasswordError && (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                signupErrorPresent || loading ? "#e7e5e5" : "#FF7575",
            },
          ]}
          onPress={handleSignUp}
          disabled={signupErrorPresent || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Chargement..." : "S'inscrire"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.orText}>Ou</Text>
        <TouchableOpacity
          style={[
            styles.switchButton,
            {
              borderColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            },
          ]}
        
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.switchButtonText,
              {
                color: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
              },
            ]}
          >
            Se connecter
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
  errorText: {
    color: "red",
    // textAlign: "center",
    marginBottom: 10,
    marginLeft: 10,
  },
  orText: {
    textAlign: "center",
    paddingVertical: 10,
  },
  switchButton: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,

    backgroundColor: "white",
  },
  switchButtonText: {
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
