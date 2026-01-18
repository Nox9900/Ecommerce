import { View, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { ReactNode, useEffect, useRef } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SwipeableCategoryViewProps {
    children: ReactNode[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
}

export default function SwipeableCategoryView({
    children,
    currentIndex,
    onIndexChange,
}: SwipeableCategoryViewProps) {
    const flatListRef = useRef<FlatList>(null);

    // Sync external index changes (e.g. from tab clicks) to FlatList
    useEffect(() => {
        flatListRef.current?.scrollToIndex({
            index: currentIndex,
            animated: true,
        });
    }, [currentIndex]);

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (newIndex !== currentIndex) {
            onIndexChange(newIndex);
        }
    };

    return (
        <View className="flex-1">
            <FlatList
                ref={flatListRef}
                data={children}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                renderItem={({ item }) => (
                    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
                        {item}
                    </View>
                )}
                keyExtractor={(_, index) => index.toString()}
                bounces={false}
                decelerationRate="fast"
                scrollEventThrottle={16}
            />
        </View>
    );
}
