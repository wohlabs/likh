import ThemeText from "@/components/ThemeText";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Card, IconButton, Menu, useTheme } from "react-native-paper";
import { deleteCustomList, getCustomLists } from "@/services/custom_lists";
import { ICustomLists } from "@/types/ICustomList";

export default function CustomListsIndex()
{
    const theme = useTheme();
    const router = useRouter();
    const [lists, setLists] = useState<ICustomLists>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await getCustomLists();
            setLists(res.success ? res.data : []);
            setLoading(false);
        })();
    }, []);

    return (
        <>
            <Stack.Screen options={{ title: "Custom Lists", headerTitleAlign: 'center' }} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>                
                <FlatList
                    data={lists}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    renderItem={({ item }) => (
                            <Card style={[styles.card]} onPress={() => router.push({
								pathname: `/app/custom-lists/[listId]`,
								params: {
									listId: item._id
								}
							})}> 
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.cardLeft}>
                                        <ThemeText variant="titleMedium">{item.name}</ThemeText>
                                        <ThemeText variant="labelLarge" style={{opacity: 0.6}}>{item.manga?.length ?? 0} manga</ThemeText>
                                        <ThemeText variant="bodyMedium" style={{opacity: item.description ? 1 : 0.6}}>{item.description || "(No description)"}</ThemeText>
                                    </View>
									<IconButton
										icon={"trash-can-outline"}
										size={20}
										disabled={item.isFavorite}
										onPress={async () => {
											const result = await deleteCustomList(item._id)
											if (result.success)
											{
												setLists(lists.filter((list) => list._id !== item._id))
											}
										}}
										style={{position: 'absolute', right: 0, zIndex: 10}}
										mode="contained"
									/>
                                </Card.Content>
                            </Card>
                    )}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: { borderRadius: 12, padding: 6 },
    cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLeft: { flex: 1, paddingRight: 8 },
    cardRight: { alignItems: 'flex-end', width: 96 }
});
