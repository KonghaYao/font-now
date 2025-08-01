import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    return new Response(
        JSON.stringify({
            code: "0",
            data: {
                baseStorageUrl: process.env.S3_PUBLIC_ENDPOINT,
                CDN_URL: process.env.CDN_URL || process.env.S3_PUBLIC_ENDPOINT,
            },
            status: "success",
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};
