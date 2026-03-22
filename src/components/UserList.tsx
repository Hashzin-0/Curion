'use client';

import { useUser } from '@/hooks/useUser';

export function UserList() {
  const { users, isLoading, error, refetch } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No users found</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <ul className="space-y-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow"
          >
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;