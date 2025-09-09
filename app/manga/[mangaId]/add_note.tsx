import { INoteEntry } from "@/components/INotes";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import
	{
		Image,
		Keyboard,
		Platform,
		Pressable,
		Text,
		TextInput,
		TouchableOpacity,
		TouchableWithoutFeedback,
		View,
	} from "react-native";
import { addMangaNote, getMangaDetails } from '../../../components/util';


const KeyboardDismissWrapper = ({ children }: any) => {
	if (Platform.OS === 'web') {
		return <View style={{ flex: 1 }}>{children}</View>; // Don't block clicks
	}

	return (
		<TouchableWithoutFeedback
		onPress={Keyboard.dismiss}
		accessible={false}
		style={{ flex: 1 }}
		>
		<View style={{ flex: 1 }}>{children}</View>
		</TouchableWithoutFeedback>
	);
};

export default function AddNoteScreen() {
	const [text, onChangeText] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [chapter, setChapter] = useState<string>() // -1 = all/general
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [mangaName, setMangaName] = useState<string>("Fetching...");

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setMangaName(manga.Media.title.userPreferred);
		};
		populateMangaData();
	}, []);

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	return (
		<KeyboardDismissWrapper>
			<View style={{ flex: 1, padding: 10 }} pointerEvents="box-none">
				<Stack.Screen options={{ title: "Add note" }} />
				<Text>Manhwa/Manga: {mangaName}</Text>
				<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
					<Text>Chapter: </Text>
					<TextInput
						numberOfLines={1}
						editable
						keyboardType="number-pad"
						value={chapter}
						onChangeText={(text) => setChapter(text)}
						placeholder={"(All)"}
						placeholderTextColor={"gray"}
						style={{
							backgroundColor: "white",
							outlineColor: "black",
							flex: 1,
							outlineWidth: 1,
							margin: 2,
							padding: 5
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
					placeholder="Your note here..."
					placeholderTextColor={"gray"}
					value={text}
					onChangeText={onChangeText}
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
						onPress={async () => {
							router.back()
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
							console.log("Adding note...")
							let entry: INoteEntry = {
								id: crypto.randomUUID(),
								images: image ? [image] : undefined,
								text: text.trim().length > 0 ? text : undefined
							}
							if (entry.images === undefined && entry.text === undefined) return; // reject empty notes
							if (await addMangaNote(mangaId.toString(), entry))
							{
								console.log("Note added!")
								router.back()
							}
						}}
					>
						<Text>Add</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardDismissWrapper>
	);
}
