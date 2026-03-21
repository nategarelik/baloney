---
description: Deploy baloney-pro services (Vercel frontend, Railway backends)
allowed-tools: Bash, Read, Grep
---

# Deploy Pipeline

## Pre-flight
1. Run `cd frontend && npx tsc --noEmit` (must pass)
2. Run `cd frontend && npm test` (must pass)

## Frontend (Vercel)
Push to master branch -- Vercel auto-deploys to baloney.app.
```
git push origin master
```

## Backend (Railway)
Backend deploys via Railway git integration or CLI:
```
cd backend && railway deploy
```

## SynthID Backend (Railway)
```
cd synthid-backend && railway deploy
```

## Verification
```
curl -s https://baloney.app/api/health | python3 -m json.tool
```
Check status is "ok" and version matches expected.
