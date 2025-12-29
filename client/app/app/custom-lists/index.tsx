import ThemeText from "@/components/ThemeText";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import { getCustomLists } from "@/services/custom_lists";
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
                                        <ThemeText variant="labelLarge">{item.mangaIds?.length ?? 0} manga</ThemeText>
                                        <ThemeText variant="bodyMedium">{item.description || "No description"}</ThemeText>
                                    </View>
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
