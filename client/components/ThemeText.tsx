import React, { forwardRef } from 'react';
import {Text, TextProps} from 'react-native';
import "../global.css"

interface ThemeTextProps extends TextProps {
	className?: string;
	children?: React.ReactNode;
	ref?: React.Ref<Text>;
}

export default function ThemeText({ children, className = "", ref, ...props }: ThemeTextProps)
{
	return (
		<Text
			ref={ref}
			className={`text-onBackground lowercase ${className}`}
			{...props}
		>
			{children}
		</Text>
	);
};