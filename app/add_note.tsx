import { Stack } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddNoteScreen()
{
	const [value, onChangeText] = useState('');

	return (
		<View style={{flex: 1}}>
			<Stack.Screen options={{ title: "Add note" }} />
			<Text>Manhwa/Manga: Tianguan Cifu</Text>
			<View style={{flexDirection: "row", justifyContent: "center"}}>
				<Text>Chapter: </Text>
				<TextInput numberOfLines={1} editable keyboardType="number-pad" style={{backgroundColor: "white", outlineColor: "black", flex: 1, outlineWidth: 1, margin: 2}}/>
			</View>
			<View style={{flexDirection: "row"}}>
				<Text>Image: </Text>
				<View style={{flex: 1, maxHeight: 200, minHeight: 100}}>

					<Image defaultSource={{ uri: "https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg" }} 
					source={{ uri: "https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg" }}
					resizeMode="center" style={{flex: 1, maxHeight: 200, minHeight: 100, aspectRatio: 1, backgroundColor: "red"}} />
				</View>
				</View>
			<Text>Note:</Text>
			<TextInput
				editable
				multiline
				numberOfLines={4}
				onChangeText={text => onChangeText(text)}
				placeholder="Your note here..."
				value={value}
				style={{ flex: 1, padding: 10, backgroundColor: "white", outlineColor: "black", fontSize: 18, margin: 5, outlineWidth: 1}}
			/>
			<View style={{ height: 60, flexDirection: "row"}}>
				<TouchableOpacity style={{flex: 1, justifyContent: "center", alignContent: "center", alignItems: "center", backgroundColor: "gray", borderRadius: 10, margin: 10}}><Text>Cancel</Text></TouchableOpacity>
				<TouchableOpacity style={{flex: 1, justifyContent: "center", alignContent: "center", alignItems: "center", backgroundColor: "lightblue", borderRadius: 10, margin: 10}}><Text>Add</Text></TouchableOpacity>
			</View>
		</View>
	)
}