# hris-react

React + Vite implementation of the HRIS system. Feature-for-feature equivalent of the Angular `hris` project.

## Tech Stack

- **React 18** + TypeScript
- **Vite** — build tool
- **Ant Design (antd)** — UI component library
- **Tailwind CSS v4** — utility styling
- **React Router v6** — routing
- **Zustand** — state management (replaces NgRx)
- **React Hook Form + Zod** — form handling and validation
- **Axios** — HTTP client

## Project Structure

```
src/
├── app/
│   ├── layouts/          # MainLayout, AuthLayout
│   ├── modules/
│   │   ├── auth/login/
│   │   ├── setup/        # department, employee, holiday, operation-area, payroll-group, time-shift
│   │   └── timekeeping/
│   └── routes/           # AppRoutes, setup.routes
├── core/
│   ├── http/             # Axios instance, interceptors, http-client wrapper
│   └── stores/           # Global loading store
└── shared/
    ├── components/       # Shared UI components
    ├── hooks/            # Shared hooks
    ├── types/            # ApiResponse, etc.
    └── constants/        # Navigation items
```

## Feature Module Pattern

Every feature under `src/app/modules/setup/{feature}/` follows:

```
{feature}/
├── models/api/{request,response}/   # TypeScript interfaces
├── models/forms/                    # Zod validation schema
├── services/                        # Axios API calls
├── components/{Feature}Table/       # Presentational AntD table
├── pages/{Feature}List/             # List page (calls store.loadAll)
├── pages/{Feature}Detail/           # Form page (create/edit)
├── store/{feature}.store.ts         # Zustand store (= Angular sandbox)
└── constants/label.const.ts         # UI labels
```

## Architectural Rules

- Components call the Zustand store hook — never raw API functions directly
- HTTP calls live in `services/*.api.ts` — never in components or stores directly
- Stores import from `services/` to make API calls
- Forms use React Hook Form + Zod schema from `models/forms/`
- Path alias `@/` maps to `src/`

## API

Base URL: `VITE_API_URL` env var (default: `http://localhost:1442/`)
Auth: Bearer token stored in `localStorage` as `auth_token`

## Commands

```bash
pnpm dev      # Start dev server (localhost:5173)
pnpm build    # Production build
pnpm preview  # Preview production build
pnpm lint     # ESLint
```
