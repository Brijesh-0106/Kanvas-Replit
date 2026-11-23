import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { execFile, execFileSync, execSync } from "child_process";
import chokidar from 'chokidar';
import cors from 'cors';
import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from 'path';
import { promisify } from "util";

let clearing = false; // mutes the watcher while we wipe
let cloning = false; // mutes the watcher while we wipe
const PROJECT_ROOT = '/tmp/kanvas';

const watcher = chokidar.watch('/tmp/kanvas').on('all', (event, path) => {
    if (event === 'addDir' && path === '/tmp/kanvas') return;
});

let timeout: any = null
watcher
    .on('add', (fullPath) => {          // == NEW FILE ==
        if (clearing || cloning) return;
        const trimmedPath = fullPath.replace(/\/tmp\/kanvas\//gi, "").trim();
        const dir = path.dirname(trimmedPath);   // "/src/comp1"
        const file = path.basename(trimmedPath);  // "index.js"

        fetch(`https://kanvas.advertises.co.in/api/createFile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: dir, projectId: currProjectId, fileName: file })
        })
    })
    .on('change', (path) => {       // -- FILE CHANGE ==
        if (clearing || cloning) return;
        if (timeout)
            clearTimeout(timeout)
        timeout = setTimeout(async () => {

            const files = folderToJson("/tmp/kanvas");
            try {
                fetch(`https://kanvas.advertises.co.in/api/updateFiles`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileTree: files, projectId: currProjectId })
                })
            } catch (error) {
                console.error(error);
            }
        }, 500);
    })
    .on('unlink', (fullPath) => {       // -- FILE DELETE ==
        if (clearing || cloning) return;
        const trimmedPath = fullPath.replace(/\/tmp\/kanvas\//gi, "").trim();
        fetch(`https://kanvas.advertises.co.in/api/deleteNode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: trimmedPath, projectId: currProjectId })
        })
    })
    .on('addDir', (fullPath) => {       // -- NEW FOLDER ==
        if (clearing || cloning) return;
        const trimmedPath = fullPath.replace(/\/tmp\/kanvas\//gi, "").trim();
        const dir = path.dirname(trimmedPath);   // "/src/comp1"
        const newFolder = path.basename(trimmedPath);  // "index.js"
        fetch(`https://kanvas.advertises.co.in/api/createFolder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: dir, projectId: currProjectId, folderName: newFolder })
        })
    })
    .on('unlinkDir', (fullPath) => {
        if (clearing || cloning) return;
        console.log(`folder ${fullPath} has been removed`)
        const trimmedPath = fullPath.replace(/\/tmp\/kanvas\//gi, "").trim();
        console.log(`trimmedPath`, trimmedPath)
        fetch(`https://kanvas.advertises.co.in/api/deleteNode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath: trimmedPath, projectId: currProjectId })
        })
    })
    .on('ready', () => console.log('Initial scan complete. Ready for changes'))

function folderToJson(dirPath: any) {
    const result: any = {};
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const IGNORE = new Set(['.git', 'node_modules', 'dist']);

    for (const entry of entries) {
        if (IGNORE.has(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            result[entry.name] = folderToJson(fullPath); // directory → recurse
        } else {
            result[entry.name] = {
                file: {
                    contents: fs.readFileSync(fullPath, 'utf-8') // ✅ WebContainer format
                }
            };
        }
    }

    return result;
}

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
const run = promisify(execFile);

app.use(express.json())
app.use(cors())
// ============================================================== HELPER ====================================
const AUTHOR_NAME = process.env.GIT_AUTHOR_NAME ?? "Kanvas";
const WORKSPACE = process.env.WORKSPACE_DIR ?? "/tmp/kanvas";   // ← set to your real project dir
const AUTHOR_EMAIL = process.env.GIT_AUTHOR_EMAIL ?? "noreply@kanvas.advertises.co.in";
run("git", ["config", "--global", "--replace-all", "safe.directory", WORKSPACE]).catch(() => { });

function git(args: string[], token?: string) {
    const env: NodeJS.ProcessEnv = {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",                       // never hang waiting for a password
        GIT_AUTHOR_NAME: AUTHOR_NAME,
        GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
        GIT_COMMITTER_NAME: AUTHOR_NAME,
        GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
    };
    if (token) {
        // the token lives only in the child's environment, so it never appears in `ps` or error messages
        const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
        env.GIT_CONFIG_COUNT = "1";
        env.GIT_CONFIG_KEY_0 = "http.extraheader";
        env.GIT_CONFIG_VALUE_0 = `Authorization: Basic ${basic}`;
    }
    return run("git", args, { cwd: WORKSPACE, env, timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
}

const client = new S3Client({
    region: "us-east-1", credentials: {
        accessKeyId: process.env.ACC_KEY_ID as unknown as string,
        secretAccessKey: process.env.SECRET_ACC_KEY as unknown as string
    }
});

// =========================== HEALTH TEST =======================
app.get("/test", async (req: Request, res: Response) => {
    res.json({ msg: "Working" })
})

// ======================== REGISTER PROJECT =====================
app.get(`/register-project/:projectId`, (req, res) => {
    currProjectId = req.params.projectId
    res.json({ msg: "project registered" })
})

app.get(`/clean-machine`, (req, res) => {
    console.log("\n\n===================== CLEAN MACHINE ======================")
    clearing = true;
    try {
        for (const entry of fs.readdirSync(PROJECT_ROOT)) {   // includes dotfiles like .git
            fs.rmSync(path.join(PROJECT_ROOT, entry), { recursive: true, force: true });
        }
        currProjectId = '';
        res.json({ success: true });
    } catch (e) {
        console.error('clear failed:', e);
        res.status(500).json({ success: false });
    } finally {
        setTimeout(() => { clearing = false; }, 1000); // let chokidar drain its unlink events
    }
    res.json({ msg: "Machine Cleaned" })
})

// =========================== PUSH CODE ===============================
app.post("/git-push", async (req: Request, res: Response) => {
    console.log("\n\n====================== PUSH  CODE ========================")
    try {
        const { token, branch, message, openPr } = req.body;
        const targetBranch = branch || "kanvas/update";
        const commitMsg = message || "Update from Kanvas";
        // 1. Check if git status has any changes
        const status = await git(["status", "--porcelain"]);
        if (!status.stdout.trim()) {
            return res.json({ status: "up_to_date" });
        }
        // 2. Switch to / create branch
        await git(["checkout", "-B", targetBranch]);
        // 3. Stage & Commit
        await git(["add", "-A"]);
        await git(["commit", "-m", commitMsg]);
        // 4. Push to remote with token in header
        await git(["push", "-u", "origin", targetBranch, "--force"], token);
        // 5. Get latest commit hash
        const rev = await git(["rev-parse", "--short", "HEAD"]);
        const commitHash = rev.stdout.trim();
        res.json({
            status: "pushed",
            commit: commitHash,
            branch: targetBranch
        });
    } catch (err: any) {
        console.error("git-push error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
})
// ========================= CREATE REPO & REGISTER PROJECT ============
app.post("/git-clone", async (req: Request, res: Response) => {
    console.log("\n\n==================== Clone & Register ====================")
    cloning = true;
    try {
        const { token, fullName, projectId, userName, userEmail } = req.body
        currProjectId = projectId;
        for (const e of fs.readdirSync(PROJECT_ROOT)) {
            fs.rmSync(path.join(PROJECT_ROOT, e), { recursive: true, force: true });
        }
        const basic = Buffer.from(`x-access-token:${token}`).toString('base64');
        execFileSync('git', [
            '-c', `http.extraheader=Authorization: Basic ${basic}`,
            '-c', `safe.directory=${PROJECT_ROOT}`,
            'clone', `https://github.com/${fullName}.git`, '.',
        ], { cwd: PROJECT_ROOT, stdio: 'pipe' });
        git(["config", "user.name", userName]);
        git(["config", "user.email", userEmail]);
        const files = folderToJson("/tmp/kanvas");
        await fetch(`https://kanvas.advertises.co.in/api/updateFiles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileTree: files, projectId: currProjectId })
        })
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    } finally {
        setTimeout(() => { cloning = false; }, 800);
    }
})

// ======================== UPDATE FILES =====================
app.post("/update-files", async (req: Request, res: Response) => {
    console.log("***************** UPDATE ACC TO AI *************************")
    try {
        const { mergedFileTree } = req.body
        const PROJECT_ROOT = '/tmp/kanvas';
        writeFileTree(mergedFileTree, PROJECT_ROOT)
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})

// ======================== STORE ZIP =====================
app.post("/store-project", async (req: Request, res: Response) => {
    console.log("***************** S3 STORE PROJECT *************************")
    const { userId, projectId } = req.body
    console.log(userId, projectId, "check projectId in parasite")
    // zip the project
    execSync("cd /tmp && zip -r /tmp/kanvas-backup.zip kanvas")
    // read zip file
    const fileBuffer = fs.readFileSync("/tmp/kanvas-backup.zip")

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
    console.log("***************** RESTORE PROJECT *************************")
    const { userId, projectId } = req.body
    console.log(userId, projectId, "check projectId in parasite")

    console.log(`projects/ + ${userId} + / + ${projectId}.zip`, "key")
    // download from S3
    const response = await client.send(new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `projects/ + ${userId} + / + ${projectId}.zip`
    }))
    // write zip to disk
    fs.writeFileSync("/tmp/kanvas-backup.zip", await response.Body!.transformToByteArray())

    // unzip
    execSync("unzip -o /tmp/kanvas-backup.zip -d /tmp")

    res.json({ msg: "restored" })
})

app.listen(process.env.PORT, () => {
    console.log("express backend in machine is running on " + process.env.PORT)
})