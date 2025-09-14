import { Image, Pressable, StyleProp, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { INoteEntry } from "./INotes";

import { ViewStyle } from "react-native";

export default function NotePreviewCard({ note, style }: { note: INoteEntry, style?: StyleProp<ViewStyle> }) {
	return (
		<Pressable
			style={[
				{ flexDirection: "row", borderRadius: 10, borderColor: "black", borderWidth: 2 },
				style
			]}
		>
			{(note.images && note.images.length > 0) && // render carousel if there are images
				(note.images.length > 1 ? 
				(<Carousel
					height={200}
					width={200}
					data={note.images}
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
						source={{ uri: note.images[0] }}
						style={{ height: "80%", aspectRatio: 1, backgroundColor: "white", borderRadius: 10 }}
						resizeMode="cover"
					/>
				</View>)
		)
		}
			<View style={{ flex: 1, padding: 10 }}>
				<Text>{note.modifiedAt || "date @ time"}</Text>
				<Text>{`Chapter ${note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}`}</Text>
				<Text>{note.text || "No notes"}</Text>
			</View>
		</Pressable>
	);
}