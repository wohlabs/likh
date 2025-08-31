import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import
	{
		Animated,
		FlatList,
		Image,
		StyleSheet,
		Text,
		TouchableOpacity,
		View,
	} from "react-native";
import Gallery, { GalleryRef } from "react-native-awesome-gallery";

const data = [
	{
		id: "1",
		title: "First",
		image:
			"https://preview.redd.it/manhua-chapter-87-spoiler-hualian-screen-captures-ive-been-v0-njyxu6jili3a1.jpg?width=1080&crop=smart&auto=webp&s=5a9139155b273fa906e7152db3c035be81fb1ed5",
	},
	{
		id: "2",
		title: "Second",
		image:
			"https://preview.redd.it/fnzobhlazmi81.png?width=640&crop=smart&auto=webp&s=8f221e7e836dad15353ab6195b4756be5284e0b6",
	},
	{
		id: "3",
		title: "Third",
		image: "https://pbs.twimg.com/media/Edrht3fUMAEi-LU.jpg:large",
	},
	{
		id: "4",
		title: "First",
		image:
			"https://preview.redd.it/xf1dltl7nw881.jpg?width=640&crop=smart&auto=webp&s=7b07229e1383c78087483a6831f2a496e9cfa774",
	},
	{
		id: "5",
		title: "Second",
		image: "https://pbs.twimg.com/media/EdS_LqCUYAAJeYu.jpg:large",
	},
	{
		id: "6",
		title: "Third",
		image:
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/856317be-7d5c-440c-813a-68e6a74148aa/dhap05n-6cbd2465-fac6-4f12-b610-30ed8b705ede.png/v1/fill/w_1024,h_2189,q_80,strp/oh__my_favourite_memory_by_kirsten7767_dhap05n-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjE4OSIsInBhdGgiOiJcL2ZcLzg1NjMxN2JlLTdkNWMtNDQwYy04MTNhLTY4ZTZhNzQxNDhhYVwvZGhhcDA1bi02Y2JkMjQ2NS1mYWM2LTRmMTItYjYxMC0zMGVkOGI3MDVlZGUucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.5ASSjbvXThnHcWh1dtj0XpC6uaFx1koKYcH34zwZPyU",
	},
	{
		id: "7",
		title: "First",
		image:
			"https://i.pinimg.com/originals/0d/87/5c/0d875c9ce34f072606c300b7f179144d.jpg",
	},
	{
		id: "8",
		title: "Second",
		image:
			"https://pbs.twimg.com/media/EBQFNAsXkAE6ki0?format=jpg&name=4096x4096",
	},
	{
		id: "9",
		title: "Third",
		image:
			"https://preview.redd.it/s2e5-spoilers-the-infamous-falling-scene-v0-qaii950gck1c1.jpg?width=640&crop=smart&auto=webp&s=2d4b970859878bb1521289910c543e62bd557772",
	},
	{
		id: "10",
		title: "First",
		image:
			"https://preview.redd.it/manhua-chapter-100-sharing-some-text-free-hualian-v0-d3twjnha6vwb1.jpg?width=640&crop=smart&auto=webp&s=dd555cb941068eeab50b54134ba35344abcc2774",
	},
	{
		id: "11",
		title: "Second",
		image:
			"https://preview.redd.it/manhua-chapter-101-last-of-volume-8-sharing-20-speech-v0-ef1sokgozozb1.jpg?width=640&crop=smart&auto=webp&s=683958b82fe0adcf225c9ed6db41fd69d93159a8",
	},
	{
		id: "12",
		title: "Third",
		image:
			"https://n10.mbeaj.org/media/7006/0d8/660768bf8135fb4d7bb0d8d0/49936173_800_1586_190512.webp",
	},
];

