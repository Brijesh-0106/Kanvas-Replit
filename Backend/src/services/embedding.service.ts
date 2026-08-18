import { pipeline } from '@xenova/transformers';
export async function generateEmbedding(text: string): Promise<number[]> {
  // Load the embedding pipeline (downloads model on first run)
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/bge-small-en-v1.5'
  );

  // Generate embedding
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true
  });

  // Convert to regular array
  return Array.from(output.data);
}
// export const generateEmbedding = async (text: string) => {
//   const response = await ai.embeddings.create({
//     model: 'llama-3.3-70b-versatile', // check current model name on Groq's docs — this changes
//     input: text,
//   });
//   console.log(response, "gen Emb")
//   return response.data[0]!.embedding;
// };