import { usePersistentTheme } from "@/context/usePersistentTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { Platform, View } from "react-native";
import { Menu, MenuProps, MenuItemProps } from "react-native-paper";

interface ThemeMenuProps extends Omit<MenuProps, "contentStyle"> {
	children: ReactNode;
}

export function ThemeMenu({ children, ...props }: ThemeMenuProps) 
{
	const { theme } = usePersistentTheme();

	return (
		<Menu
			{...props}
			theme={{ colors: { onSurfaceVariant: 'green' } }}
			contentStyle={{
				backgroundColor: theme["--color-surfaceVariant"],
				borderColor: theme["--color-outline"],
			}}
		>
			{children}
		</Menu>
	);
}

interface ThemeMenuItemProps extends Omit<MenuItemProps, "titleStyle" | "contentStyle" | "leadingIcon"> {
	title: string;
	leadingIcon?: string | React.ReactNode | ((size: number) => React.ReactNode);
}

export function ThemeMenuItem({
	title,
	leadingIcon,
	...props
}: ThemeMenuItemProps) 
{
	const { theme } = usePersistentTheme();
	const renderIcon = (iconProps: { size: number; color: string }) => 
	{
		let content: React.ReactNode;

		if (typeof leadingIcon === "string") 
		{
			content = (
				<MaterialCommunityIcons 
					name={leadingIcon as any} 
					color={props.rippleColor ?? props.disabled ? 'var(--color-onDisabledBackground)' : 'var(--color-onSurfaceVariant)'} 
					// Using iconProps.size ensures it stays consistent with RNP
					size={iconProps.size} 
					disabled={props.disabled}
				/>
			);
		}
		else if (typeof leadingIcon === "function")
		{
			content = leadingIcon(iconProps.size);
		}
		else if (leadingIcon == null || leadingIcon == undefined)
		{
			console.log(leadingIcon)
			return null
		}
		else
		{
			content = leadingIcon;
		}

		// The Fix: Wrap in a container to ensure centering
		return (
			<View style={{ 
				width: iconProps.size, 
				height: iconProps.size, 
				justifyContent: 'center', 
				alignItems: 'center' 
			}}>
				{content}
			</View>
		);
	};
	return (
		<Menu.Item
			{...props}
			title={title}
			leadingIcon={leadingIcon == undefined || leadingIcon == null ? undefined : renderIcon }
			rippleColor={props.rippleColor ?? Platform.OS === "ios" ? undefined : theme["--color-onSurfaceVariant"] + "20"}
			titleStyle={{
				color: props.disabled ? "var(--color-onDisabledBackground)" : "var(--color-onSurfaceVariant)",
				fontSize: 14,
			}}
		/>
	);
}
