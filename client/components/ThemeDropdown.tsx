import { DimensionValue } from "react-native";
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';
import { useTheme } from "react-native-paper";

export function ThemeDropdown(
	props: DropDownPickerProps<any> & {height?: DimensionValue}

) 
{
	const theme = useTheme();
	return <DropDownPicker
		theme={theme.dark ? "DARK" : "LIGHT"}
		style={{minWidth: 150, backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, height: props.height}}
		containerStyle={{height: props.height}}
		dropDownContainerStyle={{borderColor: theme.colors.outline}}
		textStyle={{...theme.fonts.labelLarge, color: theme.colors.onSurfaceVariant, padding: 0}}
		listItemContainerStyle={{backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline}}
		{...props}
	/>;
}
