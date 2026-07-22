import { AutoScalingClient, DescribeAutoScalingInstancesCommand, SetDesiredCapacityCommand, TerminateInstanceInAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import { Redis } from 'ioredis';

import cors from "cors";
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "./generated/prisma/client.js";
const prisma = new PrismaClient()
// const redis = new Redis({
//     host: 'redis',  // container name, not localhost
//     port: 6379
// })
const redis = new Redis()
const app = express();

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}


// AUTH Middleware
const middleAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token = req.header('Token') as string;
        if (!token) {
            res.status(403).json({ error: "Authentication token required" })
            return;
        }
        let payload = jwt.verify(token, process.env.SECRET_KEY as string) as string;
        req.userId = payload
        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
        } else {
            res.status(500).json({ error: "Authentication failed" });
        }
    }
}
// ----------------------------------------- 

app.use(cors());
app.use(express.json());

// --------------------------------------------OAUTH2 CONFIG
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
interface GoogleTokenPayload {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
}

type machine = {
    isUsed: boolean,
    assignedAt?: Date | undefined,
    ip: string,
    instanceId: string,
    publicDnsName: string,
    projectId?: string
    projectType?: string
    projectName?: string
    lastHeartBeat?: number
    userId?: string
}


const autoScalingClient = new AutoScalingClient({
    region: "us-east-1", credentials: {
        accessKeyId: process.env.ACC_KEY_ID as string ?? "",
        secretAccessKey: process.env.SECRET_ACC_KEY as string ?? ""
    }
});
const ec2Client = new EC2Client({
    region: "us-east-1", credentials: {
        accessKeyId: process.env.ACC_KEY_ID as string ?? "",
        secretAccessKey: process.env.SECRET_ACC_KEY as string ?? ""
    }
});

function increaseDesiredCapacity(num: number) {
    const setDesiredCapCommand = new SetDesiredCapacityCommand({
        AutoScalingGroupName: process.env.AUTO_SCALING_GROUP_NAME as string ?? "",
        DesiredCapacity: num
    })
    autoScalingClient.send(setDesiredCapCommand)
}

const refreshedInstances = async () => {
    const describecommand = new DescribeAutoScalingInstancesCommand();
    const data = await autoScalingClient.send(describecommand)
    const vsCodeInstances = data.AutoScalingInstances?.filter((instance) => instance.AutoScalingGroupName == process.env.AUTO_SCALING_GROUP_NAME)
    const instanceIds = vsCodeInstances?.map((instance) => instance.InstanceId)
    const descInstCmd = new DescribeInstancesCommand({
        InstanceIds: instanceIds as unknown as string[]
    })
    const instanceData = await ec2Client.send(descInstCmd)
    // ****************** AI HELPED *************************
    // SUPPOSE HEALTH CHECK FAILED OF INSTANCE SO INSTANCE TERMINATED ITSELF 
    // => SO NEED TO REMOVE IT FROM ALL_MACHINES
    const activeInstanceIds = instanceData.Reservations?.map(
        (r) => r.Instances![0]?.InstanceId!
    ) ?? []
    const ALL_INSTANCES = await redis.smembers('ALL_INSTANCES')

    for (const instanceId of ALL_INSTANCES) {
        if (!activeInstanceIds.includes(instanceId)) {
            console.log(`Removing terminated instance: ${instanceId}`)
            await redis.del(`ALL_MACHINES:${instanceId!}`)
            await redis.srem(`ALL_INSTANCES`, instanceId!)
        }
    }
    // ****************** END *************************
    for (const reservation of instanceData.Reservations ?? []) {
        const instance = reservation.Instances?.[0];
        if (!instance || !instance.InstanceId) continue;

        if (instance.State?.Name === 'pending') {
            continue;
        }

        const exist = await redis.sadd('ALL_INSTANCES', instance.InstanceId)
        if (exist == 1) {
            await redis.set(`machine-${instance.InstanceId}`, instance.PublicDnsName!)
            await redis.hset(`ALL_MACHINES:${instance.InstanceId}`, {
                isUsed: false,
                publicDnsName: instance.PublicDnsName ?? "",
                instanceId: instance.InstanceId,
                ip: instance.PrivateIpAddress ?? "",
            })
        }
    }
}
refreshedInstances()


setInterval(async () => {
    await refreshedInstances()
}, 45000);



