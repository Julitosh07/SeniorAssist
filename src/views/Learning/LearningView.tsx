import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../constants/theme';
import { voiceService } from '../../services/VoiceService';
import { useLearningViewModel } from '../../viewmodels/useLearningViewModel';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Learning'>;

export const LearningView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    lessons,
    isLoading,
    completedCount,
    totalCount,
    progressPercentage,
    pedagogyProfile,
    refreshLessons,
  } = useLearningViewModel();

  useFocusEffect(
    React.useCallback(() => {
      refreshLessons();
    }, [refreshLessons])
  );

  const handleStartLesson = async (lessonId: string, title: string) => {
    await voiceService.speak(`Iniciando la lección de ${title}. Practica con tranquilidad.`);
    navigation.navigate('Simulator', { lessonId });
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'whatsapp':
        return '💬';
      case 'camera':
        return '📸';
      case 'gallery':
        return '🖼️';
      case 'security':
        return '🛡️';
      case 'calls':
        return '📞';
      case 'audio':
        return '🎵';
      default:
        return '📚';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Tutor de Alfabetización" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tarjeta de Progreso Global */}
        <AccessibleCard style={[styles.progressCard, { borderColor: theme.learning }]}>
          <AccessibleText variant="title" weight="heavy" color={theme.learning}>
            🎓 Tu Progreso de Aprendizaje
          </AccessibleText>

          <AccessibleText variant="bodyLarge" weight="medium" color={theme.textPrimary} style={styles.cardText}>
            {completedCount} de {totalCount} módulos completados ({progressPercentage}%)
          </AccessibleText>

          {/* Barra de progreso de alto contraste */}
          <View style={[styles.progressBarBackground, { backgroundColor: theme.surfaceElevated }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(5, progressPercentage)}%`,
                  backgroundColor: theme.learning,
                },
              ]}
            />
          </View>

          <AccessibleText variant="body" weight="medium" color={theme.textSecondary} style={{ marginTop: spacing.sm }}>
            💡 {pedagogyProfile.feedbackMessage}
          </AccessibleText>
        </AccessibleCard>

        <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.sectionTitle}>
          Módulos Prácticos:
        </AccessibleText>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: spacing.lg }} />
        ) : (
          <View style={styles.modulesGrid}>
            {lessons.map(lesson => {
              const isCompleted = Boolean(lesson.progress?.completed);
              const icon = getModuleIcon(lesson.module);

              return (
                <AccessibleCard
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    {
                      borderColor: isCompleted ? theme.success : theme.border,
                      borderWidth: isCompleted ? 3 : 2,
                    },
                  ]}
                >
                  <View style={styles.lessonHeader}>
                    <AccessibleText variant="title" weight="heavy">
                      {icon}
                    </AccessibleText>
                    <View style={styles.lessonTitleContainer}>
                      <AccessibleText variant="title" weight="heavy" color={theme.textPrimary}>
                        {lesson.title}
                      </AccessibleText>
                      <AccessibleText
                        variant="body"
                        weight="bold"
                        color={isCompleted ? theme.success : theme.textSecondary}
                      >
                        {isCompleted
                          ? `✅ Completado (Puntaje: ${lesson.progress?.score || 100}%)`
                          : lesson.progress?.attempts && lesson.progress.attempts > 0
                          ? `⏳ En progreso (Paso ${lesson.progress.lastStepCompleted} de ${lesson.totalSteps})`
                          : `⚪ Por iniciar (${lesson.totalSteps} pasos)`}
                      </AccessibleText>
                    </View>
                  </View>

                  <AccessibleText variant="bodyLarge" color={theme.textSecondary} style={styles.lessonDescription}>
                    {lesson.description}
                  </AccessibleText>

                  <AccessibleButton
                    title={isCompleted ? '🔄 Repasar Lección' : '▶️ Comenzar Lección'}
                    subtitle="Practicar en simulador guiado paso a paso"
                    variant={isCompleted ? 'secondary' : 'learning'}
                    minHeight={76}
                    onPress={() => handleStartLesson(lesson.id, lesson.title)}
                  />
                </AccessibleCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  progressCard: {
    borderWidth: 2,
  },
  cardText: {
    marginTop: spacing.xs,
  },
  progressBarBackground: {
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9,
  },
  sectionTitle: {
    marginTop: spacing.sm,
  },
  modulesGrid: {
    gap: spacing.md,
  },
  lessonCard: {
    gap: spacing.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lessonTitleContainer: {
    flex: 1,
  },
  lessonDescription: {
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
});
