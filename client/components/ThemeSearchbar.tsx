import React from 'react';
import { TextInput } from 'react-native';
import { Searchbar, SearchbarProps } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { usePersistentTheme, themes } from '@/context/usePersistentTheme';

export default function ThemeSearchbar({ value, onClearIconPress, clearAccessibilityLabel, iconColor, rippleColor, clearIcon, testID, ...rest }: SearchbarProps)
{
	const {themeScheme} = usePersistentTheme()
	const root = React.useRef<TextInput>(null);
	const handleClearPress = (e: any) => 
	{
		root.current?.clear();
		rest.onChangeText?.('');
		onClearIconPress?.(e);
	};
	return (
		<Searchbar
			value={value}
			right={(rightProps: { color: string; style: any; testID: string; }) =>
				value ?
					<Ionicons
						className='mx-2'
						name="close"
						size={24}
						color={themes[themeScheme]["--color-onBackground"]}
						onPress={handleClearPress}
						testID={`${testID}-clear-icon`}
						accessibilityRole="button"
						accessibilityLabel={clearAccessibilityLabel}
					/>
				 : null}
			{...rest}
		/>
	);
};