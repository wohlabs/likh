import { useState } from "react";
import { FlatList, Image, Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { INoteEntry } from "./INotes";

export default function NoteViewer({mangaTitle, note, style}: { mangaTitle?: string, note: INoteEntry, style?: StyleProp<ViewStyle>}) {
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	return (
		<View style={[{ flex: 1, padding: 10, flexDirection: "row" }, style]} pointerEvents="box-none">
			<View style={{ flex: 2, margin: 10, flexDirection: "column" }}>
				{
					note.images?.length > 0 ? 
					<Image
						defaultSource={{
							uri: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-add-icon-png-image_4232053.jpg",
						}}
						source={{
							uri: note.images[currentImageIndex] || "https://static.thenounproject.com/png/187803-200.png"
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
						<Text style={{fontSize: 28, color: "lightgray"}}>No images</Text>
					</View>
				}
				<View style={{height: 100, flexDirection: "row"}}>
					<FlatList
						data={note.images}
						renderItem={({ item, index }) => (
							<Pressable onPress={() => {setCurrentImageIndex(index)}}>
								<Image
									source={{ uri: item }}
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
						style={{ flex: 1, marginTop: 10 }}
						keyExtractor={(_, index) => index?.toString() || ""}
					/>
				</View>
			</View>
			<View style={{ flexDirection: "column", flex: 3}}>
				<Text style={{fontSize: 20}}>Manhwa/Manga: {mangaTitle || "Unknown"}</Text>
				<View style={{ flexDirection: "row", alignItems: "center"}}>
					<Text style={{fontSize: 20}}>Chapter: {note.startChapter?.toString() || ""} - {note.endChapter?.toString() || ""}</Text>
				</View>
				<Text style={{fontSize: 20, fontWeight: "bold"}}>Note:</Text>
				<ScrollView>
					<Text selectable={true} style={{fontSize: 20}}>{note.text}</Text>
				</ScrollView>
			</View>
		</View>
	)
}