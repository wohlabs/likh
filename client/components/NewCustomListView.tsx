import { View } from "react-native";
import ThemeText from "./ThemeText";
import { TextInput } from "react-native-paper";
import ThemeButton from "./ThemeButton";
import { useCallback, useState } from "react";
import { createCustomList } from "@/services/custom_lists";
import { ICustomLists } from "@/types/ICustomList";

export default function NewCustomListView({mangaIdToAdd, setAllCustomLists, onCustomListCreated} : {mangaIdToAdd?: number, setAllCustomLists?: React.Dispatch<React.SetStateAction<ICustomLists>>, onCustomListCreated: () => void})
{
	const [title, setTitle] = useState<string>("")
	const [description, setDescription] = useState<string>("")
	
	const createNewCustomList = useCallback(async () => 
	{
		const newMangaIds = mangaIdToAdd ? [mangaIdToAdd] : []
		const response = await createCustomList(title, description, newMangaIds)
		if (response.success && setAllCustomLists)
		{
			setAllCustomLists((prev) => { console.log([...prev, response.data]); return [...prev, response.data]})
			onCustomListCreated()
		}
	}, [title, description, mangaIdToAdd, setAllCustomLists, onCustomListCreated]);

	return (
		<View style={{flex:1, gap: 5}}>
			<ThemeText variant="titleLarge">Create New List</ThemeText>
			<TextInput
				numberOfLines={1}
				label={"title"}
				editable
				value={title}
				onChangeText={setTitle}
				placeholder={"choose a title"}
				placeholderTextColor={"gray"}
				mode="outlined"
			/>
			<TextInput
				numberOfLines={4}
				label={"description (optional)"}
				editable
				multiline
				value={description}
				onChangeText={setDescription}
				placeholder={"description of the list here..."}
				placeholderTextColor={"gray"}
				mode="outlined"
				style={{flex:1}}
			/>
			<View style={{flexDirection: "row", gap: 5}}>
				<ThemeButton style={{flex: 1}} mode="contained-tonal">Cancel</ThemeButton>
				<ThemeButton style={{flex: 1}} mode="contained" onPress={createNewCustomList}>Create</ThemeButton>
			</View>
		</View>
	)
}