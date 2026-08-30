-- createExtension
Create EXTENSION IF NOT EXISTS vector;
-- CreateTable
CREATE TABLE "Chunk" (
    "chunksId" SERIAL NOT NULL,
    "conversationId" TEXT NOT NULL,
    "chunks" TEXT NOT NULL,
    "fileURL" TEXT,
    "embedding" vector(3072) NOT NULL,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("chunksId")
);

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
