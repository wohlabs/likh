import React, { useState } from "react";
import { TextInput, TextInputProps } from "react-native";

// this is a PATCH solution for TextInput to handle autogrowing size - however it does not shrink
const AutoGrowingTextInput = ({
	className,
	minHeight = 75,
	...props
}: TextInputProps & {
	className: string,
	minHeight?: number
}) => 
{
	const [height, setHeight] = useState(minHeight);
	
	return (
		<TextInput
			className={`text-md ${className}`}
			multiline
			autoFocus
			style={{height}}
			onContentSizeChange={e => setHeight(e.nativeEvent.contentSize.height)}
			scrollEnabled={false}
			{...props}
		/>
	);
};

export default AutoGrowingTextInput;