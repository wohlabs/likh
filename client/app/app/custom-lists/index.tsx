import ThemeText from "@/components/ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { deleteCustomList, getCustomLists } from "@/services/custom_lists";
import { ICustomLists } from "@/types/ICustomList";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export default function CustomListsIndex()
{
	const { theme } = usePersistentTheme();
	const router = useRouter();
	const [lists, setLists] = useState<ICustomLists>([]);

	useEffect(() => 
	{
		(async () => 
		{
			const res = await getCustomLists();
			setLists(res.success ? res.data : []);
		})();
	}, []);

	return (
		<>
			<Stack.Screen options={{ title: "Custom Lists", headerTitleAlign: 'center' }} />
			<View style={[styles.container, { backgroundColor: theme['--color-background'] }]}>                
				<FlatList
					data={lists}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ padding: 16, gap: 12 }}
					renderItem={({ item }) => (
						<Pressable
							className="bg-surface rounded-xl p-5 flex-row items-center justify-between border border-surfaceVariant"
							onPress={() => router.push({
								pathname: `/app/custom-lists/[listId]`,
								params: {
									listId: item._id
								}
							})} 
						>
							<View className="flex-1">
								<ThemeText>{item.name}</ThemeText>
								<ThemeText style={{opacity: 0.6}}>{item.manga?.length ?? 0} manga</ThemeText>
								<ThemeText style={{opacity: item.description ? 1 : 0.6}}>{item.description || "(No description)"}</ThemeText>
							</View>
							<Ionicons
								name={"trash-sharp"}
								className={`icon-button-contained z-10 ${item.isFavorite && "pointer-events-none"}`}
								size={20}
								disabled={item.isFavorite}
								color={!item.isFavorite ? 'var(--color-onSurfaceVariant)' : 'var(--color-onDisabledBackground)'}
								onPress={async () => 
								{
									const result = await deleteCustomList(item._id)
									if (result.success)
									{
										setLists(lists.filter((list) => list._id !== item._id))
									}
								}}
							/>
						</Pressable>
					)}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
