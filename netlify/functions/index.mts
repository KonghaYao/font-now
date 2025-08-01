import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    return new Response(
        JSON.stringify({
            code: "0",
            data: {
                baseStorageUrl: process.env.S3_ENDPOINT,
                CDN_URL: process.env.CDN_URL,
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
