import * as React from "react";
import { ScrollView, Pressable, View, LayoutChangeEvent } from "react-native";
import { Menu, TextInput } from "react-native-paper";

export type DropdownItem<T = string> = {
	label: string;
	value: T;
};

type ThemeDropdownProps<T = string> = {
	label: string;
	value: T | null;
	onChange: (value: T) => void;
	items: DropdownItem<T>[];
	mode?: 'flat' | 'outlined';
};

export function ThemeDropdown<T>({
	label,
	value,
	onChange,
	items,
	mode = 'outlined'
}: ThemeDropdownProps<T>) {
	const [visible, setVisible] = React.useState(false);
	const [anchorWidth, setAnchorWidth] = React.useState(0);

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
				<Pressable onPress={() => setVisible(true)} onLayout={onLayout}>
					<TextInput
						label={label}
						value={selectedLabel}
						mode={mode}
						editable={false}
						pointerEvents="none"
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
