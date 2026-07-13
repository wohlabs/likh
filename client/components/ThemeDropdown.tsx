import { Ionicons } from "@expo/vector-icons";
import { DimensionValue, View } from "react-native";
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

export function ThemeDropdown(
	props: DropDownPickerProps<any> & {height?: DimensionValue, className?: string},
) 
{
	const { style, className, ...restProps } = props;
	return <View className={className}>
		<DropDownPicker
			{...restProps}
			style={[{minWidth: 150, backgroundColor: "var(--color-surfaceVariant)", borderColor: 'transparent', borderRadius: 8}, style]}
			ArrowUpIconComponent={({style}) =>
				<View style={style}>
					<Ionicons name="chevron-up" color="var(--color-onSurfaceVariant)" size={16} />
				</View> }
			ArrowDownIconComponent={({style}) =>
				<View style={style}>
					<Ionicons name="chevron-down" color="var(--color-onSurfaceVariant)" size={16} />
				</View> }
			TickIconComponent={({style}) =>
				<View style={style}>
					<Ionicons name="checkmark" color="var(--color-onSurfaceVariant)" size={16} />
				</View> }
			containerStyle={[{height: props.height}, props.containerStyle]}
			dropDownContainerStyle={[{backgroundColor: "var(--color-surfaceVariant)", borderColor: "var(--color-surfaceVariant)", shadowColor: "var(--color-outline)", shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.5, shadowRadius: 2, borderRadius: 8}, props.dropDownContainerStyle]}
			textStyle={[{color: "var(--color-onSurfaceVariant)"}, props.textStyle]}
			listItemContainerStyle={[{backgroundColor: "var(--color-surfaceVariant)", borderColor: "var(--color-surfaceVariant)"}, props.listItemContainerStyle]}
			searchable={false}
			showBadgeDot={false}
		/>
	</View>
	;
}
