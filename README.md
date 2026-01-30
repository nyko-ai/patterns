# Nyko Patterns

Battle-tested implementation patterns for AI coding assistants.

## Quick Start

### Installation with Claude Code

```bash
claude mcp add nyko -- npx -y @nyko-ai/mcp
```

Then restart Claude Code. You now have access to Nyko tools.

### Available Tools

#### 1. `nyko_search` - Find Patterns

Search for implementation patterns by keyword.

```
"Search for Google authentication patterns"
→ Claude uses nyko_search with query "google auth"
→ Returns matching patterns with IDs, descriptions, difficulty
```

**Example queries:**
- "stripe payments"
- "supabase oauth"
- "rate limiting"
- "docker compose"

#### 2. `nyko_get` - Get Implementation

Get complete code, files, and setup instructions for a pattern.

```
"Get the supabase-google-oauth pattern"
→ Claude uses nyko_get with pattern_id "supabase-google-oauth"
→ Returns all files, env vars, external setup steps, edge cases
```

**Parameters:**
- `pattern_id` (required): Pattern ID from search results
- `has_src_dir` (optional): Set to `true` if your project uses `src/` directory

#### 3. `nyko_sequence` - Plan Implementation

Get ordered sequence of patterns to implement a complete feature.

```
"I want to add Google auth with protected routes"
→ Claude uses nyko_sequence with goal "google auth with protected routes"
→ Returns ordered list: 1. supabase-client-nextjs → 2. supabase-google-oauth → 3. supabase-protected-routes
```

#### 4. `nyko_check` - Verify Compatibility

Check if a pattern is compatible with your project's dependencies.

```
"Check if stripe-checkout-session works with my project"
→ Claude uses nyko_check with pattern_id and your package.json dependencies
→ Returns compatibility status, missing packages, version issues
```

## Available Patterns

### Auth
| Pattern | Description | Difficulty |
|---------|-------------|------------|
| `supabase-client-nextjs` | Supabase client setup for Next.js App Router | Beginner |
| `supabase-google-oauth` | Google OAuth with Supabase Auth | Intermediate |
| `supabase-github-oauth` | GitHub OAuth with Supabase Auth | Intermediate |
| `supabase-magic-link` | Passwordless email magic link auth | Intermediate |
| `supabase-protected-routes` | Middleware for route protection | Beginner |
| `supabase-signout` | Client and server sign out | Beginner |

### Payments
| Pattern | Description | Difficulty |
|---------|-------------|------------|
| `stripe-checkout-session` | Stripe Checkout for payments/subscriptions | Intermediate |
| `stripe-webhook-handler` | Stripe webhooks with signature verification | Intermediate |
| `stripe-customer-portal` | Customer portal for subscription management | Beginner |

### Database
| Pattern | Description | Difficulty |
|---------|-------------|------------|
| `supabase-rls-policies` | Row Level Security policy examples | Intermediate |

### Deploy
| Pattern | Description | Difficulty |
|---------|-------------|------------|
| `docker-compose-dev` | Docker Compose for local development | Beginner |
| `github-actions-vercel` | CI/CD pipeline to Vercel | Beginner |

### API
| Pattern | Description | Difficulty |
|---------|-------------|------------|
| `rate-limiting-upstash` | Rate limiting with Upstash Redis | Intermediate |

### Coming Soon
- **Email**: Resend templates, transactional emails
- **Storage**: Supabase Storage, S3 uploads
- **Monitoring**: Sentry integration, analytics
- **AI**: OpenAI, Claude API patterns

## Pattern Format

Each pattern includes:

- **Complete code** - Production-ready, not snippets
- **All files** - Every file needed for the feature
- **Environment variables** - What to set and where to find values
- **External setup** - Dashboard configuration steps
- **Edge cases** - Common issues and solutions
- **Validation steps** - How to verify it works

## Current Stack (January 2026)

| Package | Version |
|---------|---------|
| Next.js | ^15.1.0 |
| @supabase/supabase-js | ^2.49.0 |
| @supabase/ssr | ^0.5.2 |
| Stripe | ^17.4.0 |
| @upstash/ratelimit | ^2.0.5 |
| @upstash/redis | ^1.34.3 |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding a Pattern

1. Copy `patterns/_template.yaml`
2. Fill in all required fields
3. Include **real, tested code** - no placeholders
4. Document at least 3 edge cases
5. Add validation steps
6. Run `pnpm validate`
7. Submit a PR

### Pattern Quality Standards

- **Battle-tested**: Used in production
- **Complete**: All files included
- **Current**: Uses latest stable versions
- **Documented**: Edge cases and setup steps

## License

MIT - See [LICENSE](LICENSE)

---

Built by the [Nyko](https://nyko.ai) team.
