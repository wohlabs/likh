import React from 'react';
import {Text, TextProps} from 'react-native';
import "../global.css"

export default function ThemeText({ children, ...props }: TextProps)
{
	return (
		<Text
			className='text-onBackground lowercase'
			{...props}
		>
			{children}
		</Text>
	);
};