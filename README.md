# CausalStream Web

React + TypeScript frontend for CausalStream. This directory is an independent repository; it calls the Backend REST and WebSocket APIs, never the AI service directly.

## Run locally

Requirements: Node.js and npm. From this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to the Backend origin, for example `http://127.0.0.1:8000`. The WebSocket URL is derived from that origin. Open the URL printed by Vite (normally `http://127.0.0.1:5173`).

## Verify

```bash
npm run build
npm test -- --run
```

The LIVE page supports camera, local video and YouTube tab capture. A YouTube iframe is only a player; to send frames to AI, open the video in a separate tab and select that tab in the browser's share dialog. The Backend and AI service must already be running for LIVE analysis.

`node_modules`, build output and local `.env` files are intentionally excluded from Git. Copy `.env.example` for each deployment environment.
