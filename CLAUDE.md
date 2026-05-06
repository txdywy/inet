# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProxyPulse is a **proxy tech radar** — a static frontend site that aggregates, classifies, and displays updates from the open-source proxy/VPN ecosystem. It monitors GitHub releases for ~30 projects (Xray-core, sing-box, mihomo, Clash clients, OpenWrt plugins, Tailscale, etc.) and presents them in a categorized dashboard.

**Architecture**: Pure frontend (Vite + React 19 + TypeScript + Tailwind CSS v4) reading static JSON from `public/data/`. No backend, no database, no auth. Data is fetched and classified by Node.js scripts running in GitHub Actions, then committed back to the repo.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Type check + production build
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking (tsc -b)

# Data pipeline (must run in this order):
npm run fetch        # Fetch GitHub releases → public/data/_raw.json
npm run classify     # AI classify + rule fallback → public/data/items.json
npm run build:data   # Generate projects.json, tags.json, stats.json, protocols.json
```

## Architecture

### Data Pipeline (`scripts/`)

Data flows: **sources → fetch → classify → build-index**

1. `sources.ts` — Monitored GitHub repos and manual sources (commercial iOS clients) with category, platforms, tags, priority
2. `fetch-github.ts` — GitHub REST API releases per repo. Outputs `_raw.json` (gitignored intermediate file)
3. `normalize.ts` — Converts raw items to `RadarItem` with stable hash-based IDs for deduplication
4. `classify-ai.ts` — GitHub Models API (gpt-4o-mini) for Chinese summary, categorization, importance scoring. Falls back to `rules.ts` on failure. Pre-filters to only classify releases + items matching protocol/security/breaking keywords (max 30/run)
5. `rules.ts` — Rule-based classification: repo→category mapping, protocol keyword detection, security/breaking term matching, noise filtering
6. `build-index.ts` — Generates index files from `items.json`: projects, tags, stats, protocols

### Frontend (`src/`)

- **Types**: `types/radar.ts` — `RadarItem` (core data unit), `ProjectMeta`, `ProtocolMeta`, `Stats`, `TagIndex`
- **Data layer**: `src/lib/data.ts` (fetches `/data/*.json`), `src/lib/search.ts` (Fuse.js), `src/lib/format.ts` (dates/categories/importance), `src/lib/theme.ts` (dark/light mode)
- **Components**: `RadarCard`, `FilterPanel`, `SearchBox`, `TagBadge`, `ImportanceBadge`, `Header`, `Layout`
- **Pages**: `HomePage` (dashboard), `UpdatesPage` (filtered list with pagination), `ProjectsPage`/`ProjectDetailPage`, `ProtocolsPage`/`ProtocolDetailPage`, `TagsPage`
- **Routing**: React Router `BrowserRouter`, all routes under `Layout` outlet

### GitHub Actions (`.github/workflows/`)

- `fetch.yml` — 4x daily cron + manual dispatch. Fetches → classifies → builds indexes → commits if changed
- `deploy.yml` — Builds and deploys to GitHub Pages on push to main

### Data Files (`public/data/`)

- `items.json` — All radar items (primary data store, frontend reads this)
- `projects.json`, `protocols.json`, `tags.json`, `stats.json` — Generated indexes

## Key Conventions

- Scripts use `tsx` for execution and import `types/radar.ts` with `.js` extension (ESM resolution requirement)
- Two tsconfigs: `tsconfig.app.json` (browser/React), `tsconfig.scripts.json` (Node.js scripts)
- AI classification calls `models.inference.ai.azure.com` using `GITHUB_TOKEN`; on failure, rule-based fallback produces a working result
- Tailwind CSS v4 with `@tailwindcss/vite` plugin and `@custom-variant dark` directive
- Dark mode: `.dark` class on `<html>` (not media query). Theme persisted in localStorage, applied before React renders via inline script in `index.html`
