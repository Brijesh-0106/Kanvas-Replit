import Groq from "groq-sdk";
import systemInstruction from "../config/systemInstruction.js";

const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

export const ai = new Groq({
  apiKey: process.env.GROQ_KEY,
});

/**
 * Extracts the first complete JSON object from a response.
 * Handles nested braces and braces inside strings safely.
 */
function extractBalancedJson(text: string) {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;

      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}
interface genResultProps {
  prompt: string;
  projectName: string;
  contextFiles: any[];
}
export const generateResult = async ({ prompt, projectName, contextFiles = [] }: genResultProps) => {
  console.log(process.env.GROQ_KEY, "groq key")
  const workspaceContext = `
Current Project:
${projectName}

The following files were retrieved using semantic search because they are the most relevant to the user's request.

Treat these files as the primary source of truth.

If the answer exists in these files:
- Base your answer on them.
- Preserve the existing architecture.
- Modify only the necessary files.

Relevant Files:

${contextFiles
      .map(
        (file) => `
====================================
File: ${file.path}

${file.content}
`
      )
      .join("\n")}
`;

  let response;

  try {
    const models = [PRIMARY_MODEL, FALLBACK_MODEL];

    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await ai.chat.completions.create({
            model,
            messages: [{
              role: "system",
              content: `${systemInstruction}`
            }, {
              role: "user",
              content: `${workspaceContext} User: ${prompt}`
            }]
          });
          console.log(response, "AI 1")
          break;
        } catch (error: any) {
          console.log(error, "error")
          const retryable =
            error.status === 429 ||
            error.status === 500 ||
            error.status === 503;

          if (retryable && attempt < 3) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
            );
            continue;
          }

          if (model === PRIMARY_MODEL) {
            console.warn(
              `Primary model(${PRIMARY_MODEL}) failed.Trying ${FALLBACK_MODEL}...`
            );
            break;
          }

          throw error;
        }
      }

      if (response) break;
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    if (error.status === 429) {
      return {
        text: `⚠️ Kanvas has temporarily reached its AI usage limit.

Please try again later or use another Gemini API key.`,
        fileTree: {},
        buildCommand: null,
        startCommand: null,
      };
    }

    return {
      text: `⚠️ Kanvas couldn't connect to the AI service.

Please try again in a few moments.`,
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }

  if (!response) {
    return {
      text: `⚠️ Kanvas couldn't generate a response.

Please try again in a few moments.`,
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }

  const rawText = (response.choices[0]!.message.content || "").trim();
  const finishReason = response.choices[0]?.finish_reason

  // Conversation Mode
  if (!rawText.startsWith("{") && !rawText.startsWith("```")) {
    return {
      text: rawText,
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }

  const cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const jsonString = extractBalancedJson(cleaned);

  if (!jsonString) {
    console.error(
      "AI Response Parse Error: No balanced JSON found. Finish reason:",
      finishReason
    );

    console.log("Raw AI Response:", rawText);

    return {
      text:
        finishReason === 'length'
          ? "The requested change is too large to generate in a single response. Try breaking it into smaller steps."
          : "I generated a response, but it wasn't in a format I could apply to your project. Please try again.",
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Response Parse Error:", error);
    console.log("Raw AI Response:", rawText);

    return {
      text:
        "I generated a response, but it contained malformed JSON. Please try again.",
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }
};