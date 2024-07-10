import { View, Text, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { Stack, useNavigation } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const _layout = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
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
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                Forum
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                className="p-2 pl-0 "
                onPress={() => navigation.navigate("(message)")}
              >
                <Ionicons name="chatbubble" color={"white"} size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 pl-0 "
                onPress={() => navigation.navigate("(message)")}
              >
                <Ionicons
                  name="notifications-circle"
                  color={"white"}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
        ),

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default _layout;
