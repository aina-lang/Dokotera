import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
} from "react-native";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { COLORS, SIZES, images } from "@/constants";
import { useNavigation } from "expo-router";
import {
  preferenceState,
  updateUser,
  userState,
} from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { updateUserSqlite } from "@/services/database";
import { getAuth } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

const AccountScreen = () => {
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
  const [username, setUsername] = useState(user.username);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profileImage1, setProfileImage] = useState(user.profileImage);
  const navigation = useNavigation();

  const handleEditPress = async () => {
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    userState.set((prev) => ({ ...prev, username }));
    await updateUserSqlite(
      user.id,
      username,
      user.password,
      user.profession,
      user.lastMenstruationDate,
      user.durationMenstruation,
      user.cycleDuration,
      user.email,
      user.profileImage
    );
    setIsModalVisible(false);
  };

  const handleProfileImageChange = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Désolé, nous avons besoin des permissions pour accéder aux images!"
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const profileImage = result.assets[0].uri;
        await MediaLibrary.saveToLibraryAsync(profileImage);
        updateUser({
          ...user,
          profileImage,
        });
        await updateUserSqlite(
          user.id,
          user.username,
          user.password,
          user.profession,
          user.lastMenstruationDate,
          user.durationMenstruation,
          user.cycleDuration,
          user.email,
          profileImage
        );
        setProfileImage(profileImage);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.neutral100,
        justifyContent: "center",
      }}
    >
      <HeaderWithGoBack title="Apropos de moi" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.container,
          {
            backgroundColor:
              theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
          },
        ]}
      >
        <View style={styles.profil}>
          <TouchableOpacity
            className=" w-[150] h-[150] rounded-full relative"
            onPress={handleProfileImageChange}
          >
            <Image
              source={profileImage1 ? { uri: profileImage1 } : images.doctor01}
              style={{ height: 150, width: 150, borderRadius: 150 }}
            />

            <AntDesign
              name="camera"
              size={30}
              style={{
                display: "absolute",
                top: -45,
                right: -100,
                backgroundColor: "white",
                borderRadius: 100,
                padding: 10,
                width: 50,
              }}
              color={theme == "pink" ? COLORS.accent600 : COLORS.accent800}
            />
          </TouchableOpacity>
          <View className="p-2 flex-row space-x-3 mt-1">
            <Text className="font-bold text-[18px]">{user.username}</Text>
            <TouchableOpacity onPress={() => handleEditPress()}>
              <AntDesign
                name="edit"
                size={24}
                color={theme == "pink" ? COLORS.accent600 : COLORS.accent800}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className=" py-5 ">
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar" color={"green"} size={30} />
              <Text className="text-[18]">Durée du cycle :</Text>
              <Text className="font-bold text-[18]">
                {user.cycleDuration} jours
              </Text>
            </View>
          </View>
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar-check-o" color={"green"} size={30} />
              <Text className="text-[18]">Durée des règles :</Text>
              <Text className="font-bold text-[18]">
                {user.durationMenstruation} jours
              </Text>
            </View>
          </View>
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar-plus-o" color={"green"} size={30} />
              <Text className="text-[18]">Premier jour du dernier cycle :</Text>
              <Text className="font-bold text-[18]">
                {user.lastMenstruationDate}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("settings/updatecycleinfo");
            }}
            className=" rounded-lg mx-2 mt-5 flex-row justify-between space-x-2 items-center"
          >
            <Text className="text-black">
              Modifier les informations du cycles
            </Text>
            <AntDesign name="right" size={18} color="black" className="ml-3" />
          </TouchableOpacity>
          {auth.currentUser && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("settings/changepassword");
              }}
              className=" rounded-lg mx-2 mt-10  flex-row justify-between space-x-2 items-center"
            >
              <Text className="text-black">Changer mon mot de passe</Text>
              <AntDesign
                name="right"
                size={18}
                color="black"
                className="ml-3"
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
              }}
              keyboardType={"default"}
              placeholder={"Entrez votre pseudo"}
            />
            <View className="flex-row space-x-2 justify-between w-full  mt-3 p-1">
              <Button
                title="Annuler"
                onPress={() => setIsModalVisible(false)}
                color={"gray"}
              />
              <Button
                title="Enregistrer"
                onPress={handleSave}
                color={theme == "pink" ? COLORS.accent600 : COLORS.accent800}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 140,
  },
  profil: {
    alignItems: "center",
    gap: 15,
    paddingVertical: 30,
  },
  uploadImgText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  uploadImg: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    gap: 10,
    marginBottom: 20,
  },
  input: {
    fontFamily: "Regular",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.neutral100,
  },
  saveBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignSelf: "flex-end",
  },
  title: {
    fontFamily: "SBold",
    fontSize: SIZES.xLarge,
    marginBottom: 15,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});

export default AccountScreen;
