# API Setup Guide

The BuildMyResume backend is powered by a robust **NestJS API**. This API serves as a secure proxy to handle generative AI tasks via Google Gemini and resume publishing via Supabase, protecting your API keys from being exposed on the frontend.

## 🚀 Quick Start

1. Navigate to the `api` directory:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` inside the `api` folder and populate the fields:
   ```bash
   # api/.env
   PORT=4000
   FRONTEND_URL=https://buildmyresume.live
   GEMINI_API_KEY=your_google_gemini_api_key
   GEMINI_MODEL=gemini-2.0-flash-lite
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Start the NestJS development server:
   ```bash
   pnpm run start:dev
   ```

## 🏗 Architecture Overview

The frontend React app makes fetch requests to this backend on `http://localhost:4000`. The NestJS controllers validate the incoming payloads (using DTOs) and route them to the respective services.

### Key Endpoints

- `POST /ai/enhance`: Analyzes field-level resume data (e.g. summaries, job descriptions) and returns a professional, ATS-friendly rewrite using Gemini.
- `POST /ai/chat`: General purpose LLM interaction for the AI resume builder.
- `POST /ai/generate`: Generates resume content based on broad contextual constraints.
- `POST /ai/extract-pdf`: Extracts text from uploaded PDF files.
- `POST /publish`: Securely saves a published resume into Supabase.
- `GET /publish/:id`: Retrieves a published resume.
- `DELETE /publish/:id`: Deletes a published resume.
- `GET /health`: Health check endpoint.

## 🔒 Security

The API includes production-grade security features:

- **Helmet** — Sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- **CORS** — Restricts requests to whitelisted origins only
- **Rate Limiting** — Global throttle of 30 requests per minute per IP via `@nestjs/throttler`
- **Body Size Limits** — Maximum 5MB request bodies to prevent abuse
- **Response Compression** — Gzip compression for all responses
- **DTO Validation** — Strict input validation with `class-validator`

Do not ship `.env` files with your source code. The `GEMINI_API_KEY` and `SUPABASE_ANON_KEY` are sensitive. The entire purpose of this NestJS API is to keep these keys secure on the server.

## 🚀 Deployment (Vercel)

Both the frontend and the NestJS API can be deployed to Vercel. Set the following environment variables in your Vercel Project Settings:

| Variable | Description |
|---|---|
| `PORT` | Server port (Vercel auto-assigns) |
| `FRONTEND_URL` | `https://buildmyresume.live` |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `GEMINI_MODEL` | e.g. `gemini-2.0-flash-lite` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SHARED_SECRET` | Must match frontend's `VITE_SHARED_SECRET` |
