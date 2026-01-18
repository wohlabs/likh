import { View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import ThemeText from "./ThemeText";

export function LoadingScreen({text} : {text?: string})
{
	const theme = useTheme();
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
			<ActivityIndicator size="large" />
			<ThemeText style={{margin: 16}}>
				{text}
			</ThemeText>
		</View>
	);
}
