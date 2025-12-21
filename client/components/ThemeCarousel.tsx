import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { CarouselRenderItem, ICarouselInstance, Pagination } from "react-native-reanimated-carousel";

// may not be the best way to do this
export default function ThemeCarousel({ carouselRenderItem, data, width, defaultIndex = 0 }: { data: any[], width: number, carouselRenderItem: CarouselRenderItem<any>, defaultIndex?: number })
{
	const carouselRef = useRef<ICarouselInstance>(null)
	const progress = useSharedValue<number>(0);
	const [index, setIndex] = useState<number>(defaultIndex);

	const onPressPagination = (index: number) => 
	{
		carouselRef.current?.scrollTo({
			/**
			 * Calculate the difference between the current index and the target index
			 * to ensure that the carousel scrolls to the nearest index
			 */
			count: index - progress.value,
			animated: true,
		});
	};

	return (
		<>
			<Carousel
				ref={carouselRef}
				autoPlayInterval={2000}
				data={data}
				pagingEnabled={true}
				snapEnabled={true}
				width={width}
				loop={false}
				style={styles.carousel}
				containerStyle={styles.carousel}
				mode="parallax"
				modeConfig={{
					parallaxScrollingScale: 1,
					parallaxScrollingOffset: 40,
				}}
				onProgressChange={progress}
				defaultIndex={index}
				renderItem={(item) => carouselRenderItem(item)}
			/>
			<Pagination.Basic
				progress={progress}
				data={data}
				dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
				containerStyle={{ gap: 5, marginTop: 10 }}
				onPress={onPressPagination}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	carousel: {
		flex:1,
		margin: 0,
		padding: 0
	}
});