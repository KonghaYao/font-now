# Font Now（免费公益字体 CDN）

[在线网站](https://font-now.netlify.app/)：上传你的字体到我们的 CDN 中，直接通过链接获取

这是一个基于 Netlify Functions 的公益项目，与 `cn-font-split` 及中文网字计划同属一个组织，专注于中文字体的分割和处理，并提供字体 CDN 服务。它能够接收字体文件 URL，在后台进行字体分割，并将结果存储到 S3 兼容的对象存储中，同时提供状态查询接口供前端进行轮询。

## 技术栈

-   **函数**: Netlify Functions (用于后台任务处理和状态查询)
-   **数据存储**: Netlify Blobs (用于存储任务状态和结果)
-   **对象存储**: S3 兼容存储 (用于存储分割后的字体文件)
-   **字体处理**: `cn-font-split` (Wasm 版本)

## 项目结构

-   `netlify/functions/`: 包含后端 Netlify Functions。
    -   `split-background/index.mts`: 后台字体分割处理函数。接收字体 URL，下载字体，使用 `cn-font-split` 进行分割，并将最终结果（包括分割后的字体文件链接）存储到 S3。同时，它会将任务状态更新到 Netlify Blobs。
    -   `split-check/index.mts`: 任务状态检查函数。用于前端轮询查询字体分割任务的状态。它会从 Netlify Blobs 中获取任务状态，如果任务正在进行中或不存在，则返回 `processing` 状态，以便前端继续轮询。如果任务完成或失败，则返回相应的结果和状态。
-   `public/index.html`: 前端界面，负责上传字体 URL，调用 Netlify Functions，并显示处理进度和结果。

## 环境配置 (S3)

项目依赖以下 S3 相关的环境变量。请在你的部署环境中设置它们（例如，在 Netlify 中配置环境变量）。

```sh
S3_ACCESS_KEY_ID="你的 S3 访问密钥 ID"
S3_SECRET_ACCESS_KEY="你的 S3 秘密访问密钥"
S3_REGION="你的 S3 区域，例如 oss-cn-shenzhen"
S3_ENDPOINT="你的 S3 端点 URL，例如 https://s3.oss-cn-shenzhen.aliyuncs.com"
S3_BUCKET_NAME="你的 S3 存储桶名称，例如 chinese-fonts"
S3_PUBLIC_ENDPOINT="你的 S3 存储桶公共访问点 URL，例如 https://chinese-fonts.oss-cn-shenzhen.aliyuncs.com"
CDN_URL="你的 CDN URL，用于访问处理后的字体文件，没有可不填，例如 https://ik.imagekit.io/fontnow"
```

-   my-bucket (public)
    -   `/font` : 在 S3 中用于存储分割后的字体文件和相关的 CSS/JSON 结果。
    -   `/origin-font`: 在 S3 中用于存储原始上传的字体文件 (如果适用)。

## 安装与运行

1.  **克隆仓库**:
    ```bash
    git clone [你的仓库地址]
    cd [你的项目目录]
    ```
2.  **安装依赖**:
    本项目使用 `pnpm` 进行包管理。
    ```bash
    pnpm install
    ```
3.  **运行项目**:
    本项目基于 Nitro，可以通过以下命令在本地启动开发服务器：
    ```bash
    pnpm dev
    ```
    或者在生产环境构建并启动：
    ```bash
    pnpm build
    pnpm start
    ```

## 部署

本项目可以直接部署到 Netlify。请确保在 Netlify 中配置好上述 S3 环境变量。Netlify Functions 将自动部署 `netlify/functions` 目录下的函数。
