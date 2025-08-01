import { getStore } from "@netlify/blobs";
import { Context } from "@netlify/functions";
import { v5 } from "uuid";
import { fontSplit, StaticWasm } from "cn-font-split/dist/wasm/index.mjs";
import { storage } from "./s3.mjs";

const createId = (fontUrl: string) => {
    const namespace = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"; // 使用 RFC 4122 中定义的 URL 命名空间 UUID
    return v5(fontUrl, namespace);
};

const wasmBuffer = await fetch(
    "https://github.dpik.top/https://github.com/KonghaYao/cn-font-split/releases/download/7.6.5/libffi-wasm32-wasip1.wasm"
).then((res) => res.arrayBuffer());

// 只需要初始化一次
const wasm = new StaticWasm(new Uint8Array(wasmBuffer));
export default async (req: Request, context: Context) => {
    const { fontUrl, forceUpdate } = await req.json();
    const id = createId(fontUrl);

    const store = getStore(id);
    try {
        const task = await store.get(fontUrl);
        // 已完成，或者已有构建任务
        if (task && !forceUpdate && JSON.parse(task).status === "success") {
            console.log("任务已存在");
            return new Response(task, {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 你的字体
        const input = await fetch(fontUrl).then((res) => res.arrayBuffer());

        const data = await fontSplit(
            {
                input: new Uint8Array(input),
                outDir: "./",
            },
            wasm.WasiHandle,
            {
                logger(str, type) {
                    console.log(str);
                },
            }
        );
        await Promise.all(
            data.map(async ({ name, data }) => {
                const content: Uint8Array =
                    typeof data === "string"
                        ? new TextEncoder().encode(data)
                        : data;
                await storage.upload(
                    process.env.S3_BUCKET_NAME,
                    "font/" + id + "/" + name,
                    content
                );
            })
        );

        const result = {
            code: "0",
            data: {
                storage_bucket: process.env.S3_BUCKET_NAME,
                storage_path: "/font/" + id + "/result.css",
            },
            status: "success",
        };
        await store.setJSON(fontUrl, result);
        return new Response(JSON.stringify(result));
    } catch (e) {
        await store.setJSON(fontUrl, {
            code: "-1",
            data: "分割失败" + e,
            status: "error",
        });
        return new Response(
            JSON.stringify({
                code: "-1",
                data: "分割失败" + e,
                status: "error",
            })
        );
    }
};
