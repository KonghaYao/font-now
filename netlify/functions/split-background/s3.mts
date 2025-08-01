import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

class StorageClient {
    constructor(public s3Client: S3Client) {}
    async upload(bucketName: string, key: string, file: Uint8Array) {
        // 根据 key 设定不同的 content-type
        const contentType = key.endsWith(".css")
            ? "text/css"
            : "application/octet-stream";
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: contentType,
        });

        return await this.s3Client.send(command);
    }
}

// Usage
export const storage = new StorageClient(s3Client);
