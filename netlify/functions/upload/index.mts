import { Context } from "@netlify/functions";
import { storage } from "../split-background/s3.mjs";

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
