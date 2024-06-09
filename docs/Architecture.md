## Docker Containerization
Docker streamlines the development lifecycle by allowing developers to work in standardized environments using local containers which provide your applications and services.

The changes made to the base image selected are documented in the Dockerfile. The file includes exact changes command by command that are needed to setup the environment for building the project.

## AWS ECR
Amazon Elastic Container Registry (Amazon ECR) is an AWS managed container image registry service. Amazon ECR supports private repositories with resource-based permissions using AWS IAM.

Amazon ECR stores the docker image that we have built so that other aws services can use the image

## AWS ECS
Amazon Elastic Container Service (Amazon ECS) is a fully managed container orchestration service that helps you easily deploy, manage, and scale containerized applications. It is integrated with both AWS and third-party tools, such as Amazon Elastic Container Registry and Docker.

- We architect our application so that it runs in a container, like in GitDeploy we hae streamlined process of cloning a repo from the github url, building it and then upluading it to S3 bucket.

- Theen the docker image is stored in ECR, from where it is accessed
  
- Then we need to define the task definition based on the workflow that we have selected For example, we can use it to specify the image and parameters for the operating system, which containers to use, which ports to open for our application, and what data volumes to use with the containers in the task. 
- For our specific usecase we develope a command which sets up environment variables inside the docker containers which are used to send github and project id.

- After defining task definition, we deploy it as either a service or a task on a cluster. A cluster is a logical grouping of tasks or services that runs on the capacity infrastructure that is registered to a cluster.

## AWS S3
Amazon S3 is an object storage service that stores data as objects within buckets. An object is a file and any metadata that describes the file. A bucket is a container for objects.

To store your data in Amazon S3, we first create a bucket and specify a bucket name and AWS Region. Then, we upload your data to that bucket as objects in Amazon S3. Each object has a key (or key name), which is the unique identifier for the object within the bucket.

## Redis
Redis is a versatile data store used for various purposes such as a database, cache, streaming engine, message broker, and more. It supports complex data types and atomic operations, making it ideal for applications that require fast data retrieval and high-performance operations. Some common use cases for Redis include session caching, real-time analytics, job queues, leaderboards, and pub/sub messaging