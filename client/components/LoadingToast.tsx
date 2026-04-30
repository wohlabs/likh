// components/LoadingToast.tsx
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingToast({ text1 }: { text1?: string }) 
{
	const { theme } = usePersistentTheme();

	return (
		<View
			className="flex-row p-3 bg-surface rounded-lg items-center shadow-lg"
		>
			<ActivityIndicator size="small" color={theme['--color-primary']} />
			{text1 && (
				<Text className="ml-2 text-onSurface">
					{text1}
				</Text>
			)}
		</View>
	);
}
