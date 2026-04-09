# 🌱 AgriAdvisor

**AgriAdvisor** is a full-stack, AI-powered agricultural assistant MVP designed to help farmers detect plant diseases quickly and reliably.

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL) paired with **Prisma ORM** for strict type safety
- **AI Integration:** Google Gemini AI (`@google/genai` using the `gemini-flash-latest` vision model)
- **Deployment Strategy:** Vercel (Serverless backend wrapper + Static Vite frontend)

## ✨ Core Features

1. **Custom Authentication:** Secure, locally-hashed password management using native MVP authentication.
2. **AI Leaf Analysis:** Upload photos of crops/plants, and the backend delegates analysis to Google Gemini's vision models to return JSON-formatted disease diagnostics, pest names, and actionable recommendations.
3. **Multi-Language Support:** Automatically triggers localized agricultural advice (English, Hindi, Telugu, Tamil).
4. **Vercel Serverless Ready:** Express wrapper configured via `api/index.ts` and `vercel.json` for 100% Vercel compatibility.

## 🛠️ Local Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/en/) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory. You must supply your Google Gemini API Key and your Prisma/Supabase postgres connection strings:

```env
APP_URL="http://localhost:3000"
GEMINI_API_KEY="YOUR_GEMINI_KEY"

# Prisma Database Connections
DATABASE_URL="postgresql://postgres.[SUPABASE_PROJECT]:[ENCODED_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[SUPABASE_PROJECT]:[ENCODED_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

### 3. Database Initialization
Update your cloud database by pushing the Prisma Schema:
```bash
npx prisma db push
```

### 4. Run the Servers
To boot up both the Vite frontend and Express backend concurrently:
```bash
npm start
```
- **Frontend** runs on: `http://localhost:3000`
- **Backend API** runs on: `http://localhost:4000`

## 🌍 Vercel Deployment

This project contains explicit pipelines to be flawlessly deployed on Vercel:
1. Ensure your Vercel Project Environment Variables contain `GEMINI_API_KEY`, `DATABASE_URL`, and `DIRECT_URL`.
2. Vercel automatically runs `npm install`. Our `postinstall: "prisma generate"` hook compiles your database schema securely.
3. The `vercel.json` file intercepts traffic and maps API calls into the `api/index.ts` serverless handler automatically