setInterval(async () => {
    const ALL_INSTANCES = await redis.smembers('ALL_INSTANCES')
    for (const instanceId of ALL_INSTANCES) {
        const machine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
        console.log(machine, "check")
        if (Object.keys(machine).length === 0)
            continue;
        console.log(machine, "time check")
        const isUsed = machine.isUsed === "true";
        if (!isUsed) continue;
        if (machine.lastHeartBeat === undefined) continue;
        console.log("stale")
        const lastPingTime: number = Date.now() - Number(machine!.lastHeartBeat)
        if (lastPingTime > Number(process.env.GRACE_PERIOD ?? 0)) {
            console.log("**************** DEAD MACHINE INTERVAL **************")
            await prisma.project.create({
                data: {
                    ip: machine.ip!,
                    projectId: machine.projectId!,
                    projectName: machine.projectName!,
                    projectType: machine.projectType!,
                    instanceId: machine.instanceId!,
                    isUsed: true,
                    publicDnsName: machine.publicDnsName!,
                    userId: machine.userId!,
                    s3Key: `projects/ + ${machine.userId} + / + ${machine.projectId}.zip`,
                    ...(machine.assignedAt && { assignedAt: new Date(machine.assignedAt) })
                }
            })
            fetch(`http://${machine.publicDnsName}:3001/store-project`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: machine.userId, projectId: machine.projectId })
            })
            const foundUser = await prisma.user.findFirst({
                where: {
                    id: machine.userId! as unknown as string
                }
            })
            const cacheKey = `cache:user:${machine.userId!}:projects`;
            await redis.del(cacheKey)
            const remainingProjects = foundUser?.projects.filter((elem) => elem != machine.instanceId) ?? []
            await prisma.user.update({
                where: {
                    id: machine.userId! as unknown as string
                },
                data: {
                    projects: {
                        set: remainingProjects
                    }
                }
            })
            await redis.del(`ALL_MACHINES:${instanceId!}`)
            await redis.srem(`ALL_INSTANCES`, instanceId!)
            const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({
                InstanceId: machine.instanceId,
                ShouldDecrementDesiredCapacity: true
            })
            const deleteRes = await autoScalingClient.send(termiInstancecommand)
            console.log(deleteRes, "res of terminated Machine")
        }
    }

}, 210000);


