import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { COLORS, SIZES, images } from "@/constants";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { updatePreference } from "@/legendstate/AmpelaStates";
const OnBoarding = [
  {
    title: "  Bienvenue sur Ampela",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut rem",
    img: images.abscenceDeRegles,
  },

  {
    title: "Enregistrer vos données",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut rem",
    img: images.culotteMenstruelle,
  },
  {
    title: "Chatter avec les docteurs",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut rem",
    img: images.cycleMenstruel,
  },
  {
    title: "Dscuter avec le monde",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut rem",
    img: images.alimentationPendantLesRegles,
  },
];

const index = () => {
  const [currentBoard, setCurrentBoard] = useState(0);

  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const nextHandled = () => {
    setCurrentBoard((prevBoard) => {
      const nextBoard = prevBoard + 1;
      if (nextBoard < OnBoarding.length) {
        scrollViewRef.current?.scrollTo({
          x: SIZES.width * nextBoard,
          animated: true,
        });
        return nextBoard;
      } else {
        return prevBoard;
      }
    });
  };

  useEffect(() => {
    const preferenceData = { theme: "pink", language: "fr" };
    updatePreference(preferenceData);
  }, []);

  const prevHandled = () => {
    setCurrentBoard((prevBoard) => {
      const nextBoard = prevBoard - 1;
      if (nextBoard >= 0) {
        scrollViewRef.current?.scrollTo({
          x: SIZES.width * nextBoard,
          animated: true,
        });
        return nextBoard;
      } else {
        return prevBoard;
      }
    });
  };

  const onScrollHandler = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageWidth = SIZES.width;
    const pageNumber = Math.floor(offsetX / pageWidth);
    if (pageNumber === 0 && offsetX < 0) {
      return;
    }
    setCurrentBoard(pageNumber);
  };

  const skipHandler = () => {
    navigation.navigate("selectlanguage");
  };

  const getStartedHandler = () => {
    navigation.navigate("selectlanguage");
  };

  const RenderDots = () => {
    // const dotPosition = Animated.divide(scrollX, SIZES.width);

    return (
      <View
        style={{
          bottom: SIZES.height > 700 ? "20%" : "13%",
        }}
        className="absolute w-full flex items-center flex-row justify-center my-10"
      >
        {OnBoarding.map((item, index) => (
          <View
            key={index}
            className={`${
              currentBoard == index
                ? "bg-[#FF7575] w-3 p-1"
                : "bg-[#FFADAD] w-2"
            }  h-2 rounded-full mx-2 flex items-center flex-row justify-center `}
          ></View>
        ))}
      </View>
    );
  };

  // const scrollX = new Animated.Value(0);

  const renderContent = () => {
    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        scrollEnabled
        snapToAlignment={"center"}
        showsHorizontalScrollIndicator={false}
        onScroll={onScrollHandler}
        ref={scrollViewRef}
        style={{ width: SIZES.width, height: SIZES.height }}
        className="h-full"
      >
        {OnBoarding.map((item, index) => (
          <View
            key={index}
            style={{ width: SIZES.width, height: SIZES.height }}
            className={`bg-white `}
          >
            <View
              className={"p-4"}
              style={{ height: SIZES.height * 0.6, width: SIZES.width }}
            >
              <Image
                source={item.img}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="flex items-center justify-center p-5">
              <Text
                className="text-2xl font-bold mb-3 "
                style={{ color: COLORS.accent600 }}
              >
                {item.title}
              </Text>
              <Text className="text-[18px] text-center  text-gray-600">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    );
  };

  return (
    <SafeAreaView className={`flex-1 bg-white justify-center items-center`}>
      {renderContent()}
      {RenderDots()}
      <View
        style={{
          justifyContent: currentBoard === 0 ? "flex-end" : "space-between",
        }}
        className="flex flex-row items-center justify-between  w-full absolute bottom-0 p-5"
      >
        {currentBoard !== 0 && (
          <TouchableOpacity onPress={prevHandled} className="p-3 rounded-md ">
            <Text className="text-[#8a8888]">Retour</Text>
          </TouchableOpacity>
        )}

        {currentBoard != OnBoarding.length - 1 ? (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.accent500 }}
            onPress={nextHandled}
            className="p-3 rounded-md shadow-md shadow-black"
          >
            <Text className="text-white"> Suivant </Text>
            {/* <AntDesign
                    name="right"
                    size={20}
                    color="white"
                    className="ml-3"
                  /> */}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.accent500 }}
            onPress={getStartedHandler}
            className="p-3 rounded-md shadow-md shadow-black"
          >
            <Text className="text-white"> Commencer </Text>
            {/* <AntDesign
                    name="right"
                    size={20}
                    color="white"
                    className="ml-3"
                  /> */}
          </TouchableOpacity>
        )}
      </View>
      <View className="absolute top-10 right-5">
        <TouchableOpacity onPress={skipHandler}>
          <Text className="text-[16px]" style={{ color: "#424242" }}>
            {" "}
            Ignorer
          </Text>
          <AntDesign name="" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default index;
