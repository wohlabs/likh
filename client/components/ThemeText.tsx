import React from 'react';
import { Text, TextProps, useTheme } from 'react-native-paper';

export default function ThemeText({ children, style, ...props }: TextProps<Text>)
{
  return (
    <Text
      style={[
        {textTransform: 'lowercase'}, // Default theme-based styles
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};