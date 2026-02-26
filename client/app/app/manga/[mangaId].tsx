import { LoadingScreen } from "@/components/LoadingScreen";
import MangaOverviewHeader from "@/components/MangaOverviewHeader";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import ThemeButton from "@/components/ThemeButton";
import ThemeCarousel from "@/components/ThemeCarousel";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import ThemeSearchbar from "@/components/ThemeSearchbar";
import ThemeText from "@/components/ThemeText";
import { blobToBase64 } from "@/components/util";
import { AuthContext } from "@/context/AuthContext";
import { API_URL } from "@/services/AxiosInstance";
import { getMangaData, getMangaDetails } from "@/services/manga.service";
import { deleteMangaNote } from "@/services/notes.service";
import { getMangaTitle, IMangaDetails } from "@/types/IManga";
import { IMangaNotes, INoteEntry } from "@/types/INotes";
import * as Clipboard from "expo-clipboard";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import
{
	FlatList,
	Image,
	Platform,
	Pressable,
	ScrollView,
	StyleProp,
	StyleSheet,
	useWindowDimensions,
	View,
	ViewStyle,
} from "react-native";
import ReanimatedSwipeable, {
	SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import
{
	IconButton,
	Modal,
	Portal,
	TextInput,
	useTheme
} from "react-native-paper";
import Reanimated, {
	SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

function NoteButtons({
	onEditPress,
	onDeletePress,
}: {
	onEditPress?: () => void;
	onDeletePress?: () => void;
}) 
{
	return (
		<>
			<IconButton
				icon={"pencil-outline"}
				size={20}
				onPress={onEditPress}
				style={styles.actionButton}
				mode="contained"
			/>
			<IconButton
				icon={"share-outline"}
				size={20}
				onPress={() => {}}
				style={styles.actionButton}
				mode="contained"
			/>
			<IconButton
				icon={"trash-can-outline"}
				size={20}
				onPress={onDeletePress}
				style={styles.actionButton}
				mode="contained"
			/>
		</>
	);
}

function TranslatableButtonContainer({
	style,
	translation,
	children,
}: {
	note: INoteEntry;
	style?: StyleProp<ViewStyle>;
	progress: SharedValue<number>;
	translation: SharedValue<number>;
	swipeableMethods: SwipeableMethods;
	children: React.ReactNode;
}) 
{
	const swipeLeftAnimation = useAnimatedStyle(() => 
	{
		return {
			transform: [{ translateX: translation.value + 140 }],
		};
	});

	return (
		<Reanimated.View style={[style, swipeLeftAnimation]}>
			{children}
		</Reanimated.View>
	);
}

export default function MangaDetails() 
{
	const theme = useTheme();
	const { width } = useWindowDimensions();
	const { mangaId, error } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);
	const [filteredNotes, setFilteredNotes] = useState<IMangaNotes>([]);
	const [searchString, setSearchString] = useState<string>("");
	const [isViewingOverlay, setIsViewingOverlay] = useState<boolean>(false);
	const [viewerNote, setViewerNote] = useState<INoteEntry>({
		id: "",
		text: "",
		images: [],
		startChapter: -1,
		endChapter: -1,
		createdAt: "",
		modifiedAt: "",
		fromAnilist: false,
	});
	const [viewerNoteIndex, setViewerNoteIndex] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [sortByValue, setSortByValue] = useState<string>("chapter");
	const [sortAscending, setSortAscending] = useState<boolean>(true);
	const [sortOpen, setSortOpen] = useState(false);
	const anilist_token: string = useContext(AuthContext).anilistToken || "";

	// Inline add-note UI state
	const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
	const [newText, setNewText] = useState<string>("");
	const [addImages, setAddImages] = useState<ImagePicker.ImagePickerAsset[]>(
		[],
	);
	const [addCurrentImageIndex, setAddCurrentImageIndex] = useState<number>(0);
	const [newStartChapter, setNewStartChapter] = useState<string>("");
	const [newEndChapter, setNewEndChapter] = useState<string>("");
	let dropZoneRootProps: any = null;
	const [isDropActive, setIsDropActive] = useState(false);
	const token = useContext(AuthContext).token;

	const pasteImageFromClipboard = useCallback(async () => 
	{
		try 
		{
			console.log("pasting");
			const pastedImage = await Clipboard.getImageAsync({
				format: "png",
				jpegQuality: 1,
			});
			if (!pastedImage) return null;

			const image: ImagePicker.ImagePickerAsset = {
				uri: pastedImage.data,
				type: "image",
				fileName: `clipboard_${Date.now()}.png`,
				width: pastedImage.size?.width ?? 0,
				height: pastedImage.size?.height ?? 0,
			};

			const newImgs = [...addImages, image];
			setAddImages(newImgs);
			setAddCurrentImageIndex(newImgs.length - 1);
		}
		catch (err) 
		{
			console.warn("clipboard paste failed", err);
		}
	}, [addImages]);

	async function isImageUrl(url: string) 
	{
		try 
		{
			const res = await fetch(url, { method: "HEAD" });
			const type = res.headers.get("content-type");
			return type?.startsWith("image/");
		}
		catch 
		{
			return false;
		}
	}

	const handleDroppedImageAsString = useCallback(async (
		item: DataTransferItem,
	): Promise<ImagePicker.ImagePickerAsset | null> =>
	{
		return new Promise((resolve) => 
		{
			if (!item) return resolve(null);

			item.getAsString(async (dataUrl) => 
			{
				if (!dataUrl) return resolve(null);
				const isImageUrlFlag = await isImageUrl(dataUrl);
				if (!isImageUrlFlag) return resolve(null);

				const res = await fetch(dataUrl);
				const blob = await res.blob();
				const base64 = await blobToBase64(blob);

				const extension = blob.type.split("/")[1] || "png";
				const fileName = `dropped-image.${extension}`;

				const imageAsset: ImagePicker.ImagePickerAsset = {
					uri: base64,
					fileName: fileName,
					type: "image",
				} as ImagePicker.ImagePickerAsset;

				resolve(imageAsset);
			});
		});
	}, [])

	const handleDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => 
		{
			e.preventDefault();

			const { files, items } = e.dataTransfer;
			// Prevent duplicates: create a set of existing keys based on fileName or uri
			const existingKeys = new Set(
				addImages.map((a) => (a.fileName ? a.fileName : a.uri)),
			);
			let newImages = [...addImages];
			let refresh = false;

			// If blob files are provided, prefer them and skip URI-based items to avoid double-adding
			if (files && files.length > 0) 
			{
				for (const file of files) 
				{
					if (file.type && file.type.startsWith("image/")) 
					{
						const key = file.name || `${file.type}_${file.size}`;
						if (existingKeys.has(key)) continue;
						const image: ImagePicker.ImagePickerAsset = {
							uri: URL.createObjectURL(file),
							type: file.type,
							fileName: file.name,
							fileSize: file.size,
						} as ImagePicker.ImagePickerAsset;
						newImages = [...newImages, image];
						existingKeys.add(key);
						refresh = true;
					}
				}
			}
			else 
			{
				// No blob files: handle URL-based drops
				for (const item of items) 
				{
					if (item.type === "text/uri-list") 
					{
						const asset = await handleDroppedImageAsString(item);
						if (asset === null) continue;
						const key = asset.fileName || asset.uri;
						if (existingKeys.has(key)) continue;
						newImages = [...newImages, asset];
						existingKeys.add(key);
						refresh = true;
					}
				}
			}

			if (refresh) 
			{
				setAddImages(newImages);
				setAddCurrentImageIndex(newImages.length - 1);
			}
		},
		[addImages, handleDroppedImageAsString]
	);

	const { getRootProps } = useDropzone({
		accept: { "image/*": [] },
		multiple: true,
		noClick: true,
		useFsAccessApi: true,
		noKeyboard: true,
		disabled: Platform.OS !== 'web'
	});
	dropZoneRootProps = getRootProps;

	// Detect dragging over the window to activate the overlay so it can receive the drop
	useEffect(() => 
	{
		const onWindowDrop = async (e: DragEvent) => 
		{
			e.preventDefault();
			setIsDropActive(false);
			await handleDrop(e as unknown as React.DragEvent<HTMLDivElement>);
		};

		window.addEventListener("drop", onWindowDrop as unknown as EventListener);
		window.addEventListener(
			"paste",
			pasteImageFromClipboard as unknown as EventListener,
		);

		return () => 
		{
			window.removeEventListener(
				"drop",
				onWindowDrop as unknown as EventListener,
			);
			window.removeEventListener(
				"paste",
				pasteImageFromClipboard as unknown as EventListener,
			);
		};
	}, [addImages, handleDrop, pasteImageFromClipboard]);

	const pickAddImage = async () => 
	{
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			quality: 1,
			allowsMultipleSelection: true,
		});

		if (!result.canceled) 
		{
			let newImgs = [...addImages, ...result.assets];
			setAddImages(newImgs);
			setAddCurrentImageIndex(newImgs.length - 1);
		}
	};

	const removeAddImage = (index: number) => 
	{
		const newImgs = addImages.filter((_, i) => i !== index);
		setAddImages(newImgs);
		setAddCurrentImageIndex(Math.max(0, addCurrentImageIndex - 1));
	};

	const submitInlineNote = async () => 
	{
		if (addImages.length === 0 && (!newText || newText.trim().length === 0))
			return;
		const formData = new FormData();
		formData.append("mangaId", mangaId.toString());
		formData.append(
			"startChapter",
			newStartChapter ? newStartChapter : String(-1),
		);
		if (newEndChapter) formData.append("endChapter", newEndChapter);
		if (newText && newText.trim().length > 0) formData.append("text", newText);
		for (const image of addImages) 
		{
			if (Platform.OS === "web") 
			{
				const resp = await fetch(image.uri);
				const blob = await resp.blob();
				formData.append(
					"images",
					blob,
					image.fileName || Date.now().toString(),
				);
			}
			else 
			{
				const file: File = new File(image.uri);
				formData.append(
					"images",
					file,
					image.fileName || Date.now().toString(),
				);
			}
		}
		await fetch(`${API_URL}/notes`, {
			method: "POST",
			body: formData,
			headers: {
				authorization: `Bearer ${token}`,
			},
		}).then(async () => 
		{
			setIsAddingNote(false);
			setNewText("");
			setAddImages([]);
			setNewStartChapter("");
			setNewEndChapter("");
			await fetchData();
		});
	};

	// Optional: Clear the error from the URL so it doesn't persist on refresh
	useEffect(() => 
	{
		if (error) 
		{
			Toast.show({
				type: "error",
				text1: error as string,
			});

			setTimeout(() => 
			{
				router.replace({
					pathname: "/app/manga/[mangaId]",
					params: { mangaId: mangaId as string },
				});
			}, 50);
		}
	}, [error, mangaId]);

	const populateMangaData = useCallback(async () => 
	{
		const manga = await getMangaDetails(mangaId.toString(), anilist_token);
		if (manga) 
		{
			setManga(manga);
		}
		setLoading(false);
	}, [mangaId, anilist_token]);

	useEffect(() => 
	{
		populateMangaData();
	}, [populateMangaData]);

	const fetchData = useCallback(async () => 
	{
		const DATA = await getMangaData(mangaId.toString(), anilist_token);
		setData(DATA);
	}, [mangaId, anilist_token]);

	useEffect(() => 
	{
		fetchData();
	}, [fetchData]);

	const onDelete = async (noteId: string) => 
	{
		try 
		{
			const notes = await deleteMangaNote(mangaId.toString(), noteId);
			setIsViewingOverlay(false);
			setData(notes);
		}
		catch 
		{
			console.error("Could not delete note");
		}
	};

	useEffect(() => 
	{
		let tempData =
			searchString.trim().length === 0
				? data
				: data.filter(
					(note: INoteEntry) =>
						note.text &&
							note.text.toLowerCase().includes(searchString.toLowerCase()),
				);
		tempData = tempData.toSorted((a: INoteEntry, b: INoteEntry) => 
		{
			if (sortByValue === "date modified") 
			{
				if (sortAscending) 
				{
					return (
						new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
					);
				}
				else 
				{
					return (
						new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
					);
				}
			}
			else if (sortByValue === "date created") 
			{
				if (sortAscending) 
				{
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				}
				else 
				{
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				}
			}
			else 
			{
				if (sortAscending) 
				{
					return a.startChapter - b.startChapter;
				}
				else 
				{
					return b.startChapter - a.startChapter;
				}
			}
		});
		setFilteredNotes(tempData);
	}, [searchString, data, sortByValue, sortAscending]);

	useEffect(() => 
	{
		setViewerNote(filteredNotes[viewerNoteIndex]);
	}, [filteredNotes, viewerNoteIndex]);

	return (
		<View style={{ flex: 1 }}>
			{loading ? (
				<LoadingScreen />
			) : (
				<ScrollView nestedScrollEnabled={true} style={{ paddingHorizontal: 5 }}>
					<MangaOverviewHeader manga={manga} style={styles.mangaHeader} />
					{/* Inline add-note / status input (social-media style) */}
					<View
						style={[
							styles.addNoteContainer,
							{ borderColor: theme.colors.outlineVariant },
						]}
					>
						{Platform.OS === "web" && isAddingNote && (
							<div
								{...dropZoneRootProps()}
								onPaste={pasteImageFromClipboard}
								onDrop={handleDrop}
								style={{
									position: "absolute",
									width: "100%",
									height: "100%",
									zIndex: 2,
									pointerEvents: isDropActive ? "auto" : "none",
									backgroundColor: isDropActive
										? "rgba(0,0,0,0.03)"
										: "transparent",
								}}
							/>
						)}
						{!isAddingNote ? (
							<Pressable
								style={styles.addNoteCollapsed}
								onPress={() => setIsAddingNote(true)}
							>
								<ThemeText>add a note...</ThemeText>
							</Pressable>
						) : (
							<>
								<TextInput
									multiline
									numberOfLines={3}
									label={"note"}
									placeholder="write your note here..."
									value={newText}
									onChangeText={setNewText}
									mode="outlined"
									style={styles.addNoteTextInput}
									autoFocus
								/>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginTop: 8,
									}}
								>
									<TextInput
										numberOfLines={1}
										label={"start chapter"}
										editable
										keyboardType="number-pad"
										value={newStartChapter}
										onChangeText={(text) => setNewStartChapter(text)}
										placeholder={"start"}
										style={styles.formInput}
										mode="outlined"
									/>
									<ThemeText>&nbsp;-&nbsp;</ThemeText>
									<TextInput
										numberOfLines={1}
										label={"end chapter (optional)"}
										editable
										keyboardType="number-pad"
										value={newEndChapter}
										onChangeText={(text) => setNewEndChapter(text)}
										placeholder={"end (optional)"}
										style={styles.formInput}
										mode="outlined"
									/>
								</View>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginTop: 8,
									}}
								>
									<FlatList
										data={addImages}
										renderItem={({ item, index }) => (
											<Pressable onPress={() => setAddCurrentImageIndex(index)}>
												<Image
													source={{ uri: item.uri }}
													resizeMode="cover"
													style={[
														styles.thumbnail,
														{ borderColor: theme.colors.outlineVariant },
													]}
												/>
												<IconButton
													icon="trash-can-outline"
													size={18}
													onPress={() => removeAddImage(index)}
													style={{ position: "absolute", right: 0 }}
													mode="contained"
												/>
											</Pressable>
										)}
										horizontal
										style={{ flex: 1 }}
										keyExtractor={(_, index) => index.toString()}
									/>
									<IconButton
										icon={"plus"}
										size={26}
										onPress={pickAddImage}
										mode="contained"
									/>
								</View>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-evenly",
										marginTop: 8,
									}}
								>
									<ThemeButton
										style={styles.button}
										mode="contained-tonal"
										onPress={() => 
										{
											setIsAddingNote(false);
											setNewText("");
											setAddImages([]);
											setNewStartChapter("");
											setNewEndChapter("");
										}}
									>
										Cancel
									</ThemeButton>
									<ThemeButton
										style={styles.button}
										mode="contained"
										onPress={submitInlineNote}
									>
										Add
									</ThemeButton>
								</View>
							</>
						)}
					</View>
					{filteredNotes.length === 0 ? (
						<View
							style={{
								flex: 1,
								alignContent: "center",
								alignItems: "center",
								padding: 10,
							}}
						>
							<ThemeText
								style={{ flex: 1, margin: "auto" }}
							>
								No notes found. log a note for this manga
							</ThemeText>
						</View>
					) : (
						<>
							<View
								style={{
									flexDirection: "row-reverse",
									alignItems: "center",
									zIndex: 2,
								}}
							>
								<IconButton
									icon={sortAscending ? "sort-ascending" : "sort-descending"}
									onPress={() => setSortAscending(!sortAscending)}
								/>
								<View>
									<ThemeDropdown
										value={sortByValue}
										setOpen={setSortOpen}
										open={sortOpen}
										items={[
											{
												label: "date created",
												value: "date created",
											},
											{
												label: "date modified",
												value: "date modified",
											},
											{
												label: "chapter",
												value: "chapter",
											},
										]}
										setValue={setSortByValue}
									/>
								</View>
								<ThemeText
									style={{ margin: 0, marginHorizontal: 5 }}
								>
									Sort by
								</ThemeText>
							</View>
							<FlatList
								data={filteredNotes}
								keyExtractor={(item) => `NotePreview_${item.id}`}
								key={`filteredNotes`}
								numColumns={1}
								contentContainerStyle={{ flexGrow: 0 }}
								scrollEnabled={true}
								renderItem={({
									item,
									index,
								}: {
									item: INoteEntry;
									index: any;
								}) =>
									Platform.OS === "web" && width > 500 ? (
										<View
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
											}}
										>
											<NotePreviewCard
												note={item}
												onPress={() => 
												{
													setViewerNoteIndex(index);
													setIsViewingOverlay(true);
												}}
											/>
											<NoteButtons
												onEditPress={() =>
													router.navigate(
														`/app/manga/${mangaId}/edit_note/${item.id}`,
													)
												}
												onDeletePress={() => onDelete(item.id)}
												key={`NotePreviewCard_${item.id}`}
											/>
										</View>
									) : (
										<ReanimatedSwipeable
											containerStyle={styles.noteContainer}
											childrenContainerStyle={{ flex: 1 }}
											friction={2}
											renderRightActions={(
												progress: SharedValue<number>,
												translation: SharedValue<number>,
												swipeableMethods: SwipeableMethods,
											) => (
												<TranslatableButtonContainer
													note={item}
													progress={progress}
													translation={translation}
													swipeableMethods={swipeableMethods}
													style={{ flexDirection: "row", alignItems: "center" }}
												>
													<NoteButtons
														onEditPress={() =>
															router.navigate(
																`/app/manga/${mangaId}/edit_note/${item.id}`,
															)
														}
														onDeletePress={() => onDelete(item.id)}
													/>
												</TranslatableButtonContainer>
											)}
											key={`NotePreview_Swipeable_${item.id}`}
										>
											<NotePreviewCard
												key={`NotePreview_${item.id}`}
												note={item}
												onPress={() => 
												{
													setViewerNoteIndex(index);
													setIsViewingOverlay(true);
												}}
											/>
										</ReanimatedSwipeable>
									)
								}
							/>
						</>
					)}
					<Portal theme={theme}>
						<Modal
							visible={isViewingOverlay}
							theme={theme}
							contentContainerStyle={styles.noteModalContainer}
							onDismiss={() => 
							{
								setIsViewingOverlay(false);
							}}
						>
							<ThemeCarousel
								data={filteredNotes}
								width={width}
								defaultIndex={viewerNoteIndex}
								carouselRenderItem={(item) => (
									<NoteViewer
										note={item.item}
										mangaTitle={getMangaTitle(manga)}
										style={[
											styles.noteViewer,
											{ backgroundColor: theme.colors.background },
										]}
										onDelete={() => onDelete(viewerNote.id)}
										onEdit={() => 
										{
											router.navigate(
												`/app/manga/${mangaId}/edit_note/${viewerNote.id}`,
											);
											setIsViewingOverlay(false);
										}}
										key={`NoteViewer_${viewerNote?.id}`}
									/>
								)}
							/>
						</Modal>
					</Portal>
					<View style={{ height: 85 }} />
				</ScrollView>
			)}
			<View style={styles.floatingContainer}>
				<View style={styles.searchBarContainer}>
					<ThemeSearchbar
						placeholder="search note"
						onChangeText={setSearchString}
						style={styles.searchBar}
						value={searchString}
					/>
					<IconButton
						icon={"plus"}
						size={30}
						onPress={() => setIsAddingNote(!isAddingNote)}
						style={styles.addButton}
						mode="contained"
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaHeader: {
		alignItems: "center",
		width: "100%",
		justifyContent: "center",
		flexDirection: "row",
		marginVertical: 10,
		zIndex: 3,
	},
	actionButton: { boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	noteContainer: {
		marginHorizontal: 5,
		flexDirection: "row",
		alignItems: "center",
		overflow: "hidden",
	},
	noteModalContainer: {
		borderRadius: 10,
		width: "100%",
		height: "85%",
		maxHeight: 700,
		padding: 0,
	},
	noteViewer: {
		borderRadius: 10,
		flex: 1,
		marginHorizontal: 30,
		boxShadow: "0px 4px 5px rgba(0,0,0,0.3)",
	},
	// Add-note (inline) styles
	addNoteContainer: {
		borderWidth: 2,
		borderRadius: 10,
		padding: 10,
		marginVertical: 10,
		backgroundColor: "transparent",
		maxWidth: 1000,
		width: "100%",
		margin: "auto",
	},
	addNoteCollapsed: {
		padding: 12,
		borderRadius: 8,
		backgroundColor: "rgba(0,0,0,0.03)",
		alignItems: "flex-start",
	},
	addNoteTextInput: { minHeight: 80, maxHeight: 140 },
	formInput: {
		flex: 1,
		maxWidth: 200,
	},
	thumbnail: {
		height: 80,
		aspectRatio: 1,
		borderRadius: 10,
		borderColor: "black",
		borderWidth: 2,
		marginRight: 5,
	},
	button: {
		flex: 1,
		margin: 2,
	},
	floatingContainer: {
		width: "100%",
		minWidth: 350,
		height: 60,
		position: "absolute",
		bottom: 25,
		flexDirection: "row",
		alignItems: "center",
		margin: "auto",
		justifyContent: "center",
		pointerEvents: "none",
	},
	searchBarContainer: {
		width: "90%",
		flexDirection: "row",
		maxWidth: 600,
		alignItems: "center",
	},
	searchBar: {
		margin: 10,
		borderRadius: 10,
		flex: 1,
		boxShadow: "0px 4px 5px rgba(0,0,0,0.3)",
	},
	addButton: { boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
});
