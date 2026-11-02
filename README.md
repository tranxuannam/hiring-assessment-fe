# Hiring Assessment frontend

Next.js and TypeScript frontend for the FastAPI hiring assessment API.

## Run

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` when the API is not running at
`http://localhost:8000`. The candidate area accepts the token from a personal
assessment link and saves it locally so a reload resumes the assessment.

The HR area uses the backend's explicitly labelled development-only mock sign-in.
It sends the returned token as `X-HR-Mock-Token`; no application data is embedded
in the frontend.