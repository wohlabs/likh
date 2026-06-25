import React from "react";
import ThemeButton from "./ThemeButton";
import { ColorValue, PressableProps, processColor, Text, TextInput } from "react-native";
import ThemeText from "./ThemeText";
import { Ionicons } from "@expo/vector-icons";

interface ThemeBadgeProps extends PressableProps {
    textColor?: ColorValue;
    children: React.ReactNode;
    labelForColor?: string;
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

function wordToColor(word: string) : ColorValue {
    let hash = 0;
    
    // Step 1: Generate a unique hash number from the string
    for (let i = 0; i < word.length; i++) {
        // A bitwise shift creates a more varied distribution of numbers
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Step 2 & 3: Convert the hash to a 6-digit hex code
    let color = '#';
    for (let i = 0; i < 3; i++) {
        // Extract 8 bits at a time to get R, G, and B values
        const value = (hash >> (i * 8)) & 0xFF;
        // Convert to hex and pad with a leading zero if it's a single digit
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

export default function ThemeBadge({ textColor = undefined, children, className, labelForColor, ...props }: ThemeBadgeProps)
{
    const renderColor = textColor ?? (labelForColor !== undefined ? wordToColor(labelForColor) : "transparent")
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