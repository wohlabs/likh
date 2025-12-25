// components/LoadingToast.tsx
import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "react-native-paper";

export default function LoadingToast({ text1 }: { text1?: string }) {
	const theme = useTheme();

	return (
		<View
			style={{
				flexDirection: "row",
				padding: 12,
				backgroundColor: theme.colors.surface,
				borderRadius: 8,
				alignItems: "center",
				elevation: 4,
			}}
		>
			<ActivityIndicator size="small" color={theme.colors.primary} />
			{text1 && (
				<Text style={{ marginLeft: 8, color: theme.colors.onSurface }}>
					{text1}
				</Text>
			)}
		</View>
	);
}
