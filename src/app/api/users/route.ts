import { NextResponse } from "next/server";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export async function GET() {
  try {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        createdAt: "2024-01-16T11:00:00Z",
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        createdAt: "2024-01-17T12:00:00Z",
      },
    ];

    return NextResponse.json(mockUsers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}