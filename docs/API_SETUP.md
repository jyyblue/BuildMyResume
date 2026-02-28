# API Setup Guide

The BuildMyResume backend is powered by a robust **NestJS API**. This API serves as a secure proxy to handle generative AI tasks via Google Gemini, protecting your API keys from being exposed on the frontend client.

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
   GEMINI_API_KEY=your_google_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Start the NestJS development server:
   ```bash
   pnpm run start:dev
   ```

## 🏗 Architecture Overview

The frontend React app (`web`) makes fetch requests to this backend on `http://localhost:4000`. The NestJS controllers validate the incoming payloads (using DTOs) and route them to the `AiService`.

### Key Endpoints

- `POST /ai/enhance`: Analyzes field-level resume data (e.g. summaries, job descriptions) and returns a professional, ATS-friendly rewrite using Gemini.
- `POST /ai/chat`: Legacy/general purpose LLM interaction endpoints.
- `POST /ai/generate`: Generates content based on broad contextual constraints.
- `GET /health`: Basic ping to ensure the API is running correctly.

## 🔒 Security

Do not ship `.env` files with your source code. The `GEMINI_API_KEY` is highly sensitive. The entire purpose of this NestJS API is to mask this key and run the execution in a secure node environment prior to responding to the web client.

## 🚀 Deployment (Vercel)

Both the root web application and the NestJS API can be deployed simultaneously to platforms like Vercel. Be sure to supply the `GEMINI_API_KEY` in your Vercel Project Environment Variables.
