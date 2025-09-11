import { INoteEntry } from "@/components/INotes";
import { getMangaData, getMangaDetails } from "@/components/util";
import { Stack, useLocalSearchParams } from "expo-router";
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

export default function MangaViewer() {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
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
	type NoteItem = { id: string; image: string; text?: string };
	const [data, setData] = useState<any[]>([{id : 1}]);
	const [mangaName, setMangaName] = useState<string>("Fetching...")

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setMangaName(manga?.title.userPreferred || "Unknown");
		};
		populateMangaData();
	}, []);


	useEffect(() => {
		const fetchData = async () => {
			const DATA = await getMangaData(mangaId.toString());
			let tempData = DATA.map((note: INoteEntry) => note.images).flat().filter((image) => image != undefined) // get all notes with images
			setData(tempData);
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (data.length == 0 && activeIndex < 0) return;
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
			<Stack.Screen options={{ title: mangaName }} />
			<View style={{ height: THUMBNAIL_SIZE, width: "100%", zIndex: 1, backgroundColor: "white" }}>
				<FlatList
					ref={thumbnailRef}
					data={data}
					keyExtractor={(_, index) => index.toString()}
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
								source={{ uri: item }}
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
						data={data}
						keyExtractor={(_, index) => index.toString()}
						style={{ flex: 1, backgroundColor: "transparent" }}
						containerDimensions={{
							width: carouselDimension.width,
							height: carouselDimension.height - COLLAPSED_NOTE_HEIGHT,
						}}
						onIndexChange={setActiveIndex}
						renderItem={({ item }) => {
							return (
								<Image
									source={{ uri: item }}
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
							{data.length > 0 && <Text style={{color: data[activeIndex]?.text ? "black" : "gray"}}>Notes</Text>}
							{data.length > 0 && expanded ? (
								<Text style={{ flex: 1, padding: 10, color: data[activeIndex]?.text ? "black" : "gray", textAlign: data[activeIndex]?.text ? "left" : "center" }}>
									{data[activeIndex]?.text ? data[activeIndex].text : "No notes available for this image."}
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
