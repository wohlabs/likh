import { View, ActivityIndicator } from "react-native";
import ThemeText from "./ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";

export function LoadingScreen({text} : {text?: string})
{
	const { theme } = usePersistentTheme();
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme['--color-background'] }}>
			<ActivityIndicator size="large" />
			<ThemeText style={{margin: 16}}>
				{text}
			</ThemeText>
		</View>
	);
}
