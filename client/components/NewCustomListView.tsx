import { createCustomList } from "@/services/custom_lists";
import { ICustomLists } from "@/types/ICustomList";
import { useCallback, useState } from "react";
import { TextInput, View } from "react-native";
import ThemeButton from "./ThemeButton";
import ThemeText from "./ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";

export default function NewCustomListView({mangaIdToAdd, setAllCustomLists, onCustomListCreated} : {mangaIdToAdd?: number, setAllCustomLists?: React.Dispatch<React.SetStateAction<ICustomLists>>, onCustomListCreated: () => void})
{
	const [title, setTitle] = useState<string>("")
	const [description, setDescription] = useState<string>("")
	const { theme } = usePersistentTheme()
	
	const createNewCustomList = useCallback(async () => 
	{
		const newMangaIds = mangaIdToAdd ? [mangaIdToAdd] : []
		const response = await createCustomList(title, description, newMangaIds)
		if (response.success && setAllCustomLists)
		{
			setAllCustomLists((prev) => [...prev, response.data])
			onCustomListCreated()
		}
	}, [title, description, mangaIdToAdd, setAllCustomLists, onCustomListCreated]);

	return (
		<View style={{flex:1, gap: 5}}>
			<ThemeText className="text-xl font-medium">Create New List</ThemeText>
			<ThemeText>Title</ThemeText>
			<TextInput
				numberOfLines={1}
				editable
				value={title}
				onChangeText={setTitle}
				placeholder={"choose a title"}
				placeholderTextColor={theme["--color-onDisabledBackground"]}
				className="outline-2 outline-outline rounded-md p-2 text-onBackground"
			/>
			<ThemeText>Description (optional)</ThemeText>
			<TextInput
				numberOfLines={4}
				editable
				multiline
				value={description}
				onChangeText={setDescription}
				placeholder={"description of the list here..."}
				placeholderTextColor={theme["--color-onDisabledBackground"]}
				className="flex-1 outline-2 outline-outline rounded-md p-2 text-onBackground"
			/>
			<View style={{flexDirection: "row", gap: 5}}>
				<ThemeButton className="flex-1" mode="contained-tonal">Cancel</ThemeButton>
				<ThemeButton className="flex-1" mode="contained" onPress={createNewCustomList}>Create</ThemeButton>
			</View>
		</View>
	)
}