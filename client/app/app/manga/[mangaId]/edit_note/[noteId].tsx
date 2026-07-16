import ThemeBadge from "@/components/ThemeBadge";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { getImageBase64WithOcr } from "@/components/util";
import { AuthContext } from "@/context/AuthContext";
import { API_URL } from "@/services/AxiosInstance";
import { getMangaDetails } from "@/services/manga.service";
import { getNote } from "@/services/notes.service";
import { getMangaTitle } from "@/types/IManga";
import { Ionicons } from "@expo/vector-icons";
import { File } from 'expo-file-system';
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { fetch } from 'expo/fetch';
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DropEvent, useDropzone } from "react-dropzone";
import
{
	FlatList,
	Image,
	Keyboard,
	Platform,
	Pressable,
	StyleSheet,
	TouchableWithoutFeedback,
	View
	, TextInput } from "react-native";
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

	const tagTextInputFocus = useRef<TextInput>(null);
	const tagAddRef = useRef<Text>(null);
	const [tags, setTags] = useState<string[]>([]);
	const [isTagFocused, setIsTagFocused] = useState<boolean>(false);
	const [addTagWidth, setAddTagWidth] = useState<number>(0);
	const [newTag, setNewTag] = useState<string>("");
	
	useEffect(() => 
	{
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
	const { getRootProps /*, getInputProps*/ } = useDropzone({
		accept: { "image/*": [] },
		multiple: true,
		noClick: true,
		useFsAccessApi: true,
		noKeyboard: true,
		disabled: Platform.OS !== 'web',
		onDropAccepted: (acceptedFiles: any, event: DropEvent) => 
		{
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
	// const dropZoneInputProps = getInputProps;
	const dropZoneRootProps = getRootProps;

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
			setTags(note.tags);
			onChangeText(note.text?? "");

			const imageAssets: ImagePicker.ImagePickerAsset[] = []
			for (const imageId of note.images)
			{
				imageAssets.push({
					uri: (await getImageBase64WithOcr(imageId)).image,
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
				params: {mangaId: mangaId.toString(), error: "note not found"}
			});
		}
	}, [mangaId, noteId]);

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
		if (tags)
		{
			tags.forEach((tag) => {
				formData.append('tags[]', tag);
			});
		}
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
		})
			.then(async response => 
			{
				if (response.ok)
				{
					router.navigate(`/app/manga/${mangaId}`)
				}
				else
				{
					const rawMessage = (await response.text())
					const errorMessage = rawMessage.slice(1, rawMessage.length - 1)
					Toast.show({
						type: "error",
						text1: errorMessage
					})
				}
			})
	}
	
	return (
		<KeyboardDismissWrapper>
			<View style={styles.mainLayout}>
				<Stack.Screen options={{ title: "Edit note" }} />
				<View style={styles.imageViewerContainer}>
					<View
						className="border-outlineVariant"
						style={[images.length > 0 ? styles.imageViewer : styles.noImageContainer]}
					>
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
										className="flex-1"
									/>
									<Ionicons
										name={"trash-outline"}
										className="icon-button-contained absolute right-0 z-10"
										size={20}
										onPress={() => 
										{
											const newImages = images.filter((_, index) => index !== currentImageIndex);
											setImages(newImages);
											setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
											if (images[currentImageIndex].assetId) // assetId exists only for pre-existing images
											{
												setDeletedImages([...deletedImages, images[currentImageIndex].assetId]);
											}
										}}
									/>
								</>
								:
								<ThemeText
									className="text-outline"
								>Add an image using the + icon</ThemeText>
						}
						{
							Platform.OS === 'web' && <div {...dropZoneRootProps()} style={{position: "absolute", width: "100%", height: "100%" }}/>
						}
					</View>
					<View className="h-25 flex-row w-full">
						<FlatList
							data={images}
							key={`images_${Date.now()}`}
							renderItem={({ item, index }) => (
								<Pressable onPress={() => {setCurrentImageIndex(index)}} className="w-20 h-20">
									<Image
										source={{ uri: item.uri }}
										resizeMode="cover"
										className="h-full aspect-square border-2 border-outlineVariant rounded-lg mr-1.5"
									/>
								</Pressable>
							)}
							horizontal
							className="flex-1 mr-2 mt-2 flex-row"
							keyExtractor={(_, index) => index.toString()}
						/>
						<Ionicons name={"add"} size={30}
							className="icon-button-contained self-center"
							onPress={pickImage}
						/>
					</View>
				</View>
				<View style={{ flexDirection: "column", flex: 3}}>
					<TextInput
						numberOfLines={1}
						editable={false}
						value={mangaName}
						placeholder="manhwa/manga name"
						className={`rounded-lg px-3 py-2 text-base border-2 opacity-50 border-outlineVariant text-onDisabledBackground`}
					/>
					<View style={{ flexDirection: "row", alignItems: "center"}}>
						<TextInput
							numberOfLines={1}
							editable={!loading}
							keyboardType="number-pad"
							value={startChapter}
							onChangeText={(text) => setStartChapter(text)}
							placeholder="start chapter"
							className="flex-1 max-w-48 rounded-lg px-3 py-2 text-base border-2 border-outlineVariant text-onBackground mt-2 mb-2"
							style={{
								opacity: loading ? 0.5 : 1,
							}}
						/>
						<ThemeText>&nbsp;-&nbsp;</ThemeText>
						<TextInput
							numberOfLines={1}
							editable={!loading}
							keyboardType="number-pad"
							value={endChapter}
							onChangeText={(text) => setEndChapter(text)}
							placeholder="end chapter (optional)"
							className="flex-1 max-w-48 rounded-lg px-3 py-2 text-base border-2 border-outlineVariant text-onBackground mt-2 mb-2"
							style={{
								opacity: loading ? 0.5 : 1,
							}}
						/>
					</View>
					<View className="flex-row items-center mb-2 gap-1">
						<ThemeBadge onPress={(e) => { setIsTagFocused(true);}} textColor={"green"} className="border-2 p-1! border-outlineVariant">
							{
								isTagFocused
								? <TextInput style={{
									minWidth: addTagWidth,
									maxWidth: addTagWidth + 50
								}} ref={tagTextInputFocus}
									onBlur={() => setIsTagFocused(false)}
									onChangeText={setNewTag}
									value={newTag}
									onSubmitEditing={() => {
									setNewTag("")
									setTags([...(new Set([newTag, ...tags]))])
									}}
									className="outline-none" />
								: <ThemeText ref={tagAddRef} onLayout={(e) => setAddTagWidth(e.nativeEvent.layout.width)}>tag +</ThemeText>
							}
						</ThemeBadge>
						{
							tags?.map((value) => 
								<ThemeBadge labelForColor={value} className="border-2 p-1!">
									{value}
									<Ionicons name="close-circle" className="hover:bg-outlineVariant rounded-sm" onPress={() => { setTags(tags.filter(tag => tag !== value)) }}/>
								</ThemeBadge>
							)
						}
					</View>
					<TextInput
						editable={!loading}
						multiline
						numberOfLines={4}
						placeholder="your note here..."
						value={text}
						onChangeText={onChangeText}
						className="rounded-lg p-3 text-base min-h-24 border-outlineVariant text-onBackground border-2 flex-1 mb-2"
						style={{
							opacity: loading ? 0.5 : 1,
						}}
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
	imageViewerContainer: { flex: 2, marginHorizontal: 10, flexDirection: "column" },
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
	buttonsContainer: { flexDirection: "row", justifyContent: "space-evenly" },
	button: {
		flex: 1,
		margin: 2,
	}
});