import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography } from '../constants/typography';
import { useTheme } from '../hooks/useTheme';

export interface AccessibleTextProps extends TextProps {
  variant?: 'caption' | 'body' | 'bodyLarge' | 'button' | 'subtitle' | 'title' | 'header' | 'hero';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  variant = 'body',
  color,
  weight = 'regular',
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  const fontSize = typography.sizes[variant];
  const lineHeight = typography.lineHeights[variant];
  const fontWeight = typography.weights[weight];
  const textColor = color || theme.textPrimary;

  return (
    <Text
      style={[
        {
          fontSize,
          lineHeight,
          fontWeight,
          color: textColor,
          fontFamily: typography.fontFamily,
          textAlign: align,
        },
        style,
      ]}
      maxFontSizeMultiplier={1.6} // Permite escalado de accesibilidad
      accessibilityRole={variant === 'header' || variant === 'title' || variant === 'hero' ? 'header' : 'text'}
      {...rest}
    >
      {children}
    </Text>
  );
};
