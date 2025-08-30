import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

const data = [
	{ id: "1", title: "First", image: "https://picsum.photos/800/400?1" },
	{ id: "2", title: "Second", image: "https://picsum.photos/800/400?2" },
	{ id: "3", title: "Third", image: "https://picsum.photos/800/400?3" },
	{ id: "4", title: "First", image: "https://picsum.photos/800/400?1" },
	{ id: "5", title: "Second", image: "https://picsum.photos/800/400?2" },
	{ id: "6", title: "Third", image: "https://picsum.photos/800/400?3" },
	{ id: "7", title: "First", image: "https://picsum.photos/800/400?1" },
	{ id: "8", title: "Second", image: "https://picsum.photos/800/400?2" },
	{ id: "9", title: "Third", image: "https://picsum.photos/800/400?3" },
	{ id: "10", title: "First", image: "https://picsum.photos/800/400?1" },
	{ id: "11", title: "Second", image: "https://picsum.photos/800/400?2" },
	{ id: "12", title: "Third", image: "https://picsum.photos/800/400?3" },
];

const { width, height } = Dimensions.get('window');

export default function MangaViewer()
{
	const collapsedNoteHeight = 70
	const [expanded, setExpanded] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [carouselHeight, setCarouselHeight] = useState(0);
	const animation = useRef(new Animated.Value(collapsedNoteHeight)).current; // initial height: 0
	const ref = React.useRef<any>(null);
	const progress = useSharedValue<number>(0);
	const thumbnailRef = useRef<FlatList<any>>(null);
	const THUMBNAIL_SIZE = 80;

	useEffect(() => {
		thumbnailRef.current?.scrollToIndex({
			index: activeIndex,
			animated: true,
			viewPosition: 0.5, // centers the item
			viewOffset: THUMBNAIL_SIZE/2 + 10, // optional offset
		});
		ref.current?.scrollTo({
			/**
			 * Calculate the difference between the current index and the target index
			 * to ensure that the carousel scrolls to the nearest index
			 */
			count: activeIndex - progress.value,
			animated: true,
		});
	}, [activeIndex]);

	const handleSelect = (index:number) => {
		setActiveIndex(index);
	};

	const toggleExpand = () => {
		setExpanded(!expanded);
		Animated.timing(animation, {
		toValue: expanded ? collapsedNoteHeight : 200, // height target
		duration: 300,
		useNativeDriver: false,
		}).start();
	};
	return (
		<>
			<Stack.Screen options={{ title: "Manga Title" }} />
			<FlatList
				ref={thumbnailRef}
				data={data}
				keyExtractor={(item) => item.id}
				horizontal
				snapToAlignment="center"
				showsHorizontalScrollIndicator={true}
				style={{ maxHeight: THUMBNAIL_SIZE}}
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
			<View style={{ flex: 1 }}
			onLayout={(event) => {
				const { height } = event.nativeEvent.layout;
				setCarouselHeight(height);
			}}
			
			>

			<Carousel
				data={data}
				width={width}
				height={carouselHeight}
				autoPlay={false}
				pagingEnabled={true}
				onProgressChange={progress}
				ref={ref}
				onSnapToItem={setActiveIndex}
				renderItem={(item) => (
				<View style={{ flex: 1 }}>
					<Image source={{uri: item.item.image}} resizeMode="contain" style={{ width: "100%", height: "100%"}}/>
					<Animated.View style={{ position: "absolute", bottom: 0, backgroundColor: "gray", padding: 0, borderRadius: 25, overflow: "hidden", height: animation, width: "100%", borderBottomLeftRadius: 0,
					borderBottomEndRadius: 0,
					margin: 0

					}}>
						<TouchableOpacity
							onPress={toggleExpand}
							style={{flex: 1, justifyContent: "center", alignItems: "center"}}
						>
							{
								expanded ? <Text>v</Text> : <Text>^</Text>
							}
							<Text>Notes</Text>
							{
								expanded ? <Text style= {{flex: 1, padding: 10}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, quis velit cum dolores iure cupiditate, odit laudantium minima possimus optio consequatur blanditiis voluptatum tempore ipsa excepturi ratione debitis asperiores doloribus.</Text> : null
							}
						</TouchableOpacity>
					</Animated.View>
				</View>)}
			/>
			</View>
		</>
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