export default function MangaViewer() {
	const COLLAPSED_NOTE_HEIGHT = 70;
	const [expanded, setExpanded] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	// const [isVisible, setIsVisible] = useState(true);
	const [carouselDimension, setCarouselDimension] = useState({
		width: 0,
		height: 0,
	});
	const animation = useRef(new Animated.Value(COLLAPSED_NOTE_HEIGHT)).current; // initial height: 0
	const viewerRef = useRef<GalleryRef>(null);
	const thumbnailRef = useRef<FlatList<any>>(null);
	const THUMBNAIL_SIZE = 80;

	useEffect(() => {
		thumbnailRef.current?.scrollToIndex({
			index: activeIndex,
			animated: true,
			viewPosition: 0.5, // centers the item
			viewOffset: THUMBNAIL_SIZE / 2 + 10, // optional offset
		});
		viewerRef.current?.setIndex(activeIndex, true);
	}, [activeIndex]);

	const toggleExpand = () => {
		setExpanded(!expanded);
		Animated.timing(animation, {
			toValue: expanded ? COLLAPSED_NOTE_HEIGHT : 200, // height target
			duration: 300,
			useNativeDriver: false,
		}).start();
	};
	return (
		<View style={{ height: "100%", width: "100%", flex: 1 }}>
			<Stack.Screen options={{ title: "Tianguan Cifu" }} />
			<View style={{ height: THUMBNAIL_SIZE, width: "100%", zIndex: 1, backgroundColor: "white" }}>
				<FlatList
					ref={thumbnailRef}
					data={data}
					keyExtractor={(item) => item.id}
					horizontal
					snapToAlignment="center"
					showsHorizontalScrollIndicator={true}
					style={{ height: THUMBNAIL_SIZE, display: "flex" }}
					contentContainerStyle={styles.thumbnailRow}
					// Center the active thumbnail
					getItemLayout={(_, index) => ({
						length: THUMBNAIL_SIZE, // thumbnail size + margin
						offset: THUMBNAIL_SIZE * index, // center the item
						index,
					})}
					renderItem={({ item, index }) => (
						<TouchableOpacity onPress={() => setActiveIndex(index)}>
							<Image
								source={{ uri: item.image }}
								style={[
									styles.thumbnail,
									activeIndex === index && styles.activeThumbnail,
								]}
							/>
						</TouchableOpacity>
					)}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<View
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						backgroundColor: "transparent"
					}}
					onLayout={(event) => {
						const { width, height } = event.nativeEvent.layout;
						setCarouselDimension({ width, height });
					}}
				>
					<Gallery
						ref={viewerRef}
						data={data.map((item) => ({ uri: item.image }))}
						keyExtractor={(item) => item.uri}
						style={{ flex: 1, backgroundColor: "transparent" }}
						containerDimensions={{
							width: carouselDimension.width,
							height: carouselDimension.height - COLLAPSED_NOTE_HEIGHT,
						}}
						onIndexChange={setActiveIndex}
						renderItem={({ item }) => {
							return (
								<Image
									source={{ uri: item.uri }}
									style={{
										flex: 1,
										backgroundColor: "transparent",
									}}
									resizeMode="contain"
								/>
							);
						}}
					/>
					<Animated.View
						style={{
							position: "absolute",
							bottom: 0,
							backgroundColor: "lightgray",
							padding: 5,
							borderRadius: 25,
							overflow: "hidden",
							height: animation,
							width: "100%",
							borderBottomLeftRadius: 0,
							borderBottomEndRadius: 0,
						}}
					>
						<TouchableOpacity
							onPress={toggleExpand}
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							{expanded ? <Text>v</Text> : <Text>^</Text>}
							<Text>Notes</Text>
							{expanded ? (
								<Text style={{ flex: 1, padding: 10 }}>
									Lorem ipsum dolor sit amet consectetur adipisicing elit.
									Itaque, quis velit cum dolores iure cupiditate, odit
									laudantium minima possimus optio consequatur blanditiis
									voluptatum tempore ipsa excepturi ratione debitis asperiores
									doloribus.
								</Text>
							) : null}
						</TouchableOpacity>
					</Animated.View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	thumbnailRow: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	thumbnail: {
		width: 60,
		height: 60,
		marginHorizontal: 5,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: "transparent",
	},
	activeThumbnail: {
		borderColor: "#3498db", // highlight border
	},
});
