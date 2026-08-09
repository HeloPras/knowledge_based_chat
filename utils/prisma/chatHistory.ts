"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "./prismaClient";

export async function getChatHistroy() {
  const session = await auth();

  if (!session) {
    return;
  }

  const history = await prisma.conversation.findMany({
    where: {
      userId: session.user?.id,
    },
  });

  return history;
}
