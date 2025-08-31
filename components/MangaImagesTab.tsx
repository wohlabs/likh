import { router } from "expo-router";
import
	{
		FlatList,
		Image,
		Pressable,
		SectionList,
		StyleSheet,
		Text,
	} from "react-native";

const DATA = [
	{
		id: 1,
		chapter: 2,
		images: [
			{
				id: "1",
				title: "First",
				image:
					"https://preview.redd.it/manhua-chapter-87-spoiler-hualian-screen-captures-ive-been-v0-njyxu6jili3a1.jpg?width=1080&crop=smart&auto=webp&s=5a9139155b273fa906e7152db3c035be81fb1ed5",
			},
			{
				id: "2",
				title: "Second",
				image:
					"https://preview.redd.it/fnzobhlazmi81.png?width=640&crop=smart&auto=webp&s=8f221e7e836dad15353ab6195b4756be5284e0b6",
			},
			{
				id: "3",
				title: "Third",
				image: "https://pbs.twimg.com/media/Edrht3fUMAEi-LU.jpg:large",
			},
			{
				id: "4",
				title: "First",
				image:
					"https://preview.redd.it/xf1dltl7nw881.jpg?width=640&crop=smart&auto=webp&s=7b07229e1383c78087483a6831f2a496e9cfa774",
			},
		],
	},
	{
		id: 2,
		chapter: 5,
		images: [
			{
				id: "5",
				title: "Second",
				image: "https://pbs.twimg.com/media/EdS_LqCUYAAJeYu.jpg:large",
			},
			{
				id: "6",
				title: "Third",
				image:
					"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/856317be-7d5c-440c-813a-68e6a74148aa/dhap05n-6cbd2465-fac6-4f12-b610-30ed8b705ede.png/v1/fill/w_1024,h_2189,q_80,strp/oh__my_favourite_memory_by_kirsten7767_dhap05n-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjE4OSIsInBhdGgiOiJcL2ZcLzg1NjMxN2JlLTdkNWMtNDQwYy04MTNhLTY4ZTZhNzQxNDhhYVwvZGhhcDA1bi02Y2JkMjQ2NS1mYWM2LTRmMTItYjYxMC0zMGVkOGI3MDVlZGUucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.5ASSjbvXThnHcWh1dtj0XpC6uaFx1koKYcH34zwZPyU",
			},
		],
	},
	{
		id: 3,
		chapter: 69,
		images: [
			{
				id: "7",
				title: "First",
				image:
					"https://i.pinimg.com/originals/0d/87/5c/0d875c9ce34f072606c300b7f179144d.jpg",
			},
			{
				id: "8",
				title: "Second",
				image:
					"https://pbs.twimg.com/media/EBQFNAsXkAE6ki0?format=jpg&name=4096x4096",
			},
			{
				id: "9",
				title: "Third",
				image:
					"https://preview.redd.it/s2e5-spoilers-the-infamous-falling-scene-v0-qaii950gck1c1.jpg?width=640&crop=smart&auto=webp&s=2d4b970859878bb1521289910c543e62bd557772",
			},
			{
				id: "10",
				title: "First",
				image:
					"https://preview.redd.it/manhua-chapter-100-sharing-some-text-free-hualian-v0-d3twjnha6vwb1.jpg?width=640&crop=smart&auto=webp&s=dd555cb941068eeab50b54134ba35344abcc2774",
			},
			{
				id: "11",
				title: "Second",
				image:
					"https://preview.redd.it/manhua-chapter-101-last-of-volume-8-sharing-20-speech-v0-ef1sokgozozb1.jpg?width=640&crop=smart&auto=webp&s=683958b82fe0adcf225c9ed6db41fd69d93159a8",
			},
			{
				id: "12",
				title: "Third",
				image:
					"https://n10.mbeaj.org/media/7006/0d8/660768bf8135fb4d7bb0d8d0/49936173_800_1586_190512.webp",
			},
		],
	},
];

const data = DATA.map((section) => {
	return {
		title: `Chapter ${section.chapter}`,
		data: [
			{
				id: section.id,
				images: section.images.map((img) => ({
					id: img.id,
					uri: img.image,
				})),
			},
		],
	};
});

const formatData = (data: Array<any>, numColumns: number) => {
	// source: https://www.youtube.com/watch?v=8wv0kjsirso
	const numberOfFullRows = Math.floor(data.length / numColumns);
	let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
	while (
		numberOfElementsLastRow !== numColumns &&
		numberOfElementsLastRow !== 0
	) {
		data.push({});
		numberOfElementsLastRow++;
	}
	return data;
};

export default function MangaImagesTab() {
	return (
		<SectionList
			sections={data}
			keyExtractor={(item) => item.id.toString()}
			style={{ flex: 1 }}
			renderSectionHeader={({ section: { title } }) => (
				<Text style={{ fontWeight: "bold" }}>{title}</Text>
			)}
			renderItem={({ item }) => (
				<FlatList
					data={formatData(item.images, 3)}
					keyExtractor={(item: any) => item.id}
					numColumns={3}
					style={{ flex: 1 }}
					renderItem={({ item }: any) => (
						<Pressable
							style={{ flex: 1 }}
							onPress={() => router.navigate("/manga/123/viewer")}
						>
							<Image
								source={{ uri: item.uri }}
								style={styles.mangaCoverImage}
								resizeMode="center"
							/>
						</Pressable>
					)}
				/>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	mangaCoverImage: { flex: 1, aspectRatio: 1 },
});
