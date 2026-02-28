import React, { useState } from 'react';
import { Button, ButtonProps, Pressable, PressableProps, Text, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ThemeButtonProps extends PressableProps {
  mode?: 'contained' | 'outlined' | 'text' | 'contained-tonal';
}


export default function ThemeButton({ className, children, mode = 'contained', disabled, ...props }: ThemeButtonProps)
{
	const getModeClasses = () => 
	{
		const baseClasses = 'rounded-lg flex-row gap-2 align-baseline items-baseline';

		switch (mode) 
		{
		case 'contained':
			return `px-4 py-2 ${baseClasses} ${disabled ? 'bg-surfaceVariant' : 'bg-primary'} ${className}`;
		case 'contained-tonal':
			return `px-4 py-2 ${baseClasses} ${disabled ? 'bg-surfaceVariant' : 'bg-primaryContainer'} ${className}`;
		case 'text':
		default:
			return `px-2 py-2 ${baseClasses} ${className}`;
		}
	};

	const getTextColorClass = () => 
	{
		if (disabled) return 'text-onSurfaceVariant';
		
		switch (mode) 
		{
		case 'contained':
			return 'text-onPrimary';
		case 'contained-tonal':
			return 'text-onPrimaryContainer';
		case 'text':
		default:
			return 'text-onBackground';
		}
	};

	return (
		<Pressable
			className={`${getModeClasses()} ${getTextColorClass()} lowercase ${className}`}
			{...props}
		>
			{children}
		</Pressable>
	);
};