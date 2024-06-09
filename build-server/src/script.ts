// build the cloned repo present in /home/app/output
import dotenv from 'dotenv'
dotenv.config()

import { exec } from "child_process"
import path from "path"
import { getFilePaths } from "./utils/getFilePaths"
import { uploadFilesToS3 } from './utils/uploadFilesToS3'
import {Redis} from "ioredis"

const PROJECT_ID = process.env.PROJECT_ID
const publisher = new Redis(process.env.REDIS_URI!)
console.log(process.env.REDIS_URI)

function logPublish(log:String) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log))
}

async function init(){
    console.log('Building...')
    logPublish('Build Started')
    const outDir = path.join(__dirname, 'output')
    const p = exec(`cd ${outDir} && npm install && npm run build`)
    if (p.stdout) {
        p.stdout.on('data', (data) => {
            console.log(data.toString());
            logPublish(`${data.toString()}`);
        });

        p.stdout.on('error', (data) => {
            console.log(data.toString());
            logPublish(`ERROR: ${data.toString()}`);
        });
    }

    p.on('close', async (code) => {
        console.log('Build Complete');
        logPublish('Build Complete');

        const distFolder = path.join(__dirname, 'output', 'dist');
        console.log(distFolder);
        const allFilePaths = getFilePaths(distFolder);
        console.log('All file paths:', allFilePaths);
        logPublish('Starting File Upload');
        
        try {
            await uploadFilesToS3(allFilePaths, 'vercel-project-files');
            logPublish('Files Uploaded Successfully');
        } catch (error) {
            if (error instanceof Error) {
                logPublish(`ERROR: ${error.message}`);
                console.error('File upload error:', error.message);
            } else {
                logPublish(`ERROR: ${String(error)}`);
                console.error('File upload error:', String(error));
            }
        } finally {
            // Close Redis connection and exit the process
            publisher.quit();
            process.exit(code);
        }
    });

    p.on('error', (error) => {
        logPublish(`Build Process Error: ${error.message}`);
        console.error('Build process error:', error);
        publisher.quit();
        process.exit(1);
    });
}
init()
