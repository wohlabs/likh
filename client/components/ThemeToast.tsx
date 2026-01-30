import { View } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import LoadingToast from "./LoadingToast";

type Props = {
	text1?: string;
	text2?: string;
	variant?: "success" | "error" | "info";
};

export const toastConfig = {
	error: (props: any) => <ThemeToast {...props} variant="error" />,
	loading: (props: any) => <LoadingToast {...props} />,
};

export function ThemeToast({ text1, text2, variant = "info" }: Props) {
	const theme = useTheme();

	const indicatorColor =
		variant === "error"
			? theme.colors.error
			: variant === "success"
			? theme.colors.primary
			: theme.colors.outline;

	return (
		<Surface
			elevation={4}
			style={{
				flexDirection: "row",
				borderRadius: 12,
				overflow: "hidden", // 🔑 keeps bar clipped
				minWidth: 280,
				backgroundColor: theme.colors.surface,
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
				{text1 && <Text variant="titleMedium">{text1}</Text>}
				{text2 && <Text variant="bodyMedium">{text2}</Text>}
			</View>
		</Surface>
	);
}
