'use client';

import { useState, useEffect } from 'react';
import { User, fetchUsers } from '@/services/userService';

export interface UseUserResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchUsers();

    if (result.error) {
      setError(result.error);
      setUsers([]);
    } else {
      setUsers(result.users);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchData,
  };
}