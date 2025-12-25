import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import
{
	FlatList,
	Image,
	Keyboard,
	Platform,
	Pressable,
	TouchableWithoutFeedback,
	View,
	StyleSheet
} from "react-native";
import { IconButton, TextInput, useTheme } from "react-native-paper";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { API_URL } from "@/services/AxiosInstance";
import { File } from 'expo-file-system'
import { AuthContext } from "@/context/AuthContext";
import { fetch } from 'expo/fetch';
import { getMangaDetails } from "@/services/manga.service";
import { getMangaTitle } from "@/types/IManga";
import { getNote } from "@/services/notes.service";
import { getImageBase64 } from "@/components/util";
import { DropEvent, useDropzone } from "react-dropzone";
import { LoadingScreen } from "@/components/LoadingScreen";
import Toast from "react-native-toast-message";

const KeyboardDismissWrapper = ({ children }: any) => 
{
	if (Platform.OS === 'web') 
	{
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

export default function EditNoteScreen() 
{
	const [text, onChangeText] = useState("");
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
	const [startChapter, setStartChapter] = useState<string>() // -1 = all/general
	const [endChapter, setEndChapter] = useState<string>() // -1 = all/general
	const { mangaId, noteId } = useLocalSearchParams(); // <-- get from URL
	const [mangaName, setMangaName] = useState<string>("Fetching...");
	const [addedImages, setAddedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const token = useContext(AuthContext).token
	const theme = useTheme()
	let dropZoneRootProps: any = null;
	let dropZoneInputProps: any = null;
	
	useEffect(() => {
		if (loading)
		{
			Toast.show({
				type: 'loading',
				text1: 'loading data...',
				position: 'top',
				autoHide: false,
			}); 
		}
		else
		{
			Toast.hide()
		}
	}, [loading])

	// 🌐 Web drag-drop
	if (Platform.OS === "web") {
		const { getRootProps, getInputProps } = useDropzone({
			accept: { "image/*": [] },
			multiple: true,
			noClick: true,
			useFsAccessApi: true,
			noKeyboard: true,
			onDropAccepted: (acceptedFiles: any, event: DropEvent) => {
				if (acceptedFiles[0])
				{
					console.log("Files dropped:", acceptedFiles);
					const imageArray: ImagePicker.ImagePickerAsset[] = acceptedFiles.map((file: any) => ({
						uri: URL.createObjectURL(file),
						type: file.type,
						fileName: file.name,
						fileSize: file.size,
					}));
					const newImages = [...images, ...imageArray];
					setImages(newImages);
					setCurrentImageIndex(newImages.length - 1); // set to last image
					let newAddedImages = [...addedImages, ...imageArray]
					setAddedImages(newAddedImages);
				}
			}
		});
		dropZoneInputProps = getInputProps;
		dropZoneRootProps = getRootProps;
	}

	const populateMangaData = useCallback(async () => 
	{
		const manga = await getMangaDetails(mangaId.toString());
		setMangaName(getMangaTitle(manga));
	}, [mangaId]);

	useEffect(() => 
	{
		populateMangaData();
	}, [populateMangaData]);

	const populateNoteData = useCallback(async () => 
	{
		const noteResult = await getNote(noteId.toString());
		console.log("Note result:", noteResult)
		if (noteResult.success)
		{
			const note = noteResult.data;
			setStartChapter(note.startChapter != -1 ? note.startChapter.toString() : "");
			setEndChapter(note.endChapter?.toString());
			onChangeText(note.text?? "");

			const imageAssets: ImagePicker.ImagePickerAsset[] = []
			for (const imageId of note.images)
			{
				imageAssets.push({
					uri: await getImageBase64(imageId),
					assetId: imageId,
					fileName: imageId
				} as ImagePicker.ImagePickerAsset)
			}
			setImages(imageAssets)
			setLoading(false);
		}
		else
		{
			router.push({
				pathname: "/app/manga/[mangaId]",
				params: {mangaId: mangaId.toString(), error: "note not found."}
			});
		}
	}, []);

	useEffect(() => 
	{
		populateNoteData();
	}, [populateNoteData]);

	const pickImage = async () => 
	{
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			quality: 1,
			allowsMultipleSelection: true
		});
		if (!result.canceled) 
		{
			let newImages = [...images, ...result.assets]
			setImages(newImages);
			setCurrentImageIndex(newImages.length - 1); // set to last image
			let newAddedImages = [...addedImages, ...result.assets]
			setAddedImages(newAddedImages);
		}
	};

	const editNote = async () => 
	{
		if ((images === undefined || images.length === 0)  && text === undefined) return; // reject empty notes

		const formData = new FormData()
		formData.append('mangaId', mangaId.toString())
		formData.append('deletedImageIds', JSON.stringify(deletedImages))
		formData.append('startChapter', startChapter ? startChapter : String(-1))
		if (endChapter) formData.append('endChapter', endChapter)
		if (text && text.trim().length > 0) formData.append('text', text)

		for (const image of addedImages)
		{
			if (Platform.OS === 'web')
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

		console.log("Submitting edit note form data:", formData);
		await fetch(`${API_URL}/notes/${noteId}`, {
			method: 'PATCH',
			body: formData,
			headers: {
				authorization: `Bearer ${token}`
			}
		}).then(() =>router.navigate(`/app/manga/${mangaId}`))

	}
	
	return (
		<KeyboardDismissWrapper>
			<View style={styles.mainLayout}>
				<Stack.Screen options={{ title: "Edit note" }} />
				<View style={styles.imageViewerContainer}>
					<View style={[images.length > 0 ? styles.imageViewer : styles.noImageContainer, {borderColor: theme.colors.outlineVariant}]}>
						{
							images.length > 0 ? 
							<>
								<Image
									defaultSource={{
										uri: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-add-icon-png-image_4232053.jpg",
									}}
									source={{
										uri: images[currentImageIndex].uri || "https://static.thenounproject.com/png/187803-200.png"
									}}
									resizeMode="contain"
									style={{flex: 1}}
								/>
								<IconButton
									icon={"trash-can-outline"}
									size={20}
									onPress={() => {
										const newImages = images.filter((_, index) => index !== currentImageIndex);
										setImages(newImages);
										setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
										if (images[currentImageIndex].assetId) // assetId exists only for pre-existing images
										{
											setDeletedImages([...deletedImages, images[currentImageIndex].assetId]);
										}
									}}
									style={{position: 'absolute', right: 0, zIndex: 10}}
									mode="contained"
								/>
							</>
							:
							<ThemeText variant="headlineSmall" style={{color: theme.colors.onSurfaceDisabled}}>Add an image using the + icon</ThemeText>
						}
						{
							Platform.OS === 'web' && <div {...dropZoneRootProps()} style={{position: "absolute", width: "100%", height: "100%" }}/>
						}
					</View>
					<View style={styles.thumbnailsContainer}>
						<FlatList
							data={images}
							key={`images_${Date.now()}`}
							renderItem={({ item, index }) => (
								<Pressable onPress={() => {setCurrentImageIndex(index)}}>
									<Image
										source={{ uri: item.uri }}
										resizeMode="cover"
										style={[styles.thumbnail, {borderColor: theme.colors.outlineVariant}]}
									/>
								</Pressable>
							)}
							horizontal
							style={styles.thumbnailList}
							keyExtractor={(_, index) => index.toString()}
						/>
						<IconButton icon={"plus"} size={30} onPress={pickImage} style={{justifyContent: "center"}} mode="contained"/>
					</View>
				</View>
				<View style={{ flexDirection: "column", flex: 3}}>
					<TextInput
						numberOfLines={1}
						label={"manhwa/manga name"}
						editable
						keyboardType="number-pad"
						value={mangaName}
						placeholder={"start"}
						placeholderTextColor={"gray"}
						mode="outlined"
						outlineStyle={loading && {borderColor: theme.colors.onSurfaceDisabled}}
						disabled={loading}
						readOnly
					/>
					<View style={{ flexDirection: "row", alignItems: "center"}}>
						<TextInput
							numberOfLines={1}
							label={"start chapter"}
							editable
							keyboardType="number-pad"
							value={startChapter}
							onChangeText={(text) => setStartChapter(text)}
							placeholder={"start"}
							placeholderTextColor={"gray"}
							style={styles.formInput}
							outlineStyle={loading && {borderColor: theme.colors.onSurfaceDisabled}}
							disabled={loading}
							mode="outlined"
						/>
						<ThemeText variant="labelLarge">&nbsp;-&nbsp;</ThemeText>
						<TextInput
							numberOfLines={1}
							label={"end chapter (optional)"}
							editable
							keyboardType="number-pad"
							value={endChapter}
							onChangeText={(text) => setEndChapter(text)}
							placeholder={"end (optional)"}
							placeholderTextColor={"gray"}
							style={styles.formInput}
							outlineStyle={loading && {borderColor: theme.colors.onSurfaceDisabled}}
							disabled={loading}
							mode="outlined"
						/>
					</View>
					<TextInput
						editable
						multiline
						numberOfLines={4}
						label={"note"}
						placeholder="your note here..."
						value={text}
						onChangeText={onChangeText}
						mode="outlined"
						style={[styles.noteInput]}
						outlineStyle={loading && {borderColor: theme.colors.onSurfaceDisabled}}
						disabled={loading}
						activeOutlineColor={theme.colors.primary}
					/>
					<View style={styles.buttonsContainer}>
						<ThemeButton
							style={styles.button}
							onPress={() => router.navigate(`/app/manga/${mangaId}`) }
							mode="contained-tonal"
						>
							Cancel
						</ThemeButton>
						<ThemeButton
							style={styles.button}

							onPress={async () => 
							{
								editNote()
							}}
							mode="contained"
						>
							Edit
						</ThemeButton>
					</View>
				</View>
			</View>
		</KeyboardDismissWrapper>
	)
}

const styles = StyleSheet.create({
	mainLayout: { flex: 1, padding: 10, flexDirection: "row" },
	imageViewerContainer: { flex: 2, margin: 10, flexDirection: "column" },
	imageViewer: {
		flex: 1,
		width: "100%",
		borderRadius: 10,
		borderWidth: 2,
	},
	noImageContainer: {flex: 1, justifyContent: "center", alignItems: "center", borderWidth: 2, borderRadius: 10, borderStyle:"dashed"},
	addImageText: {fontSize: 28, color: "lightgray"},
	thumbnailsContainer: {height: 100, flexDirection: "row", alignItems: "center"},
	thumbnail: {
		height: "100%",
		aspectRatio: 1,
		borderRadius: 10,
		borderWidth: 2,
		marginRight: 5
	},
	thumbnailList: { flex: 1, alignSelf: "stretch", margin: 10 },
	formText: {fontSize: 20},
	formInput: {
		flex: 1,
		maxWidth: 200
	},
	noteInput: {
		flex: 1
	},
	buttonsContainer: { flexDirection: "row", justifyContent: "space-evenly" },
	button: {
		flex: 1,
		margin: 2,
	}
});