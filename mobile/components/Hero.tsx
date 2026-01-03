import { View, Text, Image, Dimensions, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import useHero from "@/hooks/useHero";

const { width } = Dimensions.get("window");

export const Hero = () => {
    const { data: hero, isLoading } = useHero();

    if (isLoading) {
        return (
            <View className="w-full h-48 rounded-3xl bg-surface-light items-center justify-center mb-6">
                <ActivityIndicator color="#fff" />
            </View>
        );
    }

    // Default values if no hero is active
    const displayHero = hero || {
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
        label: "New Collection",
        title: "Summer Sale",
        subtitle: "Up to 50% off on selected items"
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(200).duration(1000)}
            className="w-full h-48 rounded-3xl overflow-hidden mb-6 relative"
        >
            <Image
                source={{ uri: displayHero.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" /> {/* Dim overlay */}

            <View className="absolute bottom-0 left-0 p-6 w-full">
                <View className="bg-primary/90 self-start px-3 py-1 rounded-full mb-2">
                    <Text className="text-white text-xs font-bold uppercase">{displayHero.label}</Text>
                </View>
                <Text className="text-white text-3xl font-bold mb-1">{displayHero.title}</Text>
                <Text className="text-gray-200 text-sm">{displayHero.subtitle}</Text>
            </View>
        </Animated.View>
    );
};
