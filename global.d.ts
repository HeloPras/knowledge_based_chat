interface messageType {
  id: number;
  role: "User" | "AI";
  content: string;
}
