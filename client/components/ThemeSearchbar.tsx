import React from 'react';
import { ActivityIndicator, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePersistentTheme } from '@/context/usePersistentTheme';

interface ThemeSearchbarProps extends TextInputProps {
	value?: string;
	onChangeText?: (text: string) => void;
	onClearIconPress?: (e: any) => void;
	placeholder?: string;
	clearAccessibilityLabel?: string;
	testID?: string;
	className?: string;
	inputClassName?: string;
	loading?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
}

export default function ThemeSearchbar({
	value = '',
	placeholder = 'Search',
	clearAccessibilityLabel = 'Clear search',
	testID = 'search',
	className,
	inputClassName,
	onChangeText,
	onClearIconPress,
	style,
	loading = false,
	...props
}: ThemeSearchbarProps) 
{
	const { theme } = usePersistentTheme();
	const inputRef = React.useRef<TextInput>(null);

	const handleClearPress = (e: any) => 
	{
		inputRef.current?.clear();
		onChangeText?.('');
		onClearIconPress?.(e);
	};

	const placeholderColor = theme['--color-onSurfaceVariant'];

	return (
		<View
			className={`flex-row items-center gap-2 px-2 py-2 rounded-lg bg-surfaceVariant pointer-events-auto ${className}`}
		>
			<Ionicons
				name="search"
				size={20}
				color={placeholderColor}
			/>
			<TextInput
				ref={inputRef}
				value={value}
				placeholder={placeholder}
				placeholderTextColor={placeholderColor}
				onChangeText={onChangeText}
				testID={testID}
				className={`flex-1 text-base text-onBackground px-1 ${inputClassName}`}
				accessibilityRole="search"
				{...props}
			/>
			{
				loading && <ActivityIndicator size={18} color={theme['--color-primary']} />
			}
			{value.length > 0 && (
				<Ionicons
					name="close-circle"
					size={20}
					className='text-onBackground z-30 icon-button'
					onPress={handleClearPress}
					testID={`${testID}-clear-icon`}
					accessibilityRole="button"
					accessibilityLabel={clearAccessibilityLabel}
				/>
			)}
		</View>
	);
};