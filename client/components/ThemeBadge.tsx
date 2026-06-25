import React from "react";
import ThemeButton from "./ThemeButton";
import { ColorValue, PressableProps, processColor, Text, TextInput } from "react-native";
import ThemeText from "./ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { usePersistentTheme } from "@/context/usePersistentTheme";

interface ThemeBadgeProps extends PressableProps {
    textColor?: ColorValue;
    children: React.ReactNode;
    labelForColor?: string;
}

export const alterColorOpacity = (color: ColorValue, opacity: number): string => {
    const processed = processColor(color);
    const { themeScheme } = usePersistentTheme();

    if (processed === null || processed === undefined) {
        // Fallback if the color couldn't be parsed
        return `rgba(0, 0, 0, ${opacity})`;
    }

    // Ensure we have a numeric value for bitwise operations
    const numeric = Number(processed);
    const mixAmount = themeScheme === "light" ? 0.7 : 0.3;
    // React Native normalizes colors to 0xAARRGGBB or 0xRRGGBBAA depending on host platform,
    // but processColor yields standard integer representations.
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;

    const newR = Math.round(r * (1 - mixAmount) + 255 * mixAmount);
    const newG = Math.round(g * (1 - mixAmount) + 255 * mixAmount);
    const newB = Math.round(b * (1 - mixAmount) + 255 * mixAmount);

    return `rgba(${newR}, ${newG}, ${newB}, ${opacity})`;
};

function adaptColor(word: string): string
{
    const { themeScheme } = usePersistentTheme();
    let hash = 0;
    for (let i = 0; i < word.length; i++)
    {
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Force Hue between 0 and 360
    const hue = Math.abs(hash) % 360;

    // adjust saturation and lightness to adapt to current color theme
    const saturation = themeScheme === "light" ? 75 : 80; 
    const lightness = themeScheme === "light" ? 40 : 60; 

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function ThemeBadge({ textColor = undefined, children, className, labelForColor, ...props }: ThemeBadgeProps)
{
    const renderColor = textColor ?? (labelForColor !== undefined ? adaptColor(labelForColor) : "transparent")
    // Wrap any plain text children in <Text> so styling applies
    const renderChildren = React.Children.map(children, (child: React.ReactNode) => 
    {
        if (typeof child === 'string' || typeof child === 'number') 
        {
            return (
                <Text className={`text-md lowercase`}
                    style={{
                        color: renderColor
                    }}
                >
                    {child}
                </Text>
            );
        }

        if (!React.isValidElement(child)) return child;

        if (child.type === TextInput)
        {
            const typedChild = child as React.ReactElement<{ style?: any }>;
            return React.cloneElement(typedChild, {
                style: [{ color: renderColor }, typedChild.props?.style], // Combines original styles with your random ones
            });
        }
        else if (child.type === ThemeText)
        {
            const typedChild = child as React.ReactElement<{ style?: any }>;
            return React.cloneElement(typedChild, {
                style: [{ color: renderColor }, typedChild.props?.style], // Combines original styles with your random ones
            });
        }
        else if (child.type === Ionicons)
        {
            const typedChild = child as React.ReactElement<{ color?: any }>;
            return React.cloneElement(typedChild, {
                color: typedChild.props?.color ?? renderColor
            });
        }

        return child;
    });

    return (
        <ThemeButton
            className={`text ${className}`}
            style={({hovered}) => [{
                backgroundColor: hovered ? alterColorOpacity(renderColor, 0.4) : alterColorOpacity(renderColor, 0.1),
                borderColor: renderColor
            }]}
            {...props}
        >
            {
                renderChildren
            }
        </ThemeButton>
    );
};