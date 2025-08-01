import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT, // RustFS endpoint
    region: process.env.S3_REGION, // Can be any value, RustFS doesn't validate region
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for RustFS
});

class StorageClient {
    constructor(public s3Client: S3Client) {}
    async upload(bucketName: string, key: string, file: Uint8Array) {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: "application/octet-stream",
        });

        return await this.s3Client.send(command);
    }
}

// Usage
export const storage = new StorageClient(s3Client);
