# Contributing to TasklyClean

Thank you for your interest in contributing!

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Supabase and Anthropic keys
3. Run `npm install`
4. Run `npm run dev`

## Branch strategy

- `master` — production-ready code
- `develop` — active development, PRs merge here first

## Running locally

```bash
npm run dev        # Start dev server at localhost:3000
npx tsc --noEmit  # Type check
npm run build     # Production build
```
