import React from 'react';
import { TextInput } from 'react-native';
import { SearchbarProps, Searchbar, IconButton } from 'react-native-paper';

export default function ThemeSearchbar({ value, onClearIconPress, clearAccessibilityLabel, iconColor, rippleColor, clearIcon, theme, testID, ...rest }: SearchbarProps)
{
	const root = React.useRef<TextInput>(null);
	const handleClearPress = (e: any) => {
		root.current?.clear();
		rest.onChangeText?.('');
		onClearIconPress?.(e);
	};
	return (
		<Searchbar
			value={value}
			right={(rightProps: { color: string; style: any; testID: string; }) =>
				value ?
				<IconButton
				  borderless
				  accessibilityLabel={clearAccessibilityLabel}
				  iconColor={value ? iconColor : 'rgba(255, 255, 255, 0)'}
				  rippleColor={rippleColor}
				  onPress={handleClearPress}
				  icon={"close"}
				  testID={`${testID}-clear-icon`}
				  accessibilityRole="button"
				  theme={theme}
				/>
				 : null}
			{...rest}
		/>
	);
};