import { getStore } from "@netlify/blobs";
import { v5 } from "uuid";

const createId = (fontUrl: string) => {
    const namespace = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"; // 使用 RFC 4122 中定义的 URL 命名空间 UUID
    return v5(fontUrl, namespace);
};

export default async (req: Request) => {
    const { fontUrl } = await req.json();
    const id = createId(fontUrl);

    const store = getStore(id);
    const task = await store.get(fontUrl);
    if (task) {
        return new Response(task, {
            headers: { "Content-Type": "application/json" },
        });
    } else {
        const result = {
            code: "-1",
            data: "任务未完成或不存在",
        };
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
        });
    }
};
