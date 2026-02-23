# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in Baloney, please **do not** open a public GitHub issue.

Instead, report it privately by emailing **security@baloney.app** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested mitigations (optional)

We will acknowledge receipt within **48 hours** and aim to resolve confirmed vulnerabilities within **30 days**.

## Responsible Disclosure

We follow coordinated disclosure. We ask that you:

1. Give us reasonable time to investigate and patch before public disclosure
2. Avoid accessing or modifying user data beyond what is needed to demonstrate the issue
3. Not perform denial-of-service or social engineering attacks

We will credit researchers who report valid security issues (with their permission).

## Security Architecture Notes

- All secrets (API keys, Supabase credentials) must be stored in environment variables — never committed to source control. See `.env.example` files for the required variables.
- The backend APIs restrict allowed CORS origins via the `ALLOWED_ORIGINS` environment variable (comma-separated list of permitted origins, defaults to `https://baloney.app`).
- The `/api/seed` endpoint is protected by a `SEED_SECRET` environment variable and requires the caller to supply a matching `x-seed-secret` header.
