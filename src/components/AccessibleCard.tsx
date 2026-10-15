import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing } from '../constants/theme';

export interface AccessibleCardProps extends ViewProps {
  elevated?: boolean;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  elevated = false,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
