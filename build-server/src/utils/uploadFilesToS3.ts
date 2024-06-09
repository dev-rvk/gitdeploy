import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { Redis } from 'ioredis'


// console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
// console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
// console.log("AWS_REGION:", process.env.AWS_REGION);

const PROJECT_ID = process.env.PROJECT_ID
const publisher = new Redis(process.env.REDIS_URI!.toString())

function logPublish(log:String) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log))
}

// Configure AWS with your access and secret key.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

interface UploadParams {
  Bucket: string;
  Key: string;
  Body: fs.ReadStream;
  ContentType: string;
}

const uploadFile = async (filePath: string, bucketName: string, objectKey: string) => {
  const fileContent = fs.createReadStream(filePath);
  
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params: UploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: fileContent,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    console.log(`Success: ${filePath}`);
  } catch (error) {
    console.error(`Error: ${filePath}`, error);
  }
};

export const uploadFilesToS3 = async (filePaths: string[], bucketName: string) => {
  const baseDirectory = '/home/app/dist/output/dist'; // Base directory to subtract

  for (const filePath of filePaths) {
    const relativePath = path.relative(baseDirectory, filePath); // Get relative path starting from base directory
    logPublish(`File Uploading: ${relativePath}`)
    const objectKey = `${PROJECT_ID}/${relativePath}`; // Object key includes PROJECT_ID and file name
    await uploadFile(filePath, bucketName, objectKey);
    logPublish('Done')
  }
};