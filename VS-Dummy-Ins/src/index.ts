import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import chokidar from 'chokidar';
import cors from 'cors';
import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from 'path';

console.log("check")
const watcher = chokidar.watch('/tmp/project').on('all', (event, path) => {
    if (event === 'addDir' && path === '/tmp/project') return;
    console.log(event, path);
});



function writeFileTree(tree: any, basePath: any) {
    for (const [name, node] of Object.entries(tree)) {
        let fullPath = path.join(basePath, name);
        let newNode = node as unknown as any
        if (newNode.file) {
            // It's a file — write contents to disk
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, newNode.file.contents, 'utf-8');
            console.log(`Written: ${fullPath}`);
        } else {
            // It's a directory — recurse into it
            fs.mkdirSync(fullPath, { recursive: true });
            writeFileTree(node, fullPath);
        }
    }
}

let currProjectId: String
const app = express();

app.use(express.json())
app.use(cors())

const client = new S3Client({
    region: "us-east-1", credentials: {
        accessKeyId: process.env.ACC_KEY_ID as unknown as string,
        secretAccessKey: process.env.SECRET_ACC_KEY as unknown as string
    }
});

app.get("/test", async (req: Request, res: Response) => {
    res.json({
        msg: "Working"
    })
})

watcher
    .on('add', (fullPath) => {
        console.log(`File ${fullPath} has been added`)
        const trimmedPath = fullPath.replace(/\/tmp\/project\//gi, "").trim();
        console.log(`trimmedPath`, trimmedPath)
        // const dirPath = trimmedPath.split('/')
        const dir = path.dirname(trimmedPath);   // "/src/comp1"
        const file = path.basename(trimmedPath);  // "index.js"

        console.log(`dirPath`, dir)
        console.log(`file`, file)
        fetch(`http://54.90.126.40:9092/createFile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: dir, projectId: currProjectId, fileName: file })
        })
    })
    .on('change', (path) => console.log(`File ${path} has been changed`))
    .on('unlink', (fullPath) => {
        console.log(`file ${fullPath} has been removed`)
        const trimmedPath = fullPath.replace(/\/tmp\/project\//gi, "").trim();
        console.log(`trimmedPath`, trimmedPath)
        fetch(`http://54.90.126.40:9092/deleteNode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: trimmedPath, projectId: currProjectId })
        })
    })
    .on('addDir', (fullPath) => {
        console.log(`Directory ${fullPath} has been added`)
        const trimmedPath = fullPath.replace(/\/tmp\/project\//gi, "").trim();
        console.log(`trimmedPath`, trimmedPath)
        // const dirPath = trimmedPath.split('/')
        const dir = path.dirname(trimmedPath);   // "/src/comp1"
        const file = path.basename(trimmedPath);  // "index.js"

        console.log(`dirPath`, dir)
        console.log(`file`, file)
        fetch(`http://54.90.126.40:9092/createFolder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: dir, projectId: currProjectId, folderName: file })
        })
    })
    .on('unlinkDir', (fullPath) => {
        console.log(`folder ${fullPath} has been removed`)
        const trimmedPath = fullPath.replace(/\/tmp\/project\//gi, "").trim();
        console.log(`trimmedPath`, trimmedPath)
        fetch(`http://54.90.126.40:9092/deleteNode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: trimmedPath, projectId: currProjectId })
        })
    })
    .on('error', (error) => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'))

// ======================== REGISTER PROJECT =====================
app.get(`/register-project/:projectId`, (req, res) => {
    const projectId = req.params.projectId
    console.log(projectId, "projectdId");
    currProjectId = projectId;
    res.json({ msg: "project registered" })
})

// ======================== UPDATE FILES =====================
app.post("/update-files", async (req: Request, res: Response) => {
    console.log("***************** AMI STORE PROJECT *************************")
    try {
        const { mergedFileTree } = req.body
        const PROJECT_ROOT = '/tmp/project'; // → /tmp/project ✅
        console.log(mergedFileTree, "check mergedFileTree");
        writeFileTree(mergedFileTree, PROJECT_ROOT)
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})
// ======================== STORE ZIP =====================
app.post("/store-project", async (req: Request, res: Response) => {
    console.log("***************** AMI STORE PROJECT *************************")
    const { userId, projectId } = req.body
    console.log(userId, projectId, "check projectId in parasite")
    // zip the project
    execSync("cd /tmp && zip -r /tmp/project-backup.zip project")
    // read zip file
    const fileBuffer = fs.readFileSync("/tmp/project-backup.zip")

    const saveCmd = new PutObjectCommand(
        {
            Body: fileBuffer,
            Bucket: process.env.BUCKET_NAME,
            Key: `projects/ + ${userId} + / + ${projectId}.zip`
        }
    )

    await client.send(saveCmd)
    res.json({ msg: "saved" })
})

// ======================== RESTORE ZIP => NEW MACHINE =====================
app.post("/restore-project", async (req: Request, res: Response) => {
    const { userId, projectId } = req.body
    console.log(userId, projectId, "check projectId in parasite")

    console.log(`projects/ + ${userId} + / + ${projectId}.zip`, "key")
    // download from S3
    const response = await client.send(new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `projects/ + ${userId} + / + ${projectId}.zip`
    }))

    console.log(response, "res")
    // write zip to disk
    fs.writeFileSync("/tmp/project-backup.zip", await response.Body!.transformToByteArray())

    // unzip
    execSync("unzip -o /tmp/project-backup.zip -d /tmp")

    res.json({ msg: "restored" })
})

app.listen(process.env.PORT, () => {
    console.log("express backend in machine is running on " + process.env.PORT)
})