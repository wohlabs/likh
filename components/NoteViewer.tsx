import { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Button, IconButton, Menu, useTheme } from 'react-native-paper';
import { INoteEntry } from "./INotes";

export default function NoteViewer({mangaTitle, note, style}: { mangaTitle?: string, note: INoteEntry, style?: StyleProp<ViewStyle>}) {
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const theme = useTheme();
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
				<View style={{ flexDirection: "row", alignItems: "center"}}>
					<Button icon={'share'} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: 40, flex: 1 }}
						onPress={() => {}}
					>
						Share
					</Button>
					<Button icon={"pencil"}
						style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: 40, flex: 1  }}
						onPress={() => {}}
					>
						Edit
					</Button>
					<Button icon='heart'
						style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: 40, flex: 1  }}
						onPress={() => {}}
					>
						Favorite
					</Button>
					<Menu
						visible={optionsVisible}
						onDismiss={() => setOptionsVisible(false)}
						anchor={
							<IconButton icon='dots-horizontal' onPress={() => setOptionsVisible(true)}
								iconColor={theme.colors.primary}
							/>
						}
					>
						<Menu.Item 
							onPress={() => console.log('delete note')} title="Delete" leadingIcon={"delete"}
						/>
					</Menu>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});