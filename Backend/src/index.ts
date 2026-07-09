import { AutoScalingClient, DescribeAutoScalingInstancesCommand, SetDesiredCapacityCommand, TerminateInstanceInAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

import cors from "cors";
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "./generated/prisma/client.js";
const prisma = new PrismaClient()
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
    isUsed: Boolean,
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

const ALL_MACHINES: machine[] = []

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
    for (let i = ALL_MACHINES.length - 1; i >= 0; i--) {
        if (!activeInstanceIds.includes(ALL_MACHINES[i]!.instanceId)) {
            console.log(`Removing terminated instance: ${ALL_MACHINES[i]!.instanceId}`)
            ALL_MACHINES.splice(i, 1)
        }
    }
    // ****************** END *************************
    const existingInstanceIds = ALL_MACHINES.map((machine) => machine.instanceId) ?? []
    instanceData.Reservations?.map((reservation) => {
        if (existingInstanceIds.includes(reservation.Instances![0]?.InstanceId!)) {

        } else {
            if (reservation.Instances![0]?.State?.Name == 'pending') {

            } else {
                ALL_MACHINES.push({
                    isUsed: false,
                    publicDnsName: reservation.Instances![0]?.PublicDnsName!,
                    instanceId: reservation.Instances![0]?.InstanceId!,
                    ip: reservation.Instances![0]?.PrivateIpAddress!,
                })
            }
            console.log("\n\n")
            console.log(instanceIds, "instanceIds")
            console.log("\n\n")
            console.log(ALL_MACHINES, "ref All Mac")
        }
    })
}
refreshedInstances()


setInterval(async () => {
    await refreshedInstances()
}, 10000);



setInterval(async () => {
    for (const machine of ALL_MACHINES) {
        if (!machine.isUsed) return;
        if (machine.lastHeartBeat === undefined) return;
        console.log("stale")
        const lastPingTime: any = Date.now() - (machine!.lastHeartBeat as unknown as number)
        if (lastPingTime > (process.env.GRACE_PERIOD as unknown as number ?? 0)) {
            console.log("**************** DEAD MACHINE INTERVAL **************")
            await prisma.project.create({
                data: {
                    ip: machine.ip,
                    projectId: machine.projectId!,
                    projectName: machine.projectName!,
                    projectType: machine.projectType!,
                    instanceId: machine.instanceId,
                    isUsed: true,
                    publicDnsName: machine.publicDnsName,
                    userId: machine.userId!,
                    s3Key: `projects/ + ${machine.userId} + / + ${machine.projectId}.zip`,
                    ...(machine.assignedAt && { assignedAt: machine.assignedAt })
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
            const remainingProjects = foundUser?.projects.filter((elem) => elem != machine.instanceId) ?? []
            const user = await prisma.user.update({
                where: {
                    id: machine.userId! as unknown as string
                },
                data: {
                    projects: {
                        set: remainingProjects
                    }
                }
            })
            const remInd = ALL_MACHINES.findIndex((elem) => elem.instanceId == machine.instanceId)
            if (remInd > -1) {
                ALL_MACHINES.splice(remInd, 1)
            }
            const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({
                InstanceId: machine.instanceId,
                ShouldDecrementDesiredCapacity: true
            })
            const deleteRes = await autoScalingClient.send(termiInstancecommand)
            console.log(deleteRes, "res of terminated Machine")
        }
    }

}, 60 * 1000);


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
// ===================================== HEARTBEAT
app.get("/heartBeat/:projectId", middleAuth, (req: Request, res: Response) => {
    console.log("**************** HEARTBEAT ENDPOINT **************")
    const { projectId } = req.params
    try {
        for (let i = 0; i < ALL_MACHINES.length; i++) {
            if (ALL_MACHINES[i]?.projectId == projectId) {
                ALL_MACHINES[i]!.lastHeartBeat = Date.now()
                break;
            }
        }
        res.json({})
        return
    } catch (error) {
        console.error('HEARTBEAT error:', error);
        res.status(401).json({ error: 'Internal server Error' });
    }
})
app.get("/verifyToken", middleAuth, (req, res) => {
    res.status(200).json({ message: "Token is valid" })
})
// ============================================================== ALL PROJECTS FOR USER
app.get("/fetchProjects", middleAuth, async (req, res) => {
    console.log("**************** FETCH PROJECTS ENDPOINT **************")
    try {
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
        console.log(staleProjects, "staleProject")
        let userProjects: any[] = ALL_MACHINES.filter((machine) => user?.projects.includes(machine.instanceId))
        userProjects = userProjects.concat(staleProjects)
        userProjects = [...userProjects]
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
        const remInd = ALL_MACHINES.findIndex((elem) => elem.instanceId == machine.instanceId)
        if (remInd > -1) {
            ALL_MACHINES.splice(remInd, 1)
        }
        const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({
            InstanceId: machine.instanceId,
            ShouldDecrementDesiredCapacity: true
        })
        const deleteRes = await autoScalingClient.send(termiInstancecommand)
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
        const machine: machine = req.body
        if (!machine) {
            console.log("WRONG payload = " + machine)
            res.status(405).json({ msg: "Unauthorized Access" })
            return
        }
        let foundMachine;
        console.log(ALL_MACHINES, "ALL_MACHINES")
        for (let i = 0; i < ALL_MACHINES.length; i++) {
            if (!ALL_MACHINES[i]!.isUsed) {
                foundMachine = ALL_MACHINES[i];
                console.log(machine, "machine")
                ALL_MACHINES[i]!.isUsed = true;
                ALL_MACHINES[i]!.projectType = machine.projectType!;
                ALL_MACHINES[i]!.assignedAt = machine.assignedAt;
                ALL_MACHINES[i]!.userId = req.userId!;
                ALL_MACHINES[i]!.projectName = machine.projectName!;
                ALL_MACHINES[i]!.projectId = machine.projectId!;
                break;
            }
        }
        if (foundMachine === undefined) {
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
                id: machine.instanceId
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
        const assignedProjects = ALL_MACHINES.filter((machine) => machine.isUsed)
        increaseDesiredCapacity(assignedProjects.length + 2)
        res.json(machine)
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
        const { projectId, projName } = req.params;
        const { proType } = req.query
        // JWT TO GET USERID OR EMAIL
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
        console.log(ALL_MACHINES, "ALL_MACHINES")
        for (let i = 0; i < ALL_MACHINES.length; i++) {
            if (!ALL_MACHINES[i]!.isUsed) {
                machine = ALL_MACHINES[i];
                console.log(machine, "machine")
                ALL_MACHINES[i]!.isUsed = true;
                ALL_MACHINES[i]!.projectType = proType as unknown as string;
                ALL_MACHINES[i]!.assignedAt = new Date();
                ALL_MACHINES[i]!.userId = req.userId!;
                ALL_MACHINES[i]!.projectName = projName as unknown as string
                ALL_MACHINES[i]!.projectId = projectId as unknown as string;
                break;
            }
        }
        if (machine === undefined) {
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
        const assignedProjects = ALL_MACHINES.filter((machine) => machine.isUsed)
        increaseDesiredCapacity(assignedProjects.length + 2)
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
                email: email, password
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