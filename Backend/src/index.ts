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
            userId?: String;
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
    assignedAt?: Date,
    ip: string,
    id: string,
    publicDnsName: string,
    assignedProjectId?: string
    assignedProjectType?: String
    assignedProjectName?: string
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
    console.log(instanceIds, "instanceIds")
    const descInstCmd = new DescribeInstancesCommand({
        InstanceIds: instanceIds as unknown as string[]
    })
    const instanceData = await ec2Client.send(descInstCmd)
    // console.log(ALL_MACHINES, " ---- ALL_MACHINES Before")
    const existingInstanceIds = ALL_MACHINES.map((machine) => machine.id)
    instanceData.Reservations?.map((reservation) => {
        if (existingInstanceIds.includes(reservation.Instances![0]?.InstanceId!)) {
        } else {
            ALL_MACHINES.push({
                isUsed: false,
                publicDnsName: reservation.Instances![0]?.PublicDnsName!,
                id: reservation.Instances![0]?.InstanceId!,
                ip: reservation.Instances![0]?.PrivateIpAddress!,
            })
        }
    })
    // console.log(ALL_MACHINES, " ---- ALL_MACHINES After")
}
refreshedInstances()


setInterval(() => {
    console.log(refreshedInstances(), "refershed instance with"
        + " describeautoscallingInstance at max returns 50");
}, 10000);


// ===================================== DEV API
app.get("/setDesiredCapacityTo1", (req, res) => {
    increaseDesiredCapacity(1)
    res.json({ message: "Desired capacity set to 1" })
})
// ===================================== DEV API
app.get("/verifyToken", middleAuth, (req, res) => {
    res.status(200).json({ message: "Token is valid" })
})
// ============================================================== ALL PROJECTS FOR USER
app.get("/fetchProjects", middleAuth, async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            },
        })
        console.log(user, "user")
        const userProjects = ALL_MACHINES.filter((machine) => user?.projects.includes(machine.id))
        console.log(userProjects, "userProjects")
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
        const { machine } = req.body
        console.log(machine, "machine")
        const foundUser = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            }
        })
        const remainingProjects = foundUser?.projects.filter((elem) => elem != machine.id) ?? []
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
        console.log(user, "user")
        const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({
            InstanceId: machine.id,
            ShouldDecrementDesiredCapacity: true
        })
        const deleteRes = await autoScalingClient.send(termiInstancecommand)
        console.log(deleteRes, "res of terminated Machine")
        res.status(200).json({ msg: "Project Deleted Successfully" })
        return
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }

})
// ============================================================== ASSIGN PROJECT
app.get("/assign/:projectId/:projName", middleAuth, async (req, res) => {
    try {
        const { projectId, projName } = req.params;
        console.log(req.query, "query")
        const { proType } = req.query
        console.log(proType, "type")
        console.log(projName, "name")
        console.log(projectId, "projectID")
        // JWT TO GET USERID OR EMAIL
        const user = await prisma.user.findFirst({
            where: {
                id: req.userId as unknown as string
            }
        })
        console.log(user, "user")
        if (user?.projects!.length! > 2) {
            console.log("Project Limit exceed")
            res.status(405).json({
                msg: "You have already assigned 2 projects, Please remove one project to assign new project"
            })
            return
        }
        let machine;
        console.log(ALL_MACHINES, "ALL_MACHINES")
        for (let i = 0; i < ALL_MACHINES.length; i++) {
            if (!ALL_MACHINES[i]!.isUsed) {
                machine = ALL_MACHINES[i];
                ALL_MACHINES[i]!.isUsed = true;
                ALL_MACHINES[i]!.assignedProjectType = proType as unknown as string;
                ALL_MACHINES[i]!.assignedAt = new Date();
                ALL_MACHINES[i]!.assignedProjectName = projName as unknown as string
                ALL_MACHINES[i]!.assignedProjectId = projectId as unknown as string;
                break;
            }
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: req.userId as unknown as string
            },
            data: {
                projects: {
                    push: machine?.id as unknown as string
                }
            }
        })
        console.log(updatedUser, "updatedUser")
        const unAssignedProjects = ALL_MACHINES.filter((machine) => !machine.isUsed)
        increaseDesiredCapacity(ALL_MACHINES.length + (1 - unAssignedProjects.length))
        console.log(machine, "machine")
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
        console.log("Google auth picture:", picture);
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
    console.log(email, password, "email and password")
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email, password
            }
        })
        console.log(user, "user")
        if (user) {
            console.log(process.env.SECRET_KEY, "process.env.SECRET_KEY")
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
    console.log(email, password, "email and password")
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




// ********************* USE LATER ***************************

// autoScalingClient.send(setDesiredCapCommand).then((res) => {
//     console.log("Desired capacity command ran sucessfully.")
//     console.log(res, "res")
// }).catch((err) => {
//     console.log(err, "err")
// })
// const termiInstancecommand = new TerminateInstanceInAutoScalingGroupCommand({})