import dotenv from 'dotenv'

import { createServer } from "http"
import express from "express"
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { generateSlug } from "random-word-slugs"
import cors from "cors"
import { Server } from "socket.io"
import { Redis } from "ioredis"


const PORT = 9000
const IO_PORT = 9001

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config({
    path: '../.env'
})
const httpServer = createServer()

const subscriber = new Redis(process.env.REDIS_URI!.toString())
const io = new Server( httpServer, { cors : {
                    origin:'*'
                } 
})


io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', JSON.stringify({ info: `Subdomain ${channel}` }));
    })
})

// console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
// console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
// console.log("AWS_REGION:", process.env.AWS_REGION);

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})
const clusterConfig = {
    CLUSTER:'arn:aws:ecs:ap-south-1:767398145198:cluster/builder-cluster',
    TASK:'arn:aws:ecs:ap-south-1:767398145198:task-definition/builder-task'
}

app.post('/deploy', async (req, res) => {

    const {gitURL, slug} = req.body
    if (!gitURL) {
        return res.status(400).json({ status: 'error', message: 'gitURL is required' });
    }
    const projectSlug = slug ? slug : generateSlug()

    const command = new RunTaskCommand({
        cluster: clusterConfig.CLUSTER,
        taskDefinition: clusterConfig.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-0a09e20612f16272d', 'subnet-0c9fe52e4805dbba6', 'subnet-0d9c83140b12650f6'],
                securityGroups: ['sg-0ab903fe9679d6d92']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPO_URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })

    console.log(`gitURL:${gitURL}`)
    
    await ecsClient.send(command)

    return res.json({status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000`}})

})

async function redisSubscribe() {
    subscriber.psubscribe(`logs:*`, (err, count) => {
        if (err) {
            console.error('Failed to subscribe: %s', err.message)
        } else {
            console.log(`Subscribed to ${count} channels.`)
        }
    })

    subscriber.on('pmessage', (pattern, channel, message) => {
        // console.log(`Received message from channel ${channel}: ${message}`)
        const logMessage = JSON.stringify({ log: message });
        io.to(channel).emit('message', logMessage);
    })
}
redisSubscribe()

httpServer.listen(IO_PORT, () => {
    console.log(`Web Socket initialized on http://localhost:${IO_PORT}`)
})

app.listen(PORT, () => {
    console.log(`Backend Server is running on http://localhost:${PORT}`);
})