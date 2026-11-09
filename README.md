# TaskFlow Web

A React frontend for the **TaskFlow** project-management API, inspired by Asana. You can run it against the real API, or with no backend at all through the built-in mock API.

**Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7, TanStack Query 5 and Axios.
**Additional libraries:**
- `@dnd-kit` for drag and drop on the board
- `react-hook-form` and `zod` for form validation
- `lucide-react` for icons
- `msw` for the mock API
- `clsx` and `tailwind-merge` for class names

## Features

- **Auth:** sign up, log in, session restore through `GET /auth/me`, a global 401 → login redirect, and logout.
- **My Tasks** (home): the Overdue, Today, This week, All open and Completed tabs, with filters by project, priority and search, plus sorting.
- **Projects:** a searchable, sortable and paginated card grid. Admins and managers can create projects. Owners and admins can edit or delete them.
- **Board:** sections as columns.
  - Drag cards between columns with a mouse, touch or the keyboard.
  - Dropping a card into a section named **Done** marks the task done. Dragging it out of Done reopens it.
  - Owners and admins can add, rename, reorder (drag or menu) and delete sections.
  - Quick-add a task at the bottom of any column.
- **List:** tasks grouped by section, with sortable headers. Board and List share the same filter bar, and the filters live in the URL.
- **Task pane** (`?task=<id>`, so a task can be shared by link):
  - Inline edits to the title, description, status, assignee (owner or admin only), due date, priority and section.
  - Comments.
  - Delete (owner or admin only).
- **Overview:** summary stats, a status breakdown chart and the activity feed.
- **Members:** add members by email, and remove them (owner or admin only).
- **Admin › Users:** search, filter by role and change roles.
- **Theming:** Light, Dark or System mode × 6 accent palettes (Coral, Indigo, Emerald, Amber, Violet, Ocean). Every text pair is checked for WCAG AA.
- **Keyboard shortcuts:** `N` new task · `/` search · `Esc` close · `?` help · `Ctrl+Enter` send a comment.

## Getting started

```bash
npm install
cp .env.example .env        # then edit VITE_API_URL if needed
npm run dev                 # http://localhost:5173
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server against `VITE_API_URL`. If the API is down, it falls back to mocks (see below). |
| `npm run dev:mock` | Dev server that always uses the in-browser mock API (`.env.mock`). |
| `npm run build` | Type-check and production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript only. |

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | API base URL, **no trailing slash**. Endpoints are mounted at the root (`${VITE_API_URL}/auth/login`). |
| `VITE_USE_MOCKS` | `false` | `true` always uses the mock API and never calls the real one. |
| `VITE_MOCK_FALLBACK` | `true` | If `GET /health` fails at startup, use the mock API instead and show a "Demo data" banner. Set to `false` to see real connection errors instead. |

There are no secrets. The JWT is issued by the API at login and stored in `localStorage`, as the integration guide recommends.

## Connecting to the real API

1. Start the TaskFlow API. It listens on `http://localhost:3000` by default.
2. Add the frontend origin to the API's `CORS_ORIGIN`, e.g. `http://localhost:5173`.
3. Set `VITE_API_URL` in `.env` and run `npm run dev`. For a deployed API, use its URL (e.g. `https://<your-vercel-app>.vercel.app`).
4. Run `npm run seed` on the API to get the demo accounts below.

If the "Demo data" banner appears, the app couldn't reach `${VITE_API_URL}/health` and switched to mocks.

## Demo accounts

These work against a seeded API and in mock mode. Every password is `Password123!`.

| Email | Role |
|---|---|
| admin@taskflow.dev | admin |
| maya@taskflow.dev | manager (owns "Website Redesign" and "Q1 Marketing Campaign") |
| daniel@taskflow.dev | manager (owns "Mobile App Launch") |
| priya@taskflow.dev | member (has an overdue task) |
| leo@taskflow.dev, sara@taskflow.dev, omar@taskflow.dev | members |

Mock data lives in memory and resets when you reload the page.

## Project structure

```
src/
├── api/              # Axios client, ApiError, one module per resource, query keys
├── components/
│   ├── ui/           # primitives: Button, Input, Select, Field, Modal, Sheet, DropdownMenu, Popover, Table, Badge, Avatar, Toast, Skeleton…
│   ├── layout/       # AppShell, Sidebar, Topbar, PageHeader, route guards, DemoBanner
│   └── features/     # auth, board, tasks, comments, projects, members, overview, admin, my-tasks, settings
├── context/          # auth, theme and toast providers
├── hooks/            # TanStack Query hooks per resource, URL state, hotkeys, permissions
├── lib/              # constants, dates, permissions, zod schemas, cache helpers, utils
├── mocks/            # MSW handlers for every endpoint + seeded in-memory database
├── pages/            # route components
├── styles/           # tokens.css (all themes) + globals.css (Tailwind theme mapping)
├── types/            # API types (copied from the integration guide)
├── App.tsx, router.tsx, main.tsx
```

### Conventions

- **Server state** lives only in TanStack Query. Every mutation writes the returned task into every cached list. It then invalidates the affected lists, plus the project summary and activity.
- **URL state** holds filters, sort, page, tab and the open task.
- **Design tokens:** components use token utilities only (`bg-surface`, `text-fg-muted`, `bg-accent`…). Tailwind's default palette is disabled, so raw colors can't creep in.
- **Permissions:** `lib/permissions.ts` implements the guide's flags (`isAdmin`, `canCreateProject`, `canManageProject`, `canDeleteComment`). The UI hides actions the user can't perform, but the server still enforces every rule.
