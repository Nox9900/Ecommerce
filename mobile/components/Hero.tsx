import { View, Text, Image, Dimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export const Hero = () => {
    return (
        <Animated.View
            entering={FadeInDown.delay(200).duration(1000)}
            className="w-full h-48 rounded-3xl overflow-hidden mb-6 relative"
        >
            <Image
                source={{ uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" /> {/* Dim overlay */}

            <View className="absolute bottom-0 left-0 p-6 w-full">
                <View className="bg-primary/90 self-start px-3 py-1 rounded-full mb-2">
                    <Text className="text-white text-xs font-bold uppercase">New Collection</Text>
                </View>
                <Text className="text-white text-3xl font-bold mb-1">Summer Sale</Text>
                <Text className="text-gray-200 text-sm">Up to 50% off on selected items</Text>
            </View>
        </Animated.View>
    );
};
