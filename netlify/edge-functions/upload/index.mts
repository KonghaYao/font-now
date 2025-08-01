import { Context } from "https://edge.netlify.com";
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
export const config = { path: "/api-edge/upload" };

const sha256 = async (data: Uint8Array) => {
    const hash = await crypto.subtle.digest(
        "SHA-256",
        data.buffer as ArrayBuffer
    );
    // 转为16进制字符串
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export default async (req: Request, context: Context) => {
    const filename = new URL(req.url).searchParams.get("filename");
    const fileBuffer = await req.arrayBuffer();
    const fileExtension = filename?.split(".").pop();
    const s3Key = `${await sha256(
        new Uint8Array(fileBuffer)
    )}.${fileExtension}`;

    await storage.upload(
        process.env.S3_BUCKET_NAME,
        "origin-font/" + s3Key,
        new Uint8Array(fileBuffer)
    );
    const storage_path = "/origin-font/" + s3Key;
    return new Response(
        JSON.stringify({
            code: "0",
            data: {
                storage_bucket: process.env.S3_BUCKET_NAME,
                storage_path,
                public_url: `https://${process.env.S3_PUBLIC_ENDPOINT}${storage_path}`,
            },
        })
    );
};
