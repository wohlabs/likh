import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function ProtectedLayout() {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: theme.colors.background },
				headerStyle: { backgroundColor: theme.colors.surfaceVariant },
				headerTintColor: theme.colors.onSurface,
			}}
		/>
	);
}
