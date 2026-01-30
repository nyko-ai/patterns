# Contributing to NYKO Patterns

Thank you for your interest in contributing to NYKO Patterns! This document provides guidelines for adding new patterns or improving existing ones.

## Pattern Quality Standards

Every pattern must be:

1. **Battle-tested** - Used in at least one production application
2. **Complete** - Includes all necessary files, not just snippets
3. **Documented** - Has clear description, edge cases, and validation steps
4. **Current** - Uses modern, maintained package versions

## Adding a New Pattern

### 1. Choose the Right Category

| Category | Use For |
|----------|---------|
| auth | Authentication, authorization, session management |
| payments | Payment processing, subscriptions, billing |
| database | Database setup, RLS, migrations, queries |
| deploy | CI/CD, Docker, hosting configuration |
| email | Transactional email, templates |
| api | API patterns, rate limiting, caching |
| storage | File uploads, CDN, blob storage |
| monitoring | Error tracking, analytics, logging |
| ai | AI/ML integrations, LLM usage |

### 2. Use the Template

Copy `patterns/_template.yaml` and fill in all fields:

```bash
cp patterns/_template.yaml patterns/[category]/your-pattern.yaml
```

### 3. Required Fields

Every pattern MUST include:

- `id` - Unique kebab-case identifier
- `version` - Semantic version (start with 1.0.0)
- `name` - Human-readable name
- `description` - One-line description
- `category` - One of the categories above
- `tags` - At least 2 relevant tags
- `difficulty` - beginner, intermediate, or advanced
- `stack.required` - All required packages with versions
- `files` - All files that need to be created
- `code` - Complete, working code for each file
- `edge_cases` - At least 3 documented edge cases
- `validation.manual_test` - Steps to verify the pattern works

### 4. Code Standards

```yaml
# GOOD - Complete, production-ready code
code:
  lib/stripe.ts: |
    import Stripe from "stripe";

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });

# BAD - Placeholder or incomplete code
code:
  lib/stripe.ts: |
    // TODO: Add Stripe setup
    export const stripe = new Stripe(/* add key */);
```

### 5. Edge Cases

Document real problems users encounter:

```yaml
edge_cases:
  - id: missing-env-var
    symptom: "Application crashes on startup with 'Missing STRIPE_SECRET_KEY'"
    cause: "Environment variable not set in .env.local or deployment platform"
    solution: |
      1. Create .env.local file in project root
      2. Add STRIPE_SECRET_KEY=sk_test_...
      3. Restart development server
```

### 6. Validate Your Pattern

```bash
# Run the validation script
pnpm validate

# Or validate a specific pattern
pnpm validate patterns/payments/your-pattern.yaml
```

## Updating Existing Patterns

When updating a pattern:

1. **Bump the version** following semver:
   - Patch (1.0.0 → 1.0.1): Bug fixes, typos
   - Minor (1.0.0 → 1.1.0): New features, additional edge cases
   - Major (1.0.0 → 2.0.0): Breaking changes, major dependency updates

2. **Update `updated_at`** to current date

3. **Document changes** in the PR description

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/add-pattern-name`
3. Make your changes
4. Run validation: `pnpm validate`
5. Commit with conventional commits: `git commit -m "feat: add resend-email-template pattern"`
6. Open a PR with:
   - Description of the pattern
   - Link to where it's been used in production (if possible)
   - Any special considerations

## Questions?

Open an issue or reach out to the NYKO team.
