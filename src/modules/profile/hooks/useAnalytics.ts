
'use client';

import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/lib/services/database';

/**
 * @fileOverview Hook especializado para gerenciar o estado global das métricas com cache.
 */
export function useAnalytics(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile-analytics', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await DatabaseService.fetchProfileStats(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Mantém dados frescos por 5 minutos
    refetchOnWindowFocus: false,
  });
}
