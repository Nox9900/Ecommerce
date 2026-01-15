import { View, Text, Image, Dimensions, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import useHero from "@/hooks/useHero";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const Hero = () => {
    const { data: hero, isLoading } = useHero();

    if (isLoading) {
        return (
            <View className="w-full h-48 rounded-[32px] bg-surface-light items-center justify-center mb-6">
                <ActivityIndicator color="#6366F1" />
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
            className="w-full h-56 rounded-[32px] overflow-hidden mb-8 shadow-xl relative"
        >
            <Image
                source={{ uri: displayHero.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute inset-0"
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <View className="absolute bottom-0 left-0 p-8 w-full">
                <View className="flex-row items-center mb-2">
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-4 py-1.5 rounded-full"
                    >
                        <Text className="text-white text-xs font-bold uppercase tracking-wider">{displayHero.label}</Text>
                    </LinearGradient>
                </View>
                <Text className="text-white text-4xl font-bold mb-2 tracking-tight shadow-md">{displayHero.title}</Text>
                <Text className="text-gray-100 text-base font-medium opacity-90">{displayHero.subtitle}</Text>
            </View>
        </Animated.View>
    );
};
