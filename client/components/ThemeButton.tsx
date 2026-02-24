import React, { useState } from 'react';
import { Pressable, PressableProps, Text, TextStyle, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ThemeButtonProps extends Omit<PressableProps, 'children'> {
  icon?: string;
  mode?: 'contained' | 'outlined' | 'text' | 'contained-tonal';
  labelStyle?: TextStyle;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function ThemeButton({
	children,
	onPress,
	mode = 'text',
	disabled = false,
	style,
	icon,
	className = '',
	labelStyle,
	textColor,
	...props
}: ThemeButtonProps) 
{
	const [pressed, setPressed] = useState(false);

	const getModeClasses = () => 
	{
		const baseClasses = 'rounded-lg flex-row items-center justify-center gap-2';

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
		if (textColor) return '';
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

	const textColorClass = getTextColorClass();
	const buttonClasses = getModeClasses();

	// Handle style as array or single value
	const flattenedStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			style={[
				{ 
					opacity: pressed ? (mode === 'text' ? 0.7 : 0.8) : 1,
				},
				flattenedStyle,
			]}
			className={buttonClasses}
			{...props}
		>
			{icon && (
				<MaterialCommunityIcons
					name={icon as any}
					size={20}
					className={textColorClass}
					style={{ color: textColor }}
				/>
			)}
			{children && (
				<Text
					style={[
						textColor ? { color: textColor } : undefined,
						labelStyle,
					]}
					className={`text-base font-medium lowercase ${textColorClass}`}
				>
					{children}
				</Text>
			)}
		</Pressable>
	);
};