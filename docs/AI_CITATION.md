# AI Tools Disclosure

> Per MadData26 hackathon requirements, this document discloses all AI tools used in building TrustLens.

## Tools Used

| Tool | Model | Purpose |
|------|-------|---------|
| Claude Code (CLI) | Opus 4.6 | Architecture planning, debugging, code review, orchestration |
| Claude Code (CLI) | Sonnet 4.6 | Implementation, component building, API routes, documentation |

## What AI Generated

- **Boilerplate code**: Next.js API route scaffolding, TypeScript interfaces, Tailwind utility classes
- **Mock detectors**: Statistical distributions for image/text/video detection simulation
- **Seed data**: Realistic scan distributions, weighted platform selection, content hash generation
- **Type definitions**: 17+ TypeScript interfaces matching Supabase schema
- **CSS theming**: Dark mode color system, chart styling, badge colors
- **Documentation**: Architecture diagrams, API reference, this disclosure

## What Humans Did

- **Product vision**: Problem identification, target user definition, feature prioritization
- **Architecture decisions**: Choosing Supabase over custom backend, serverless over monolith, extension-first UX
- **Feature design**: AI Slop Index concept, Exposure Score gamification, Content Provenance system
- **Database schema**: All 6 tables, 11 views, 3 RPC functions designed by hand
- **Deployment pipeline**: Vercel configuration, Supabase project setup, environment variable management
- **Testing and QA**: Manual testing of all endpoints, cross-browser extension testing, data integrity verification
- **Presentation**: Pitch narrative, demo script, recovery procedures

## Methodology

All code was written through an iterative human-AI collaboration:

1. Human defines the feature requirements and architectural constraints
2. AI generates initial implementation following established patterns
3. Human reviews, tests, and iterates on the output
4. AI assists with debugging and refinement
5. Human makes final decisions on all shipped code

No code was blindly accepted. Every AI-generated line was reviewed by a human team member before merging.

## Team

- **Nathaniel Garelik** — Full Stack Developer, Product Owner
