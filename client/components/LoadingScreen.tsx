import { View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

export function LoadingScreen()
{
	const theme = useTheme();
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
