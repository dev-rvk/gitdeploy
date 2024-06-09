# GitDeploy

GitDeploy is a scalable deployment system that leverages AWS ECS, AWS S3, and Redis to handle multiple builds and provide real-time logs with minimal delay. This repository includes the setup for the backend server, build server, reverse proxy, and client.

## Architecture Overview

The architecture consists of the following components:

- **Client**: A Next.js application that interacts with the backend server.
- **Backend Server**: An Express server that handles API requests and uses AWS SDK for ECS and S3 interactions.
- **WebSocket Server**: Provides real-time logging using Redis.
- **Build Server**: Uses Docker to create images, build the cloned repository, and push the files to AWS S3.
- **Reverse Proxy**: Ensures minimal data transfer by directly streaming the S3 bucket URL to the user.
- **AWS Services**: ECS for scalable build handling, S3 for file storage, and Redis for log storage and retrieval.

![Architecture](/docs/architecture.svg)

## Architecture Components

### 1. Client
The client is a Next.js application that serves as the user interface. It sends `POST` request to the `/deploy ` route in the backend-server to send the github link. Also connects the the websocket server to output logs.

### 2. Backend Server
The backend server has two main components:

- **API Server**: `/deploy` route is used to manage tasks such as triggering build processes in AWS ECS.
- **WebSocket Server**: Maintains a websocket which connects to the client and subscribes to a specific channel to get logs from Redis.

### 3. Build Server
The build server is responsible for:
- Clones the repository from GitHub.
- Builds the cloned project.
- Pushes the static files generated in `/dist` to S3 bucket.

This ensures that each build is containerized, making the deployment process consistent and scalable, multiple containers can be used in case the load increases

### 4. Reverse Proxy
The reverse proxy server forwards client requests to the appropriate S3 file. 
- `<id>.<domain>.com` is fordwarded to `<S3-BASE-URL>/<id>/index.html`
- This Streaming of files directly from AWS S3 to the client, minimizing data transfer through the server.

Using a reverse proxy the user can access the deployed website using the custom sub-domain URL given by `<id>`.

### 5. Redis
Redis is used for storing and retrieving build logs. It acts as a high-throughput message broker that:
- Stores logs published by the docker container during the build process.
- The backend-server can subscribe to the specific topic to get and display the logs in real-time using websocket connection with client

## Setup and Usage

1. **Setup `.env` File**
   - Create a `.env` file in both the `backend-server` and `build-server` directories with the following parameters:
     ```plaintext
     AWS_ACCESS_KEY_ID=
     AWS_SECRET_ACCESS_KEY=
     AWS_REGION=
     REDIS_URI=
     ```
     replace with your credintials

2. **Build and Push Docker Image**
   - Navigate to the `build-server` directory:
     ```sh
     cd build-server
     docker build -t <your-image-name> .
     docker tag <your-image-name> <your-aws-ecr-repo>
     docker push <your-aws-ecr-repo>
     ```
     make sure you have 

3. **Setup AWS ECS**
   - Use the Docker image as a template for your ECS setup.

4. **Backend Server**
   - Navigate to the `backend-server` directory:
     ```sh
     cd backend-server
     npm install
     npm run build
     npm run server
     ```

5. **Reverse Proxy**
   - Navigate to the `reverse-proxy` directory:
     ```sh
     cd reverse-proxy
     npm install
     npm run build
     npm run server
     ```

6. **Client (Next.js)**
   - Navigate to the `client-nextjs` directory:
     ```sh
     cd client-nextjs
     yarn install
     yarn build
     yarn start
     ```

## Features

- **Scalability**: Utilizes AWS ECS to handle multiple builds as load increases.
- **High Throughput Logging**: Redis is used for efficient log storage and retrieval.
- **Minimal Data Transfer**: The reverse proxy directly streams the S3 bucket URL to the user.

## References

- [Piyush Garg](https://www.youtube.com/watch?v=0A_JpLYG7hM)
- [Harkirat Singh](https://www.youtube.com/watch?v=c8_tafixiAs&t=5600s)

