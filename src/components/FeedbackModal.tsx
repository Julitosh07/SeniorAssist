import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { AccessibleText } from './AccessibleText';
import { AccessibleButton } from './AccessibleButton';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing } from '../constants/theme';

export interface FeedbackModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  actionButtonText?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  actionButtonText = 'Entendido',
}) => {
  const { theme } = useTheme();

  const getHeaderStyle = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: theme.success };
      case 'error':
        return { icon: '⚠️', color: theme.error };
      case 'info':
      default:
        return { icon: 'ℹ️', color: theme.primary };
    }
  };

  const header = getHeaderStyle();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.surface,
              borderColor: header.color,
            },
          ]}
          accessibilityRole="alert"
        >
          <View style={styles.iconWrapper}>
            <AccessibleText style={styles.iconText}>
              {header.icon}
            </AccessibleText>
          </View>

          <AccessibleText
            variant="header"
            weight="heavy"
            align="center"
            color={theme.textPrimary}
            style={styles.title}
          >
            {title}
          </AccessibleText>

          <AccessibleText
            variant="bodyLarge"
            weight="medium"
            align="center"
            color={theme.textSecondary}
            style={styles.message}
          >
            {message}
          </AccessibleText>

          <View style={styles.buttonContainer}>
            <AccessibleButton
              title={actionButtonText}
              onPress={onClose}
              variant="primary"
              minHeight={56}
              accessibilityHint="Cierra este aviso y regresa a la pantalla"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  iconWrapper: {
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: 52,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
  },
});
