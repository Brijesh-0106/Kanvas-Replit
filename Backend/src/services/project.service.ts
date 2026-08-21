import { PrismaClient } from "../generated/prisma/client.js";
import { addFile, addFolder, deleteNode } from "../utils/fileTree.js";
const prisma = new PrismaClient()

export const createFile = async ({ projectId, folderPath, fileName }: { projectId: string, folderPath: string, fileName: string }) => {
    const project = await prisma.project.findFirst({ where: { id: projectId } });

    const newFileTree = addFile(project?.fileTree || {}, folderPath, fileName);
    console.log(project?.id)
    console.log(newFileTree)
    if (project?.id) {
        await prisma.project.update({
            where: { id: project?.id },
            data: {
                fileTree: newFileTree
            }
        })

        return newFileTree;
    }
};

export const createFolder = async ({ projectId, folderPath, folderName }: { projectId: string, folderPath: string, folderName: string }) => {
    const project = await prisma.project.findFirst({ where: { id: projectId } });

    const newFileTree = addFolder(project?.fileTree || {}, folderPath, folderName);

    await prisma.project.update({
        where: { id: project?.id! },
        data: {
            fileTree: newFileTree
        }
    })

    return newFileTree;
};

export const deleteItem = async ({ projectId, path }: { projectId: string, path: string }) => {
    const project = await prisma.project.findFirst({ where: { projectId } });

    const newFileTree = deleteNode(project?.fileTree || {}, path);

    await prisma.project.update({
        where: { id: project?.id! },
        data: {
            fileTree: newFileTree
        }
    })

    return newFileTree;
};