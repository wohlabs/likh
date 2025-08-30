import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const data = [
  { id: "1", title: "First", image: "https://picsum.photos/800/400?1" },
  { id: "2", title: "Second", image: "https://picsum.photos/800/400?2" },
  { id: "3", title: "Third", image: "https://picsum.photos/800/400?3" },
];

const { width, height } = Dimensions.get('window');

export default function MangaViewer()
{
	const collapsedNoteHeight = 70
	const [expanded, setExpanded] = useState(false);
	const animation = useRef(new Animated.Value(collapsedNoteHeight)).current; // initial height: 0

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
			<Carousel
				data={data}
				width={width}
				autoPlay={false}
				renderItem={() => (
				<View style={{ flex: 1 }}>
					<Image source={{uri: 'https://picsum.photos/200/300'}} style={{ flex: 1, width: "100%", padding: 20}}/>
					<Animated.View style={{ position: "absolute", bottom: 0, backgroundColor: "gray", padding: 20, borderRadius: 25, overflow: "hidden", height: animation, width: "100%"}}>
						<TouchableOpacity
							onPress={toggleExpand}
							style={{flex: 1, justifyContent: "center", alignItems: "center"}}
						>
							{
								expanded ? <Text>v</Text> : <Text>^</Text>
							}
							<Text>Notes</Text>
							{
								expanded ? <Text style= {{flex: 1}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, quis velit cum dolores iure cupiditate, odit laudantium minima possimus optio consequatur blanditiis voluptatum tempore ipsa excepturi ratione debitis asperiores doloribus.</Text> : null
							}
						</TouchableOpacity>
					</Animated.View>
				</View>)}
			/>
		</>
	);
}