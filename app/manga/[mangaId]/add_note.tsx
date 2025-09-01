import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import
	{
		Image,
		Keyboard,
		Pressable,
		Text,
		TextInput,
		TouchableOpacity,
		TouchableWithoutFeedback,
		View,
	} from "react-native";
import { addMangaNote } from '../../../components/util';

export default function AddNoteScreen() {
	const [value, onChangeText] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [chapter, setChapter] = useState<string>() // -1 = all/general
	const { mangaId } = useLocalSearchParams(); // <-- get from URL

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	return (
		<TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
			<View style={{ flex: 1, padding: 10 }}>
				<Stack.Screen options={{ title: "Add note" }} />
				<Text>Manhwa/Manga: Tianguan Cifu</Text>
				<View style={{ flexDirection: "row", justifyContent: "center" }}>
					<Text>Chapter: </Text>
					<TextInput
						numberOfLines={1}
						editable
						keyboardType="number-pad"
						value={chapter}
						onChangeText={(text) => setChapter(text)}
						style={{
							backgroundColor: "white",
							outlineColor: "black",
							flex: 1,
							outlineWidth: 1,
							margin: 2,
						}}
					/>
				</View>
				<View style={{ flexDirection: "row" }}>
					<Text>Image: </Text>
					<View style={{ flex: 1, maxHeight: 200, minHeight: 100 }}>
						<Pressable onPress={pickImage}>
							<Image
								defaultSource={{
									uri: "https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg",
								}}
								source={{
									uri:
										image ||
										"https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg",
								}}
								resizeMode="center"
								style={{
									flex: 1,
									maxHeight: 200,
									minHeight: 100,
									aspectRatio: 1,
								}}
							/>
						</Pressable>
					</View>
				</View>
				<Text>Note:</Text>
				<TextInput
					editable
					multiline
					numberOfLines={4}
					onChangeText={(text) => onChangeText(text)}
					placeholder="Your note here..."
					value={value}
					style={{
						flex: 1,
						padding: 10,
						backgroundColor: "white",
						outlineColor: "black",
						fontSize: 18,
						margin: 5,
						outlineWidth: 1,
					}}
				/>
				<View style={{ height: 60, flexDirection: "row" }}>
					<TouchableOpacity
						style={{
							flex: 1,
							justifyContent: "center",
							alignContent: "center",
							alignItems: "center",
							backgroundColor: "gray",
							borderRadius: 10,
							margin: 10,
						}}
					>
						<Text>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							flex: 1,
							justifyContent: "center",
							alignContent: "center",
							alignItems: "center",
							backgroundColor: "lightblue",
							borderRadius: 10,
							margin: 10,
						}}
						onPress={async () => {
							if (await addMangaNote(mangaId.toString(), Number(chapter) || -1, image, value))
							{
								router.back()
							}
						}}
					>
						<Text>Add</Text>
					</TouchableOpacity>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
