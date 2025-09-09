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
	const [startChapter, setStartChapter] = useState<string>() // -1 = all/general
	const [endChapter, setEndChapter] = useState<string>() // -1 = all/general
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
			<View style={{ flex: 1, padding: 10, flexDirection: "row" }} pointerEvents="box-none">
				<Stack.Screen options={{ title: "Add note" }} />
				<Pressable onPress={pickImage} style={{
					flex: 2,
					margin: 10,
					backgroundColor: "white",
				}}>
					<Image
						defaultSource={{
							uri: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-add-icon-png-image_4232053.jpg",
						}}
						source={{
							uri: image || "https://static.thenounproject.com/png/187803-200.png"
						}}
						resizeMode="contain"
						style={{
							flex: 1,
							width: "100%",
							borderRadius: 10,
							borderColor: "black",
							borderWidth: 2

						}}
					/>
				</Pressable>
				<View style={{ flexDirection: "column", flex: 3}}>
					<Text style={{fontSize: 20}}>Manhwa/Manga: {mangaName}</Text>
					<View style={{ flexDirection: "row", alignItems: "center"}}>
						<Text style={{fontSize: 20}}>Chapter: </Text>
						<TextInput
							numberOfLines={1}
							editable
							keyboardType="number-pad"
							value={startChapter}
							onChangeText={(text) => setStartChapter(text)}
							placeholder={"Start"}
							placeholderTextColor={"gray"}
							style={{
								backgroundColor: "white",
								outlineColor: "black",
								outlineWidth: 1,
								margin: 2,
								padding: 5,
								fontSize: 20
							}}
						/>
						<Text>-</Text>
						<TextInput
							numberOfLines={1}
							editable
							keyboardType="number-pad"
							value={endChapter}
							onChangeText={(text) => setEndChapter(text)}
							placeholder={"End (optional)"}
							placeholderTextColor={"gray"}
							style={{
								backgroundColor: "white",
								outlineColor: "black",
								outlineWidth: 1,
								margin: 2,
								padding: 5,
								fontSize: 20
							}}
						/>
					</View>
					<Text style={{fontSize: 20}}>Note:</Text>
					<TextInput
						editable
						multiline
						numberOfLines={4}
						placeholder="Your note here..."
						placeholderTextColor={"gray"}
						value={text}
						onChangeText={onChangeText}
						style={{
							padding: 10,
							backgroundColor: "white",
							outlineColor: "black",
							fontSize: 20,
							margin: 5,
							outlineWidth: 1,
							flex: 1
						}}
					/>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
						<TouchableOpacity
							style={{
								justifyContent: "center",
								alignContent: "center",
								alignItems: "center",
								backgroundColor: "gray",
								borderRadius: 10,
								margin: 10,
								padding: 10,
								flex: 1
							}}
							onPress={async () => {
								router.navigate(`/manga/${mangaId}`);
							}}
						>
							<Text>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={{
								justifyContent: "center",
								alignContent: "center",
								alignItems: "center",
								backgroundColor: "lightblue",
								borderRadius: 10,
								margin: 10,
								padding: 10,
								flex: 1
							}}
							onPress={async () => {
								console.log("Adding note...")
								let entry: INoteEntry = {
									id: crypto.randomUUID(),
									startChapter: startChapter ? parseInt(startChapter) : -1,
									endChapter: endChapter ? parseInt(endChapter) : undefined,
									createdAt: (new Date()).toISOString(),
									modifiedAt: (new Date()).toISOString(),
									images: image ? [image] : undefined,
									text: text.trim().length > 0 ? text : undefined
								}
								if (entry.images === undefined && entry.text === undefined) return; // reject empty notes
								if (await addMangaNote(mangaId.toString(), entry))
								{
									console.log("Note added!")
									router.navigate(`/manga/${mangaId}`);
								}
							}}
						>
							<Text>Add</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</KeyboardDismissWrapper>
	);
}
