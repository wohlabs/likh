import { INoteEntry } from "@/components/INotes";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import
	{
		FlatList,
		Image,
		Keyboard,
		Platform,
		Pressable,
		Text,
		TouchableWithoutFeedback,
		View
	} from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import { addMangaNote, getMangaDetails } from '../../../components/util';
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import api, { API_URL } from "@/api/AxiosInstance";
import {File, Paths} from 'expo-file-system'
import { AuthContext } from "@/context/AuthContext";
import { fetch } from 'expo/fetch';

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
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
	const [startChapter, setStartChapter] = useState<string>() // -1 = all/general
	const [endChapter, setEndChapter] = useState<string>() // -1 = all/general
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [mangaName, setMangaName] = useState<string>("Fetching...");
	const token = useContext(AuthContext).token

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setMangaName(manga?.title.userPreferred || "Unknown");
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
			let newImages = [...images, result.assets[0]]
			setImages(newImages);
			setCurrentImageIndex(newImages.length - 1); // set to last image
		}
	};

	const createNote = async () => {
		if ((images === undefined || images.length == 0)  && text === undefined) return; // reject empty notes

		const formData = new FormData()
		formData.append('mangaId', mangaId.toString())
		formData.append('startChapter', startChapter ? startChapter : String(-1))
		if (endChapter) formData.append('endChapter', endChapter)
		if (text && text.trim().length > 0) formData.append('text', text)
		for (const image of images)
		{
			if (Platform.OS == 'web')
			{
				const resp = await fetch(image.uri);
				const blob =  await resp.blob();
				formData.append('images', blob, image.fileName || Date.now().toString())
			}
			else
			{
				const file: File = new File(image.uri);
				formData.append('images', file, image.fileName || Date.now().toString())

			}
		}
		await fetch(`${API_URL}/notes`, {
			method: 'POST',
			body: formData,
			headers: {
				authorization: `Bearer ${token}`
			}
		}).then(() =>router.navigate(`/manga/${mangaId}`))

	}

	return (
		<KeyboardDismissWrapper>
			<View style={{ flex: 1, padding: 10, flexDirection: "row" }} pointerEvents="box-none">
				<Stack.Screen options={{ title: "Add note" }} />
				<View style={{ flex: 2, margin: 10, flexDirection: "column" }}>
					{
						images.length > 0 ? 
						<Image
							defaultSource={{
								uri: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-add-icon-png-image_4232053.jpg",
							}}
							source={{
								uri: images[currentImageIndex].uri || "https://static.thenounproject.com/png/187803-200.png"
							}}
							resizeMode="contain"
							style={{
								flex: 1,
								width: "100%",
								borderRadius: 10,
								borderColor: "black",
								borderWidth: 2,
								backgroundColor: "white"
							}}
						/>
						:
						<View style={{flex: 1, justifyContent: "center", alignItems: "center", borderColor: "black", borderWidth: 2, borderRadius: 10, borderStyle:"dashed"}}>
							<ThemeText style={{fontSize: 28, color: "lightgray"}}>Add an image using the + icon</ThemeText>
						</View>
					}
					<View style={{height: 100, flexDirection: "row", alignItems: "center"}}>
						<FlatList
							data={images}
							renderItem={({ item, index }) => (
								<Pressable onPress={() => {setCurrentImageIndex(index)}}>
									<Image
										source={{ uri: item.uri }}
										resizeMode="cover"
										style={{
											height: "100%",
											aspectRatio: 1,
											borderRadius: 10,
											borderColor: "black",
											borderWidth: 2,
											marginRight: 5
										}}
									/>
								</Pressable>
							)}
							horizontal
							style={{ flex: 1, alignSelf: "stretch", margin: 10 }}
							keyExtractor={(_, index) => index.toString()}
						/>
						<IconButton icon={"plus"} size={30} onPress={pickImage} style={{justifyContent: "center"}} mode="contained"/>
					</View>
				</View>
				<View style={{ flexDirection: "column", flex: 3}}>
					<ThemeText style={{fontSize: 20}}>Manhwa/Manga: {mangaName}</ThemeText>
					<View style={{ flexDirection: "row", alignItems: "center"}}>
						<ThemeText style={{fontSize: 20}}>Chapter: </ThemeText>
						<TextInput
							numberOfLines={1}
							editable
							keyboardType="number-pad"
							value={startChapter}
							onChangeText={(text) => setStartChapter(text)}
							placeholder={"start"}
							placeholderTextColor={"gray"}
							style={{
								margin: 2,
								flex: 1,
								maxWidth: 200
							}}
						/>
						<ThemeText>-</ThemeText>
						<TextInput
							numberOfLines={1}
							editable
							keyboardType="number-pad"
							value={endChapter}
							onChangeText={(text) => setEndChapter(text)}
							placeholder={"end (optional)"}
							placeholderTextColor={"gray"}
							style={{
								outlineWidth: 1,
								flex: 1,
								maxWidth: 200
							}}
						/>
					</View>
					<ThemeText style={{fontSize: 20}}>Note:</ThemeText>
					<TextInput
						editable
						multiline
						numberOfLines={4}
						placeholder="your note here..."
						placeholderTextColor={"gray"}
						value={text}
						onChangeText={onChangeText}
						style={{
							margin: 5,
							flex: 1
						}}
					/>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
						<ThemeButton
							style={{
								justifyContent: "center",
								alignItems: "center",
								flex: 1,
								margin: 2
							}}
							onPress={() => router.navigate(`/manga/${mangaId}`) }
							mode="contained-tonal"
						>
							Cancel
						</ThemeButton>
						<ThemeButton
							style={{
								justifyContent: "center",
								alignItems: "center",
								flex: 1,
								margin: 2
							}}

							onPress={async () => {
								console.log("Adding note...")
								createNote()
							}}
							mode="contained"
						>
							Add
						</ThemeButton>
					</View>
				</View>
			</View>
		</KeyboardDismissWrapper>
	);
}
