import React from 'react';
import { ButtonProps, Button } from 'react-native-paper';

export default function ThemeButton({ children, labelStyle, ...props }: ButtonProps)
{
  return (
		<Button
			labelStyle={[{textTransform: 'lowercase'}, labelStyle]}
			{...props}
		>
			{children}
		</Button>
  );
};