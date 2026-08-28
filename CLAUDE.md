# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

TCC system ("Denarius" — see the localStorage key prefix `@Denarius:` in the frontend) for industrial cost management: obras (jobs/projects), funcionários, orçamentos, financeiro, ordens de serviço. Multi-tenant — almost every table and query is scoped by `empresa_id`. Two independent apps in this repo, run separately:

- `BACKEND/` — Express + TypeScript REST API
- `frontend/` — React + Vite SPA

There is no root-level package.json or workspace config; each app has its own `node_modules` and must be installed/run from its own directory.

## Commands

Run all commands from inside `BACKEND/` or `frontend/` respectively — there is no top-level script.

**Backend** (`BACKEND/`):
```bash
npm run dev      # nodemon + ts-node, watches src/, restarts on change
npm start        # ts-node src/index.ts, no watch
```
There is no build/lint/test script defined in `BACKEND/package.json`. TypeScript is checked only implicitly by `ts-node` at runtime — there's no standalone `tsc` step, so type errors in unreached code paths won't surface until that code runs.

**Frontend** (`frontend/`):
```bash
npm run dev       # vite dev server (default port 5173)
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # preview the production build
```
There is no test script/framework configured in either app.

## Architecture

### Backend (`BACKEND/src/`)

Entry point: [src/index.ts](BACKEND/src/index.ts) — builds the Express app, applies global `cors()` (no origin restriction) and `express.json()`, mounts each route module under `/api/<resource>`, and listens on `process.env.PORT || 3000`.

Layout is `routes/` + `services/`, but the two are **not consistently wired together**:
- Some routers (e.g. `dashboard.routes.ts`) delegate to a matching `services/*.service.ts` module that owns the SQL.
- Others (e.g. `obra.routes.ts`) embed raw SQL/business logic directly in the route handler, even when a same-named service file exists with overlapping logic (`obra.service.ts` exists but is not the one `obra.routes.ts` currently calls). Don't assume a service file is the live code path — check whether the route actually imports it before editing either one.

There is no `controllers/` or `models/` layer, and no ORM/query builder — all DB access is raw SQL through the `pg` `Pool` exported from [src/services/db.ts](BACKEND/src/services/db.ts), called as `pool.query(...)` or, for multi-statement writes, via `pool.connect()` + explicit `BEGIN`/`COMMIT`/`ROLLBACK` (see `obra.routes.ts` POST/PUT handlers for the transaction pattern).

Auth: [src/middlewares/auth.middleware.ts](BACKEND/src/middlewares/auth.middleware.ts) verifies a `Bearer` JWT and injects `req.usuario = { id, empresa_id }` (typed via `src/@types/express/index.d.ts`). Route files apply it themselves with `router.use(verificarToken)` — it's per-router, not global — so `/api/auth` and `/api/admin` are mounted without it while every other resource router turns it on. Every protected query filters by `req.usuario!.empresa_id` for tenant isolation; when adding a new query, filter by `empresa_id` the same way or you'll leak data across tenants.

### Frontend (`frontend/src/`)

Entry point: `index.html` → `src/main.tsx` → `src/App.tsx`, which sets up `BrowserRouter` inside `AuthProvider` ([src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)) and gates most routes behind `PrivateRoute` (`/login` and `/registro` are the public routes).

Feature-based structure under `src/modules/<feature>/` (admin, auth, configuracoes, custo-obra, dashboard, financeiro, funcionarios, orcamentos, ordemServico). Each module follows the same internal shape: `components/`, `hooks/` (e.g. `useDashboard.ts`), `services/` (module-specific API calls), `types/`, plus the screen component and its CSS. Shared, cross-module code lives in `src/components/`, `src/contexts/`, and `src/services/`.

All HTTP calls go through the single axios instance in [src/services/api.ts](frontend/src/services/api.ts); module-level services import this `api` object rather than creating their own axios instance. It attaches the JWT from `localStorage['@Denarius:token']` on every request and, on a `401` response, clears `@Denarius:token`/`@Denarius:usuario` and force-redirects to `/login` — keep that contract in mind if you change auth/token storage, since several places outside `AuthContext` read those same localStorage keys.

### Frontend ↔ backend wiring

- API base URL is hardcoded in `src/services/api.ts` as `http://localhost:3000/api` — there's no `.env`/`VITE_*` env var and no Vite dev-server proxy, so the frontend only works against a backend actually listening on port 3000.
- Backend CORS is fully open (`app.use(cors())`), which is what makes the hardcoded cross-port call work without a proxy.

### Database

PostgreSQL, no ORM. Connection pool is defined directly in [BACKEND/src/services/db.ts](BACKEND/src/services/db.ts) with hardcoded credentials (`database: 'db_industria'`, host/port/user/password all literal in the file) — `dotenv` is a declared dependency but is never actually loaded (`process.env.PORT` in `index.ts` and `process.env.JWT_SECRET` in `auth.middleware.ts` only ever fall back to their hardcoded defaults in practice). If you add env-based config, you must add the `dotenv.config()` call yourself — it isn't wired up anywhere currently.

Schema is not managed via migrations — [BACKEND/banco_dados.sql](BACKEND/banco_dados.sql) is a full `pg_dump` snapshot used to (re)create the database manually. When a change requires a schema change, update this dump file and note it, since there is no migration tool tracking incremental changes. Key tables: `empresas`, `usuarios`, `obras`, `obra_recursos_humanos`, `funcionarios`, `funcoes`, `orcamentos`, `ordens_servico`, `pagamentos_os`, `despesas_fixas`, `investimentos`, `faturamentos_mensais`, `snapshots_financeiros`, `configuracao_producao`, `historico_custo_obra` — most carry an `empresa_id` column for tenant scoping.

## Fluxo de Git

- `main` é produção — deploy automático via Vercel (frontend) / Render (backend). Nunca recebe commit direto.
- `homolog` é a branch de integração/pré-produção — gera preview automático no Vercel.
- Branches de trabalho seguem `feature/<nome-descritivo>`, `fix/<nome-descritivo>` ou `chore/<nome-descritivo>` — nunca nomeadas por data. Devem ser enviadas ao GitHub imediatamente após a criação (`git push -u origin <nome-da-branch>`), antes mesmo do primeiro commit — não só depois de mescladas em `homolog` — para que toda branch de trabalho fique visível no histórico do repositório desde o início.
- Toda mudança de schema de banco é aplicada manualmente no Neon de produção antes de promover `homolog` para `main`.
