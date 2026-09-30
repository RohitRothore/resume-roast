# Resume Roast

AI-powered resume critique. Upload a PDF/DOCX (or paste text), optionally add a job description, and get an ATS score, specific strengths/weaknesses, and rewritten bullets.

The UI is slightly playful. The feedback is professional and constructive.

## Stack

- Next.js 16 App Router + Tailwind CSS
- Route Handler at `/api/critique`
- Groq (default) or Google Gemini via `LLM_PROVIDER`
- `pdf-parse` and `mammoth` for file extraction

Default Groq model is `openai/gpt-oss-20b` (listed on Groq’s current production + free-tier rate-limit tables). Override with `GROQ_MODEL`.

## Setup

```bash
npm install
cp .env.example .env.local
```

Get a free Groq key at [console.groq.com/keys](https://console.groq.com/keys) and set `GROQ_API_KEY`.

To try the UI without an API key:

```
USE_MOCK_LLM=true
```

Switch providers if you hit Groq rate limits:

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cost controls

- Resume text is capped at 6,000 characters before the LLM call
- IP-based limit (default 5 critiques / UTC day, in-memory)
- Rewritten bullets capped at 5

In-memory rate limits reset when a serverless instance recycles. That is enough to blunt casual abuse on the Vercel free tier; a KV store would be more consistent across instances.

## Deploy (Vercel)

1. Push the repo and import it in Vercel
2. Add env vars from `.env.example`
3. Leave `USE_MOCK_LLM` unset (or `false`) in production

## Not in this MVP

Shareable permalinks, a “resumes roasted” counter, and PDF export need a database. Ask before adding those.
