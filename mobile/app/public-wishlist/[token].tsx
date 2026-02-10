import Header from "@/components/Header";
import SafeScreen from "@/components/SafeScreen";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import EmptyUI from "@/components/ui/Empty";
import ErrorUI from "@/components/ui/Error";
import LoadingUI from "@/components/ui/Loading";
import useCart from "@/hooks/useCart";
import { usePublicWishlist } from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PublicWishlistScreen() {
    const { token } = useLocalSearchParams<{ token: string }>();
    // @ts-ignore
    const { data, isLoading, isError } = usePublicWishlist(token || "");
    const { addToCart } = useCart();

    const handleAddToCart = (productId: string, productName: string) => {
        addToCart(
            { productId, quantity: 1 },
            {
                onSuccess: () => Alert.alert("Success", `${productName} added to cart!`),
                onError: (error: any) => {
                    Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
                },
            }
        );
    };

    if (isLoading) return <LoadingUI title="Loading" subtitle="Fetching shared wishlist..." />;
    if (isError || !data)
        return (
            <ErrorUI
                title="Wishlist not found"
                subtitle="This wishlist might be private or does not exist."
                buttonTitle="Go Home"
                buttonAction={() => router.replace("/(tabs)/")}
            />
        );

    const { wishlist, ownerName } = data;

    return (
        <View className="flex-1 bg-background">
            <Header primaryText={`${ownerName}'s Wishlist`} secondaryText="Shared Collection" />

            {wishlist.length === 0 ? (
                <EmptyUI
                    title="Empty Wishlist"
                    subtitle="This user hasn't added any items yet."
                    buttonTitle="Go Home"
                    buttonAction={() => router.replace("/(tabs)/")}
                />
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="px-6 py-6">
                        {wishlist.map((item, index) => (
                            <AnimatedContainer animation="fadeUp" delay={index * 100} key={item._id}>
                                <TouchableOpacity
                                    className="mb-6 flex-row"
                                    onPress={() => router.push(`/product/${item._id}` as any)}
                                    activeOpacity={0.7}
                                >
                                    <View className="relative">
                                        <View className="shadow-lg shadow-black/20">
                                            <Image
                                                source={item.images[0]}
                                                style={{ height: 100, width: 100, borderRadius: 20 }}
                                                contentFit="cover"
                                                transition={500}
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-1 ml-5 pt-1">
                                        <View className="flex-row items-start justify-between mb-1">
                                            <Text
                                                className="text-text-primary font-bold text-lg flex-1 mr-2"
                                                numberOfLines={2}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>

                                        <Text className="text-text-primary font-black text-lg mb-2">
                                            <Text className="text-primary text-sm">$</Text>
                                            {item.price.toFixed(2)}
                                        </Text>

                                        <View className="flex-row items-center justify-between">
                                            {/* Stock Badge */}
                                            <View
                                                className="px-3 py-1 rounded-lg border flex-row items-center"
                                                style={{
                                                    backgroundColor: (item.stock > 0 ? "#22C55E" : "#EF4444") + "10",
                                                    borderColor: (item.stock > 0 ? "#22C55E" : "#EF4444") + "30",
                                                }}
                                            >
                                                <View
                                                    className={`w-1.5 h-1.5 rounded-full mr-2 ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
                                                />
                                                <Text
                                                    className="text-[10px] font-black uppercase tracking-wider"
                                                    style={{ color: item.stock > 0 ? "#22C55E" : "#EF4444" }}
                                                >
                                                    {item.stock > 0 ? "In Stock" : "Out of Stock"}
                                                </Text>
                                            </View>

                                            {/* Add to Cart Button (Small) */}
                                            {item.stock > 0 && (
                                                <TouchableOpacity
                                                    className="w-8 h-8 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(item._id, item.name);
                                                    }}
                                                >
                                                    <Ionicons name="cart-outline" size={16} className="text-text-primary" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View className="h-[1px] bg-black/5 dark:bg-white/5 w-full mb-6" />
                            </AnimatedContainer>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
