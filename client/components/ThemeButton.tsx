import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemeText from './ThemeText';

interface ThemeButtonProps extends Omit<PressableProps, 'children'> {
  icon?: string;
  mode?: 'contained' | 'outlined' | 'text';
  labelStyle?: TextStyle;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function ThemeButton({
  children,
  icon,
  mode = 'contained',
  labelStyle,
  style,
  disabled = false,
  ...props
}: ThemeButtonProps) {
  const baseStyle: string = ` py-2.5 px-6 rounded-md justify-center items-center flex-row gap-2 ${disabled ? 'opacity-50' : ''}`;
  const labelColor: string = `${mode === 'contained' ? "text-onPrimary" : "text-primary"}`;

  const modeStyles = {
    contained: "bg-primary",
    outlined: "border-[2px] border-primary bg-transparent",
    text: "bg-transparent"
  };

  return (
    <Pressable
      onPress={disabled ? undefined : props.onPress}
      disabled={disabled}
      className={`${baseStyle} ${modeStyles[mode]} text-center content-center`}
      style={(state) => [typeof style === 'function' ? style(state) : style]}
      {...props}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={20}
          className={labelColor}
        />
      )}
      <ThemeText
        className={`lowercase font-bold ${mode === 'contained' ? "text-onPrimary" : "text-primary"} self-center`}
        style={[
          labelStyle,
        ]}
      >
        {children}
      </ThemeText>
    </Pressable>
  );
};