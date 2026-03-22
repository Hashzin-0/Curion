export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface FetchUsersResponse {
  users: User[];
  error?: string;
}

export async function fetchUsers(): Promise<FetchUsersResponse> {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        users: [],
        error: errorData.error || `HTTP error ${response.status}`,
      };
    }

    const users = await response.json();
    return { users };
  } catch (error) {
    return {
      users: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}