'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function StoreInitializer() {
  const fetchData = useStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return null;
}
