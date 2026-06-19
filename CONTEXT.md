# FourRealm OS v3 Context

FourRealm OS v3 is a full-stack Node.js/React application — a personal entertainment OS with a client-side React UI served via Vite and an Express server backend. v3 refines the v2 architecture with cleaner module boundaries and a dedicated docs structure.

## Current domains

- Client UI at `client/` — React frontend bundled by Vite.
- Server at `server/` — Express API backend.
- Database at `database/` — local data storage / scripts.
- Docs at `docs/` — architecture decisions and agent guides.
- Scripts at `scripts/` — utility and automation scripts.

## Current priorities

- Keep the Express server and React client in sync.
- Maintain clean seams between client, server, and data layers.
- Keep commits conventional and CI-friendly.

## Architecture notes

- Prefer deep modules with clear boundaries between client UI, server API, and data access layers.
- Keep environment-specific files out of Git: `.env`, `node_modules/`, `dist/`, `tools/`.
- Use vertical slices (tracer bullets) when adding new features end-to-end.
