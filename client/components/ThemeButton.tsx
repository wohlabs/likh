import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

export default function ThemeButton({ children, labelStyle, ...props }: ButtonProps)
{
	return (
		<Button
			className='lowercase'
			labelStyle={[labelStyle]}
			{...props}
		>
			{children}
		</Button>
	);
};