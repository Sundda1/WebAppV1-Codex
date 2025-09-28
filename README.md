# Real-Time Biometric Dashboard

A Next.js dashboard for visualising live biometric streams in the classroom and generating AI-powered recaps once a session wraps up. The application ingests readings from a desktop agent, relays them over WebSockets with Socket.IO, and renders live sparklines for galvanic skin response, heart rate, heart rate variability, and temperature.

## Features

- **WebSocket streaming** – biometric payloads posted to `/api/ingest` are broadcast to connected browsers in real time.
- **Live visualisations** – Tailwind CSS and Recharts provide responsive, low-latency charts inside reusable metric cards.
- **AI-ready insights** – the `/api/insights` endpoint accepts a session payload and returns summarised trends that can be swapped for Gemini responses in production.

## Getting started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

Open <http://localhost:3000/dashboard> to view the dashboard. The landing route `/` automatically redirects to the dashboard page.

## Data ingestion API

The desktop agent should send POST requests to `/api/ingest` with the following payload:

```json
{
  "dashboardData": {
    "gsr": [1.23],
    "hr": [82],
    "hrv": [56],
    "temp": [36.8]
  }
}
```

Each array represents the latest samples captured since the last transmission. The server clamps stored history to maintain a responsive UI and emits the merged data under the `new-data` Socket.IO event.

## WebSocket client

Clients can connect with Socket.IO using the default namespace and the `/api/socket.io` path:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { path: "/api/socket.io" });

socket.on("new-data", (payload) => {
  // handle incoming dashboardData
});
```

The dashboard automatically initialises this connection on load and updates all metric cards in real time.

## Insight generation endpoint

Send the full session buffer back to `/api/insights` to produce a textual summary:

```bash
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d '{"dashboardData": {"hr": [78,80,82], "gsr": [1.1,1.3,1.2], "hrv": [52], "temp": [36.7]}}'
```

The current implementation returns heuristic summaries so the endpoint can be swapped for Gemini-powered analysis later.

## Deployment

The project is ready for Vercel deployment. Socket.IO runs from a Next.js API route, making it compatible with a serverful or edge-hosted environment that supports WebSockets.
