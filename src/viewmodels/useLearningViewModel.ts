import { useState, useEffect, useCallback } from 'react';
import { learningRepository, LessonWithProgress } from '../repositories/LearningRepository';
import { pedagogyService } from '../services/PedagogyService';
import { PedagogyProfile } from '../models';

export const useLearningViewModel = () => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pedagogyProfile, setPedagogyProfile] = useState<PedagogyProfile>(pedagogyService.getProfile());

  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await learningRepository.getAllLessons();
      setLessons(all);
      setPedagogyProfile(pedagogyService.getProfile());
    } catch (error) {
      console.error('Error al cargar lecciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const completedCount = lessons.filter(l => l.progress?.completed).length;
  const totalCount = lessons.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    lessons,
    isLoading,
    completedCount,
    totalCount,
    progressPercentage,
    pedagogyProfile,
    refreshLessons: loadLessons,
  };
};
