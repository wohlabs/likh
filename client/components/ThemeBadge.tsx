import React from "react";
import ThemeButton from "./ThemeButton";
import { ColorValue, PressableProps, processColor, Text } from "react-native";

interface ThemeBadgeProps extends PressableProps {
    textColor?: ColorValue;
    children: React.ReactNode;
}

export const alterColorOpacity = (color: ColorValue, opacity: number): string => {
    const processed = processColor(color);

    if (processed === null || processed === undefined) {
        // Fallback if the color couldn't be parsed
        return `rgba(0, 0, 0, ${opacity})`;
    }

    // Ensure we have a numeric value for bitwise operations
    const numeric = Number(processed);
    const mixAmount = 0.7
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

export default function ThemeBadge({ textColor = "transparent", children, className, ...props }: ThemeBadgeProps)
{
    // Wrap any plain text children in <Text> so styling applies
    const renderChildren = React.Children.map(children, (child) => 
    {
        if (typeof child === 'string' || typeof child === 'number') 
        {
            return (
                <Text className={`text-md lowercase`}
                    style={{
                        color: textColor
                    }}
                >
                    {child}
                </Text>
            );
        }
        return child; // leave React elements as-is
    });

    return (
        <ThemeButton
            className={`text ${className}`}
            style={({hovered}) => [{
                backgroundColor: hovered ? alterColorOpacity(textColor, 0.4) : alterColorOpacity(textColor, 0.1),
                borderColor: textColor
            }]}
            {...props}
        >
            {
                renderChildren
            }
        </ThemeButton>
    );
};