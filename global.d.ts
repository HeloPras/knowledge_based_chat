interface messageType {
  id: number;
  role: "User" | "AI";
  content: string;
}

type Roles = "user" | "system" | "assistant" | "tool";
