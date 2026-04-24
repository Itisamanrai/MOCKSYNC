# Deployment Guide (Vercel + Socket Server)

This project should be deployed in 2 parts:

1. Frontend (`client`) on Vercel.
2. Backend (`server`) on a Node host that supports long-lived WebSocket connections (Render, Railway, Fly.io, etc.).

Why split deployment: Socket.IO needs persistent server processes. Vercel Serverless Functions are not a good fit for a Socket.IO server.

## 1) Deploy Backend (server)

1. Push repo to GitHub.
2. Create a new web service on Render/Railway using the `server` folder.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Add environment variables:

- `PORT=3000` (or provider default)
- `NODE_ENV=production`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=1d`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4.1-mini`

6. Note your deployed backend URL, for example:

```text
https://mocksync-api.onrender.com
```

## 2) Deploy Frontend (client) to Vercel

1. In Vercel, import your GitHub repo.
2. Set **Root Directory** to `client`.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variables in Vercel project settings:

- `VITE_API_BASE_URL=https://mocksync-api.onrender.com`
- `VITE_SOCKET_URL=https://mocksync-api.onrender.com`

7. Deploy.

## 3) Local Development

Create `client/.env` from `client/.env.example` and keep values pointing to localhost:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 4) Security Checklist Before Going Live

1. Keep root `.env` ignored by Git.
2. Rotate API keys if they were ever exposed.
3. Use strong `JWT_SECRET` in production.
4. Restrict CORS to your frontend domain when you are ready.
