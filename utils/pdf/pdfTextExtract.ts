import { extractText } from "unpdf";

export const pdfTextExtract = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  try {
    const text = await extractText(uint8);
    return text;
  } catch (error) {
    console.error("Error while extracting text from pdf", error);
  }
};
