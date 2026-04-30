import React from 'react';
import { Pressable, PressableProps, Text } from 'react-native';

interface ThemeButtonProps extends PressableProps {
  mode?: 'contained' | 'outlined' | 'text' | 'contained-tonal';
  children: React.ReactNode;
}

export default function ThemeButton({ className, children, mode = 'text', disabled, ...props }: ThemeButtonProps)
{
	const getModeClasses = () => 
	{
		const baseClasses = 'rounded-lg flex-row gap-2 align-baseline items-baseline justify-center';

		switch (mode) 
		{
		case 'contained':
			return `px-4 py-2 ${baseClasses} ${disabled && "disabled"} contained ${className}`;
		case 'contained-tonal':
			return `px-4 py-2 ${baseClasses} ${disabled && "disabled"} contained-tonal ${className}`;
		case 'text':
			return `px-2 py-2 ${baseClasses} text ${className}`;
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
	
	// Wrap any plain text children in <Text> so styling applies
	const renderChildren = React.Children.map(children, (child) => {
		if (typeof child === 'string' || typeof child === 'number') {
			return (
			<Text className={`${getTextColorClass()} text-md lowercase`}>
			  {child}
			</Text>
		  );
		}
		return child; // leave React elements as-is
	});

	
	return (
		<Pressable
			className={`${getModeClasses()} ${getTextColorClass()} text-md lowercase ${className} theme-button`}
			{...props}
		>
			{
				renderChildren
			}
		</Pressable>
	);
};