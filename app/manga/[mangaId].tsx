import { IMangaNotes, INoteEntry } from "@/components/INotes";
import { formatData, getMangaData, getMangaDetails, IMangaDetails } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setManga(manga);
		};
		populateMangaData();
	}, []);

	const fetchData = async () => {
		const DATA = await getMangaData(mangaId.toString());
		setData(DATA);
	};
	useEffect(() => {
		fetchData();
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchData()
		}, [])
	)


	return (
		<ScrollView style={{}}>
			<Stack.Screen options={{ title: manga?.title.userPreferred || "Unknown", headerShown: false }} />
			<View style={{ alignItems: 'center', height: 300, width: '100%', justifyContent: 'center', flexDirection: 'row' }}>
				<View style={{height: '100%', width: '70%', flexDirection: 'row'}}>
					<Image
						source={{ uri: manga?.coverImage?.large }}
						resizeMode="contain"
						style={{height: '100%', aspectRatio: '1'}}
					/>
					<View style={{ flex: 1}}>
						<View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
							<Text style={{fontSize: 24, fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'}}>{manga?.title.userPreferred}</Text>
						</View>
						<Text style={{flex: 2}}>{manga?.description}</Text>
					</View>
				</View>
			</View>
			<FlatList
				data={formatData(data, 2)}
				keyExtractor={(_, index) => index.toString()}
				numColumns={2}
				style={{ flexGrow: 0 }}
				contentContainerStyle={{flexGrow: 0}}
				scrollEnabled={false}
				columnWrapperStyle={{ marginLeft: 5, marginRight: 5 }}
				renderItem={({ item }: { item: INoteEntry }) => (
					item.id ? <Pressable
						style={{ flex: 1, height: 200, margin: 5, flexDirection: "row", borderRadius: 10, borderColor: "black", borderWidth: 2 }}
						onPress={() => {
							// item.images && router.navigate(`/manga/${mangaId}/viewer`);
						}}
					>
						{(item.images && item.images.length > 0) && // render carousel if there are images
							(item.images.length > 1 ? 
							(<Carousel
								height={200}
								width={200}
								data={item.images}
								loop={false}
								pagingEnabled={true}
								snapEnabled={true}
								enabled={true}
								mode={"horizontal-stack"}

								modeConfig={{
									snapDirection: 'left',
									rotateZDeg: 50
								}}

								customConfig={() => ({ type: "positive", viewCount: 1 })}
								renderItem={({ item, index }) => (
									<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} key={index}>
										<Image
											source={{ uri: item }}
											style={{ height: "80%", aspectRatio: 1, backgroundColor: "white", borderRadius: 10 }}
											resizeMode="cover"
										/>
									</View>
								)}
							/>)
							:
							(<View style={{ width: 200, height: 200, justifyContent: "center", alignItems: "center" }} key={0}>
								<Image
									source={{ uri: item.images[0] }}
									style={{ height: "80%", aspectRatio: 1, backgroundColor: "white", borderRadius: 10 }}
									resizeMode="cover"
								/>
							</View>)
					)
					}
						<View style={{ flex: 1, padding: 10 }}>
							<Text>6/3/2025 @ 14:00PM</Text>
							<Text>Chapter 5</Text>
							<Text>{item.text || "No notes"}</Text>
						</View>
					</Pressable>
					:
					<View style={{ flex: 1, margin: 5}}></View>
				)}
			/>
			<TouchableOpacity style={{height: 60, width: "100%", alignItems: "center", backgroundColor: "green", justifyContent: "center"}} onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}>
				<Ionicons name="add" size={35} color={"white"}/>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});