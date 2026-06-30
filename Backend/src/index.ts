import { AutoScalingClient, DescribeAutoScalingInstancesCommand, SetDesiredCapacityCommand } from "@aws-sdk/client-auto-scaling";
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

import cors from "cors";
import 'dotenv/config';
import express from "express";
import { PrismaClient } from "./generated/prisma/client";
const prisma = new PrismaClient()
const app = express();

app.use(cors());
app.use(express.json());

type machine = {
    isUsed: Boolean,
    assignedAt?: Date,
    ip: string,
    id: string,
    publicDnsName: string,
    assignedProjectId?: string
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
    console.log(ALL_MACHINES, " ---- ALL_MACHINES Before")
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
    console.log(ALL_MACHINES, " ---- ALL_MACHINES After")
}
// refreshedInstances()


// setInterval(() => {
//     console.log(refreshedInstances(), "refershed instance with"
//         + " describeautoscallingInstance at max returns 50");
// }, 10000);


app.get("/setDesiredCapacityTo1", (req, res) => {
    increaseDesiredCapacity(1)
    res.json({ message: "Desired capacity set to 1" })
})

// Assign project on project Select
app.get("/assign/:projectId", (req, res) => {
    const { projectId } = req.params;
    const { type } = req.query
    console.log(type, "type")
    console.log(projectId, "projectID")

    let machine;
    for (let i = 0; i < ALL_MACHINES.length; i++) {
        if (!ALL_MACHINES[i]!.isUsed) {
            machine = ALL_MACHINES[i];
            ALL_MACHINES[i]!.isUsed = true;
            ALL_MACHINES[i]!.assignedAt = new Date();
            ALL_MACHINES[i]!.assignedProjectId = projectId as unknown as string;
            break;
        }
    }
    increaseDesiredCapacity(ALL_MACHINES.length + 1)
    res.json(machine)
    return
})
// ============================================================== LOGIN
app.get("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password, "email and password")
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email, Password: password
            }
        })
        if (user) {
            res.status(200).json({
                msg: "Login Successfully"
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
app.get("/signIn", async (req, res) => {
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
            await prisma.user.create({ data: { email, Password: password, projects: [] } })
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