// ===================================== DEV API
app.get("/test", (req, res) => {
    console.log("**************** TEST ENDPOINT **************")
    res.json({ message: "Healthy" })
})
// ===================================== DEV API
app.get("/setDesiredCapacityTo1", (req, res) => {
    increaseDesiredCapacity(1)
    res.json({ message: "Desired capacity set to 1" })
})
// ===================================== DEV API
app.get("/verifyToken", middleAuth, (req, res) => {
    res.status(200).json({ message: "Token is valid" })
})
// ===================================== ASSIGN SUB-DOMAIN
app.get('/resolve/:instanceId', async (req, res) => {
    const dns = await redis.get(`machine-${req.params.instanceId}`)
    if (!dns) return res.status(404).send('Not found')
    res.send(dns)
})
// ===================================== HEARTBEAT
app.get("/heartBeat/:instanceId", middleAuth, async (req: Request, res: Response) => {
    console.log("**************** HEARTBEAT ENDPOINT **************")
    const { instanceId } = req.params
    try {
        const exists = await redis.exists(`ALL_MACHINES:${instanceId}`)
        if (exists === 0) {
            res.status(404).json({ error: "Machine not found" })
            return
        }
        await redis.hset(`ALL_MACHINES:${instanceId}`, { lastHeartBeat: Date.now() })
        res.json({})
        return
    } catch (error) {
        console.error('HEARTBEAT error:', error);
        res.status(500).json({ error: 'Internal server Error' });
    }
})
app.get("/verifyToken", middleAuth, (req, res) => {
    res.status(200).json({ message: "Token is valid" })
})
// ============================================================== ALL PROJECTS FOR USER
app.get("/fetchProjects", middleAuth, async (req, res) => {
    console.log("**************** FETCH PROJECTS ENDPOINT **************")
    const cacheKey = `cache:user:${req.userId!}:projects`;

    try {
        const cachedProjects = await redis.get(cacheKey);
        if (cachedProjects) {
            console.log("Cache Hit");
            return res.status(200).json(JSON.parse(cachedProjects));
        }

        console.log("Cache Miss - Fetching from DB");
        const user = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            },
        })
        const staleProjects = await prisma.project.findMany({
            where: {
                userId: req.userId as unknown as string
            }
        })
        let userProjects: any[] = [];
        for (const instanceId of user?.projects!) {
            console.log(instanceId)
            const userMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
            console.log(userMachine, "userMachine")
            if (Object.keys(userMachine).length > 0) {
                const machine = {
                    ...userMachine,
                    isUsed: userMachine.isUsed === "true",
                    lastHeartBeat: userMachine.lastHeartBeat
                        ? Number(userMachine.lastHeartBeat)
                        : undefined,
                };
                console.log(machine, "machine")
                userProjects.push(machine);
            }
        }
        userProjects = userProjects.concat(staleProjects)
        userProjects = [...userProjects]
        await redis.set(cacheKey, JSON.stringify(userProjects), 'EX', 300);
        res.status(200).json(userProjects)
        return
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
})
// ============================================================== DELETE USER
app.post("/deleteProject", middleAuth, async (req, res) => {
    try {
        console.log("**************** DELETE ENDPOINT **************")
        const machine: machine = req.body
        const foundUser = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            }
        })
        const remainingProjects = foundUser?.projects.filter((elem) => elem != machine.instanceId) ?? []
        const user = await prisma.user.update({
            where: {
                id: req.userId as unknown as string
            },
            data: {
                projects: {
                    set: remainingProjects
                }
            }
        })

        await redis.del(`ALL_MACHINES:${machine.instanceId!}`)
        await redis.srem(`ALL_INSTANCES`, machine.instanceId!)
        const cacheKey = `cache:user:${req.userId!}:projects`;
        await redis.del(cacheKey);
        const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({
            InstanceId: machine.instanceId,
            ShouldDecrementDesiredCapacity: true
        })
        await autoScalingClient.send(termiInstancecommand)
        res.status(200).json({ msg: "Project Deleted Successfully" })
        return
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }

})
// =========================================================== ASSIGN STALE
app.post("/assign-stale", middleAuth, async (req, res) => {
    console.log("************** STALE PROJECT ASSIGN *****************")
    try {
        const cacheKey = `cache:user:${req.userId!}:projects`;
        await redis.del(cacheKey);
        const machine = req.body
        if (!machine) {
            console.log("WRONG payload = " + machine)
            res.status(405).json({ msg: "Unauthorized Access" })
            return
        }
        let foundMachine;
        const ALL_INSTANCES = await redis.smembers('ALL_INSTANCES')

        for (const instanceId of ALL_INSTANCES) {
            const claimed = await redis.hsetnx(`ALL_MACHINES:${instanceId}`, "userId", req.userId!);
            if (claimed === 1) {
                const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                if (Object.keys(singleMachine).length === 0) {
                    await redis.hdel(`ALL_MACHINES:${instanceId}`, "userId")
                    continue;
                }
                foundMachine = {
                    ...singleMachine,
                    isUsed: "true",
                    projectType: machine.projectType!,
                    assignedAt: machine.assignedAt,
                    userId: req.userId!,
                    projectName: machine.projectName!,
                    projectId: machine.projectId!,
                    lastHeartBeat: Date.now(),
                    instanceId: singleMachine.instanceId,
                    publicDnsName: singleMachine.publicDnsName
                };

                await redis.hset(`ALL_MACHINES:${instanceId}`, foundMachine);
                break
            }
        }
        if (foundMachine === undefined) {
            let usedMachines = 0
            for (const instanceId of ALL_INSTANCES) {
                const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                if (Object.keys(singleMachine).length === 0)
                    continue;
                if (singleMachine.isUsed == 'true') {
                    usedMachines += 1;
                }
            }
            increaseDesiredCapacity(usedMachines + 2)
            res.status(405).json({
                message: "We're spinning up a workspace for you, please wait 30 seconds and try again"
            })
            return
        }
        fetch(`http://${foundMachine.publicDnsName}:3001/restore-project`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: machine.userId, projectId: machine.projectId })
        })
        await prisma.project.delete({
            where: {
                id: machine.id!
            }
        })
        await prisma.user.update({
            where: {
                id: req.userId as unknown as string
            },
            data: {
                projects: {
                    push: foundMachine?.instanceId as unknown as string
                }
            }
        })
        let usedMachines = 0
        for (const instanceId of ALL_INSTANCES) {
            const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
            if (Object.keys(singleMachine).length === 0)
                continue;
            if (singleMachine.isUsed == 'true') {
                usedMachines += 1;
            }
        }
        increaseDesiredCapacity(usedMachines + 2)
        res.json(foundMachine)
        return
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }

})
// ============================================================== ASSIGN PROJECT
app.get("/assign/:projectId/:projName", middleAuth, async (req, res) => {
    try {
        console.log("******************* ASSIGN METHOD ***************")

        const cacheKey = `cache:user:${req.userId!}:projects`;
        await redis.del(cacheKey);
        const { projectId, projName } = req.params;
        const { proType } = req.query
        const user = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            }
        })
        if (user?.projects!.length! >= 2) {
            res.status(405).json({
                message: "Free plan limit reached. Either delete a project or upgrade to premium.",
            })
            return
        }
        let machine;
        const ALL_INSTANCES = await redis.smembers('ALL_INSTANCES')
        console.log(ALL_INSTANCES, "ALL_MACHINES")

        for (const instanceId of ALL_INSTANCES) {
            const claimed = await redis.hsetnx(`ALL_MACHINES:${instanceId}`, "userId", req.userId!);
            if (claimed === 1) {
                const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                if (Object.keys(singleMachine).length === 0) {
                    await redis.hdel(`ALL_MACHINES:${instanceId}`, "userId")
                    continue;
                }
                machine = {
                    ...singleMachine,
                    isUsed: "true",
                    projectType: proType as string,
                    assignedAt: new Date().toISOString(),
                    userId: req.userId!,
                    lastHeartBeat: Date.now().toString(),
                    projectName: projName as string,
                    projectId: projectId as string,
                    instanceId: singleMachine.instanceId
                };

                await redis.hset(`ALL_MACHINES:${instanceId}`, machine);
                break
            }
        }
        if (machine === undefined) {
            let usedMachines = 0
            for (const instanceId of ALL_INSTANCES) {
                const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
                if (Object.keys(singleMachine).length === 0)
                    continue;
                if (singleMachine.isUsed == 'true') {
                    usedMachines += 1;
                }
            }
            increaseDesiredCapacity(usedMachines + 2)
            res.status(405).json({
                message: "We're spinning up a workspace for you, please wait 30 seconds and try again"
            })
            return
        }
        await prisma.user.update({
            where: {
                id: req.userId as unknown as string
            },
            data: {
                projects: {
                    push: machine?.instanceId as unknown as string
                }
            }
        })
        let usedMachines = 0
        for (const instanceId of ALL_INSTANCES) {
            const singleMachine = await redis.hgetall(`ALL_MACHINES:${instanceId}`)
            if (Object.keys(singleMachine).length === 0)
                continue;
            if (singleMachine.isUsed == 'true') {
                usedMachines += 1;
            }
        }
        increaseDesiredCapacity(usedMachines + 2)
        res.json(machine)
        return
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
})
// ============================================================= GOOGLE AUTH
app.post("/v0/api/google", async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID ?? "",
        });
        const payload = ticket.getPayload() as GoogleTokenPayload;
        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const { email, name, picture, sub: googleId } = payload;
        let User = await prisma.user.findFirst({ where: { email } });
        const user = {
            id: googleId,
            email,
            name,
            picture,
        };

        if (User) {

        } else {
            User = await prisma.user.create({ data: { email, password: googleId as unknown as string, projects: [] } });
        }
        const jwtToken = jwt.sign(
            User.id.toString(),
            process.env.SECRET_KEY!,
        );
        return res.status(200).json({
            success: true,
            token: jwtToken,
            user,
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
})
// ============================================================== LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                email, password
            }
        })
        if (user) {
            let token = jwt.sign(user.id.toString(), process.env.SECRET_KEY as string);
            res.status(200).json({
                msg: "Login Successfully",
                token: token,
                name: user.email
            })
            return
        } else {
            res.status(405).json({
                msg: "Incorrect email or password"
            })
            return
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
        return
    }
})
// ==================================================================== SIGNIN
app.post("/signIn", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (user) {
            res.status(405).json({
                msg: "Account already exist, Please login"
            })
            return
        } else {
            await prisma.user.create({ data: { email, password, projects: [] } })
            res.status(201).json({
                msg: "Account created successfully"
            })
            return
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
        return
    }
})

app.listen(process.env.PORT || 9092, () => {
    console.log("App is running at " + (process.env.PORT || 9092))
})