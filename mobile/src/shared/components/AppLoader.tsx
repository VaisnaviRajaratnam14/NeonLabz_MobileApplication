import LottieView from "lottie-react-native";
import { Text, View } from "react-native";

type AppLoaderProps = {
  label?: string;
};

export const AppLoader = ({ label = "Task Management" }: AppLoaderProps) => {
  return (
    <View className="flex-1 items-center justify-center bg-cream-100 px-6">
      <LottieView
        source={require("../../assets/animations/work managemnt.json")}
        autoPlay
        loop
        style={{ width: 320, height: 320 }}
      />
      <Text className="mt-2 text-4xl font-bold text-blueTheme-900">{label}</Text>
    </View>
  );
};
