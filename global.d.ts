interface messageType {
  id: number;
  role: "User" | "AI";
  content: string;
}

interface chat {
  id: number;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

type Roles = "user" | "system" | "assistant" | "tool";
