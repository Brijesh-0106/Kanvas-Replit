import { PrismaClient } from "../generated/prisma/client.js";
import { generateEmbedding } from "./embedding.service.js";
const prisma = new PrismaClient()

const TOP_K = 5;
const SIMILARITY_THRESHOLD = 0;

export const cosineSimilarity = (a: any, b: any) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

export const findRelevantFiles = async (projectId: any, prompt: any) => {
  const promptEmbedding = await generateEmbedding(prompt);

  const files = await prisma.file.findMany({ where: { projectId: projectId } });
  const rankedFiles = files!
    .map((file: any) => {
      console.log(file, "check file")
      return ({
        ...file,
        score: cosineSimilarity(promptEmbedding, file.embedding),
      })
    })
    .filter((file: any) => file.score >= SIMILARITY_THRESHOLD)
    .sort((a: any, b: any) => b.score - a.score);

  return rankedFiles.slice(0, TOP_K);
};