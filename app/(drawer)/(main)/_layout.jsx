import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { Stack, useNavigation } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { COLORS, SIZES } from "@/constants";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";

const _layout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const UserAvatar = ({ username }) => {
    const displayText =
      username.length > 10 ? username.charAt(0).toUpperCase() : username;

    return (
      <View style={[styles.container]}>
        {username.length > 10 ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayText}</Text>
          </View>
        ) : (
          <Text style={styles.username}>{displayText}</Text>
        )}
      </View>
    );
  };

  return (
    <Stack
      screenOptions={{
        header: () => (
          <View
            className="w-full flex-row items-center pt-10  pb-3 rounded-b-lg justify-between shadow-md shadow-black absolute "
            style={{
              backgroundColor:
                theme === "orange" ? COLORS.accent800 : COLORS.accent500,
              height: SIZES.height * 0.14,
              paddingHorizontal: 16,
            }}
          >
            <View className="flex flex-row items-center justify-center">
              <TouchableOpacity
                className="p-2 pl-0 mr-3 space-y-1"
                onPress={() => navigation.openDrawer()}
              >
                <View className="h-[5] w-7 bg-white rounded-md" />
                <View className="h-[5] w-8 bg-white rounded-md ml-[2px]" />
                <View className="h-[5] w-7 bg-white rounded-md" />
              </TouchableOpacity>
              <UserAvatar username={user.username} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              Message
            </Text>
            {/* <TouchableOpacity
              className="p-2 pl-0 "
              onPress={() => navigation.navigate("(message)")}
            >
              <AntDesign name="chatbubble" color={"white"} size={30} />
            </TouchableOpacity> */}
          </View>
        ),

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onemessage" options={{ headerShown: false }} />
    </Stack>
  );
};




const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: COLORS.neutral200,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});

export default _layout;
