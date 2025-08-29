import { Stack } from "expo-router";

export default function RootLayout() {
	return (<Stack>
		<Stack.Screen name="index" options={{ title: "Library" }}/>
		<Stack.Screen name="manga/[mangaId]"/>
	</Stack>);
}
