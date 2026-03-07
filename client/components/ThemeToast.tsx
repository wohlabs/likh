import { View, Text } from "react-native";
import { Surface } from "react-native-paper";
import LoadingToast from "./LoadingToast";
import { usePersistentTheme } from "@/context/usePersistentTheme";

type Props = {
	text1?: string;
	text2?: string;
	variant?: "success" | "error" | "info";
};

export const toastConfig = {
	error: (props: any) => <ThemeToast {...props} variant="error" />,
	loading: (props: any) => <LoadingToast {...props} />,
};

export function ThemeToast({ text1, text2, variant = "info" }: Props) 
{
	const { theme } = usePersistentTheme();

	const indicatorColor =
		variant === "error"
			? theme["--color-statusError"]
			: variant === "success"
				? theme['--color-primary']
				: theme['--color-outline'];

	return (
		<Surface
			elevation={4}
			style={{
				flexDirection: "row",
				borderRadius: 12,
				overflow: "hidden", // 🔑 keeps bar clipped
				minWidth: 280,
				backgroundColor: theme['--color-surface'],
			}}
		>
			{/* LEFT INDICATOR BAR */}
			<View
				style={{
					width: 6,
					backgroundColor: indicatorColor,
				}}
			/>

			{/* CONTENT */}
			<View style={{ padding: 16, flex: 1 }}>
				{text1 && <Text>{text1}</Text>}
				{text2 && <Text>{text2}</Text>}
			</View>
		</Surface>
	);
}
