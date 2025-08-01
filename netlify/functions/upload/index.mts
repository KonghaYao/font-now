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
    const formData = await req.formData();
    const file = formData.get("font") as File;

    if (!file) {
        return new Response("No font file uploaded", { status: 400 });
    }
    const fileBuffer = await file.arrayBuffer();
    const fileExtension = file.name.split(".").pop();
    const s3Key = `${await sha256(
        new Uint8Array(fileBuffer)
    )}.${fileExtension}`;

    await storage.upload(
        "font-now",
        "origin-font/" + s3Key,
        new Uint8Array(fileBuffer)
    );
    return new Response(
        JSON.stringify({
            code: "0",
            data: {
                storage_bucket: "font-now",
                storage_path: "/origin-font/" + s3Key,
            },
        })
    );
};
