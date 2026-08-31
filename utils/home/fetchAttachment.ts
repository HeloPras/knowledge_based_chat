import { prisma } from "@/lib/prisma/client";

export const fetchAttachment = async (conversationId: string) => {
  try {
    const data = await prisma.chunk.findFirst({
      where: { conversationId: conversationId },
    });

    if (!data) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
