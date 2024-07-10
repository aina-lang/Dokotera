import React, { useEffect } from "react";
import { Text, SafeAreaView, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

const LoadingScreen = () => {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Start fade down animation
    translateY.value = withTiming(0, { duration: 1000 }, () => {
      // After fade down, start blinking animation
      opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1, // Repeat indefinitely
        true // Reverse animation direction
      );
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FF7575",
      }}
    >
      <Animated.View style={animatedStyle}>
        <Text className="text-white text-4xl uppercase font-bold">Ampela</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoadingScreen;
