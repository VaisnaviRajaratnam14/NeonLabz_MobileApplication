import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import LottieView from "lottie-react-native";

type WelcomeScreenProps = {
  onStart: () => void;
};

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start(
      () => onStart()
    );
  };

  return (
    <View className="flex-1 items-center justify-between px-8 pt-12 pb-14" style={{ backgroundColor: "#cfe5fb" }}>
      {/* Lottie animation */}
      <View className="flex-1 items-center justify-center">
        <LottieView
          source={require("../../assets/animations/work managemnt.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>

      {/* Text + button */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        className="w-full items-center rounded-[28px] bg-white px-6 py-7"
      >
        <Text className="mb-3 text-center text-3xl font-bold text-blueTheme-900">
          Welcome to Go Task
        </Text>
        <Text className="mb-8 text-center text-base leading-6 text-slate-600">
          Plan tasks, schedule your workday, and stay focused with clear daily progress.
        </Text>

        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="w-full items-center rounded-2xl py-4"
            style={{ backgroundColor: "#12a7cf" }}
          >
            <Text className="text-white text-lg font-semibold tracking-wide">
              Let's Start
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};
