import React from 'react';
import {Text, TextProps} from 'react-native';
import "../global.css"

export default function ThemeText({ children, className, ...props }: TextProps)
{
	
	return (
		<Text
			className={`text-onBackground lowercase ${className}`}
			{...props}
		>
			{children}
		</Text>
	);
};