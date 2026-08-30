import { ai } from "@/lib/gemini/googleGenAi";

export const pdfEmbedding = async (text: string) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: text,
    });

    const embedding = response.embeddings?.at(0)?.values;

    if (!embedding) throw Error("No embedding");

    return embedding;
  } catch (error) {
    console.error(error);
  }
};
