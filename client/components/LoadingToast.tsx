// components/LoadingToast.tsx
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingToast({ text1 }: { text1?: string }) 
{
	const { theme } = usePersistentTheme();

	return (
		<View
			style={{
				flexDirection: "row",
				padding: 12,
				backgroundColor: theme['--color-surface'],
				borderRadius: 8,
				alignItems: "center",
				elevation: 4,
			}}
		>
			<ActivityIndicator size="small" color={theme['--color-primary']} />
			{text1 && (
				<Text style={{ marginLeft: 8, color: theme['--color-onSurface'] }}>
					{text1}
				</Text>
			)}
		</View>
	);
}
