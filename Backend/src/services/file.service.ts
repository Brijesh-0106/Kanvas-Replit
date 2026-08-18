import { PrismaClient } from "../generated/prisma/client.js";
import { generateEmbedding } from "./embedding.service.js";
const prisma = new PrismaClient()

function extractFiles(node: any, currentPath = "", files: any[] = []): any[] {
  for (let [name, value] of Object.entries(node)) {
    const path = currentPath ? `${currentPath}/${name}` : name;

    if (!value) continue;
    let temp: { file: any } = value as unknown as any
    temp = temp as unknown as any
    if (temp.file) {
      files.push({
        path,
        content: temp.file.contents || "",
      });
    } else {
      extractFiles(value, path, files);
    }
  }

  return files;
}

export function mergeFileTrees(existingTree = {}, newTree: any = {}) {
  const merged: any = { ...existingTree };

  for (const key in newTree) {
    if (
      merged[key] &&
      typeof merged[key] === "object" &&
      !merged[key].file &&
      typeof newTree[key] === "object" &&
      !newTree[key].file
    ) {
      merged[key] = mergeFileTrees(merged[key], newTree[key]);
    } else {
      merged[key] = newTree[key];
    }
  }

  return merged;
}

export const indexChangedFiles = async (project: any, changedFiles: any) => {
  const files = extractFiles(changedFiles);

  for (const file of files) {
    const embedding = await generateEmbedding(file.content);
    if (typeof embedding === 'string') {
      return
    }
    console.log(embedding)
    await prisma.file.upsert({
      where: {
        projectId_path: {
          path: file.path,
          projectId: project.id
        }
      },
      update: {
        content: file.content, embedding
      },
      create: {
        content: file.content,
        embedding,
        path: file.path,
        projectId: project.id
      }
    });
  }
};

export const indexProjectFiles = async (project: any) => {
  console.log("Running initial indexing...");
  const files = extractFiles(project.fileTree);

  for (const file of files) {
    if (!file.content.trim()) continue;

    const embedding = await generateEmbedding(file.content);
    if (typeof embedding === 'string') {
      return
    }
    await prisma.file.upsert({
      where: {
        projectId_path: {
          path: file.path,
          projectId: project.id
        }
      },
      update: {
        content: file.content, embedding
      },
      create: {
        content: file.content,
        embedding,
        path: file.path,
        projectId: project.id
      }
    });
  }
};