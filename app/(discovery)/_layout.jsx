import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const _layout = () => {
  return (
    <SafeAreaView className="flex-1" >
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
  );
};

export default _layout;
