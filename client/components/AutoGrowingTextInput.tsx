import React, { useRef, useState } from "react";
import { StyleProp, StyleSheet, TextStyle, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { Props } from "react-native-paper/lib/typescript/components/TextInput/TextInput";

// this is a PATCH solution for TextInput to handle autogrowing size
const AutoGrowingTextInput = ({
	value = "",
	onChangeText,
	style,
	minHeight = 50,
	...props
}: Props & {
	value: string,
	onChangeText: any;
	stylel?: StyleProp<TextStyle>,
	minHeight?: number
}) => {
	const [height, setHeight] = useState(minHeight);
	const [selection, setSelection] = useState({start: 0, end: 0});
	const theme = useTheme();
	
	const inputRef = useRef(null);

	function normalizeText(text: string)
	{
		if (text.endsWith('\n'))
		{
			return text + ' ';
		}
		return text;
	}

	return (
		<View>
			{/* Visible TextInput */}
			<TextInput
				{...props}
				ref={inputRef}
				multiline
				value={value}
				onChangeText={onChangeText}
				autoFocus
				selection={selection}
				onFocus={() => setSelection({ start: value.length, end: value.length })}
				contentStyle={[ styles.defaultStyling, { minHeight: Math.max(height, minHeight),  ...theme.fonts.bodyMedium }]}
				onContentSizeChange={(e) => {
					const newHeight = e.nativeEvent.contentSize.height;
					if (newHeight !== height)
					{
						setHeight(newHeight);
					}
				}}
				mode="outlined"
				scrollEnabled={false}
			/>

			{/* Hidden Text clone for measurement */}
			<Text
				style={[styles.hiddenText, styles.defaultStyling, {...theme.fonts.bodyMedium}]}
				onLayout={(e) => {
					const newHeight = e.nativeEvent.layout.height;
					if (newHeight !== height)
					{
						setHeight(newHeight);
					}
				}}
			>
				{normalizeText(value) || " "}
			</Text>
		</View>
	);
};

export default AutoGrowingTextInput;

const styles = StyleSheet.create({
	defaultStyling: {
		paddingInline: 20,
		padding: 0,
		margin: 0,
		width: '100%'
	},
	hiddenText: {
		position: "absolute",
		opacity: 0,
		zIndex: -1,
		left: 0,
		top: 0,
		width: '100%'
	},
});
