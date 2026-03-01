import { usePersistentTheme } from "@/context/usePersistentTheme";
import { DimensionValue } from "react-native";
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

export function ThemeDropdown(
	props: DropDownPickerProps<any> & {height?: DimensionValue}

) 
{
	const { theme } = usePersistentTheme();
	return <DropDownPicker
		style={{minWidth: 150, backgroundColor: theme['--color-surfaceVariant'], borderColor: theme['--color-outline'], height: props.height}}
		containerStyle={{height: props.height}}
		dropDownContainerStyle={{borderColor: theme['--color-outline']}}
		textStyle={{color: theme['--color-onSurfaceVariant'], padding: 0}}
		listItemContainerStyle={{backgroundColor: theme['--color-surfaceVariant'], borderColor: theme['--color-outline']}}
		{...props}
	/>;
}
