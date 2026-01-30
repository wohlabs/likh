import * as React from "react";
import { ScrollView, Pressable, View, LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { Menu, TextInput, useTheme } from "react-native-paper";

export type DropdownItem<T = string> = {
	label: string;
	value: T;
};

type ThemeDropdownProps<T = string> = {
	label: string;
	hideLabel?: boolean;
	value: T | null;
	onChange: (value: T) => void;
	items: DropdownItem<T>[];
	style?: StyleProp<ViewStyle>
	mode?: 'flat' | 'outlined';
};

export function ThemeDropdown<T>({
	label,
	value,
	onChange,
	items,
	style,
	hideLabel = false,
	mode = 'outlined'
}: ThemeDropdownProps<T>) {
	const [visible, setVisible] = React.useState(false);
	const [anchorWidth, setAnchorWidth] = React.useState(0);
	const theme = useTheme()

	const selectedLabel = items.find((item) => item.value === value)?.label ?? "";

	const onLayout = (e: LayoutChangeEvent) => {
		setAnchorWidth(e.nativeEvent.layout.width);
	};

	return (
		<Menu
			visible={visible}
			onDismiss={() => setVisible(false)}
			contentStyle={{ width: anchorWidth }}
			anchorPosition="bottom"
			anchor={
				<Pressable style={style} onPress={() => setVisible(true)} onLayout={onLayout}>
					<TextInput
						label={hideLabel ? undefined : label}
						value={selectedLabel}
						mode={mode}
						editable={false}
						pointerEvents="none"
						underlineColor="transparent"
						outlineStyle={{borderWidth: 2}}
						outlineColor="red"
						contentStyle={{margin: 0}}
						style={{
							borderRadius: 10,
							borderWidth: 1,
							borderTopLeftRadius: 10,
							borderTopRightRadius: 10,
							borderColor: theme.colors.outline
						}}
						right={<TextInput.Icon icon="menu-down"
							onPress={() => setVisible(true)}
						/>}
					/>
				</Pressable>
			}
		>
			<ScrollView>
				{items.map((item) => (
					<Menu.Item
						key={String(item.value)}
						title={item.label}
						style={{ width: anchorWidth }}
						onPress={() => {
							onChange(item.value);
							setVisible(false);
						}}
					/>
				))}
			</ScrollView>
		</Menu>
	);
}
