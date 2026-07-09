import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import cors from 'cors';
import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";

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

app.post("/store-project", async (req: Request, res: Response) => {
    console.log("***************** AMI STORE PROJECT *************************")
    const { userId, projectId } = req.body
    console.log(userId, projectId)
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

app.post("/restore-project", async (req: Request, res: Response) => {
    const { userId, projectId } = req.body
    console.log(userId, projectId)

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