import { usePersistentTheme } from "@/context/usePersistentTheme";
import { Ionicons } from "@expo/vector-icons";
import { DimensionValue, StyleProp, View, ViewStyle } from "react-native";
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

export function ThemeDropdown(
	props: DropDownPickerProps<any> & {height?: DimensionValue, className?: string},
) 
{
	const { style, className, ...restProps } = props;
	const { theme } = usePersistentTheme();
	return <View className={className}>
		<DropDownPicker
			{...restProps}
			style={[{minWidth: 150, backgroundColor: theme['--color-surfaceVariant'], borderColor: 'transparent', borderRadius: 8}, style]}
			ArrowUpIconComponent={({style}) => <View style={style}><Ionicons name="chevron-up" color={theme['--color-onSurfaceVariant']} size={16} /></View> }
			ArrowDownIconComponent={({style}) => <View style={style}><Ionicons name="chevron-down" color={theme['--color-onSurfaceVariant']} size={16} /></View> }
			containerStyle={[{height: props.height}, props.containerStyle]}
			dropDownContainerStyle={[{backgroundColor: theme['--color-surfaceVariant'], borderColor: theme['--color-surfaceVariant'], shadowColor: theme['--color-outline'], shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.5, shadowRadius: 4, borderRadius: 8}, props.dropDownContainerStyle]}
			textStyle={[{color: theme['--color-onSurfaceVariant']}, props.textStyle]}
			listItemContainerStyle={[{backgroundColor: theme['--color-surfaceVariant'], borderColor: theme['--color-surfaceVariant']}, props.listItemContainerStyle]}
			searchable={false}
			showBadgeDot={false}
		/>
	</View>
	;
}
