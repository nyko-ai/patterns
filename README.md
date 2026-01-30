# NYKO Patterns

Battle-tested implementation patterns for AI coding assistants (Claude Code, Cursor, GitHub Copilot, etc).

## What is this?

A collection of production-ready code patterns designed to be consumed by AI coding assistants through MCP (Model Context Protocol) servers. Each pattern is:

- **Battle-tested**: Used in production applications
- **Complete**: Includes all files, env vars, and edge cases
- **Versioned**: Pinned dependencies with compatibility notes
- **AI-optimized**: Structured YAML format for easy parsing

## Quick Start

### For AI Assistants (MCP Integration)

```typescript
// Query patterns via NYKO MCP server
const pattern = await nyko.getPattern("supabase-google-oauth");
// Returns complete implementation with all files
```

### For Developers

Browse patterns by category:

- **[Auth](/patterns/auth)** - Authentication patterns (Supabase, OAuth, Magic Links)
- **[Payments](/patterns/payments)** - Payment processing (Stripe Checkout, Webhooks, Subscriptions)
- **[Database](/patterns/database)** - Database patterns (RLS policies, migrations)
- **[Deploy](/patterns/deploy)** - Deployment (Docker, GitHub Actions, Vercel)
- **[API](/patterns/api)** - API patterns (Rate limiting, caching)
- **[Email](/patterns/email)** - Email (Resend, templates)
- **[Storage](/patterns/storage)** - File storage (Supabase Storage, S3)
- **[Monitoring](/patterns/monitoring)** - Observability (Sentry, analytics)
- **[AI](/patterns/ai)** - AI integration (OpenAI, Claude)

## Pattern Format

Each pattern follows a strict YAML schema:

```yaml
id: pattern-id-kebab-case
version: "1.0.0"
name: "Human Readable Name"
description: "One line description"

stack:
  required:
    - name: "package-name"
      version: "^x.x.x"

files:
  - path: "path/to/file.ts"
    action: create

code:
  path/to/file.ts: |
    // Complete, working code

edge_cases:
  - symptom: "What user sees"
    cause: "Why it happens"
    solution: "How to fix"
```

See [_template.yaml](/patterns/_template.yaml) for the complete schema.

## Current Stack (January 2026)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | ^15.1.0 | App Router only |
| @supabase/supabase-js | ^2.49.0 | |
| @supabase/ssr | ^0.5.2 | Replaces auth-helpers |
| Stripe | ^17.4.0 | |
| @upstash/ratelimit | ^2.0.5 | |
| @upstash/redis | ^1.34.3 | |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new patterns.

## License

MIT - See [LICENSE](LICENSE)

---

Built with love by the [NYKO](https://nyko.ai) team.
