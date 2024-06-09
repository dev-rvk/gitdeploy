import fs from 'fs'
import path from 'path'
import { Redis } from 'ioredis'
const PROJECT_ID = process.env.PROJECT_ID
const publisher = new Redis(process.env.REDIS_URI!.toString())

function logPublish(log:String) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log))
}
export const getFilePaths = (folderPath: string) => {
    let filePaths: string[] = []
    
    const readDirectory = (directory: string) => {
        const baseDirectory = '/home/app/dist/output/dist';
        const items = fs.readdirSync(directory);

        items.forEach((item) => {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readDirectory(fullPath);  // Recursively read subdirectories
            } else {
                filePaths.push(fullPath);  // Add file path to the array
                const relativePath = path.relative(baseDirectory, fullPath); // Get relative path starting from base directory
                logPublish(`File Generated: ${relativePath}`)
            }
        });
    };

    readDirectory(folderPath);
    return filePaths;
}