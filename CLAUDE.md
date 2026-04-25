# hris-react

React + Vite implementation of the HRIS system.

## Tech Stack

- **React 19** + TypeScript 6
- **Vite 8** — build tool
- **Ant Design (antd) v6** — UI component library
- **Tailwind CSS v4** — utility styling
- **@tanstack/react-router v1** — routing (NOT React Router — uses TanStack Router)
- **@tanstack/react-query v5** — server state, data fetching, and mutations
- **Zustand v5** — client/UI state management
- **React Hook Form + Zod v4** — form handling and validation
- **Axios** — HTTP client

## Project Structure

```
src/
├── app/
│   ├── layouts/          # MainLayout, AuthLayout
│   ├── modules/
│   │   ├── auth/login/
│   │   ├── setup/        # department, employee, holiday, operation-area, payroll-group, time-shift/fixed, time-shift/flexi
│   │   └── timekeeping/  # placeholder page
│   └── routes/           # AppRoutes.tsx, setup.routes.tsx
├── core/
│   ├── http/             # axios.instance.ts, http-client.ts, interceptors/
│   ├── stores/           # loading.store.ts (global loading state)
│   ├── query-client.ts   # React Query client config (staleTime 5m, gcTime 10m, retry 1)
│   └── theme.config.ts   # Ant Design theme tokens
└── shared/
    ├── components/       # FormSection/ (skeleton, not yet implemented)
    ├── hooks/            # useRouteParams.ts
    ├── types/            # api-response.model.ts (ApiResponse<T>)
    └── constants/        # navigation.const.ts
```

## Feature Module Pattern

Every feature under `src/app/modules/setup/{feature}/` follows:

```
{feature}/
├── models/api/{request,response}/   # TypeScript interfaces (Create/Update/Response)
├── models/forms/                    # Zod validation schema ({feature}-form.schema.ts)
├── services/                        # {feature}.api.ts (+ optional {feature}.mapper.ts)
├── hooks/                           # use{Feature}Queries.ts — React Query hooks
├── components/{Feature}Table/       # Presentational AntD table
├── pages/{Feature}List/             # List page (uses React Query hook)
├── pages/{Feature}Detail/           # Form page (create/edit)
├── store/{feature}.store.ts         # Zustand store (selected-item + manual load state)
└── constants/label.const.ts         # UI labels
```

## State Management (Dual Pattern)

Both patterns coexist in every module:

- **React Query hooks** (`hooks/use{Feature}Queries.ts`) — preferred for all data fetching and mutations. Handles caching, background refetch, loading/error state automatically.
- **Zustand store** (`store/{feature}.store.ts`) — holds `selected` item and provides `loadAll / loadById / add / update / remove` actions for cases where manual control is needed.

Components should prefer React Query hooks. Do not call raw API functions directly from components or stores.

## Architectural Rules

- HTTP calls live exclusively in `services/*.api.ts`
- Stores and hooks import from `services/` — never call axios directly elsewhere
- Forms use React Hook Form bound to a Zod schema from `models/forms/`
- Routing uses TanStack Router — use `useNavigate` and `useParams` from `@tanstack/react-router`; `useRouteParams` from `@/shared/hooks/useRouteParams` wraps param access
- Path alias `@/` maps to `src/`
- Each `*.api.ts` includes a `MOCK_DATA` fallback used when the API is unavailable or returns empty

## API

```
Base URL:   VITE_API_URL + VITE_API_VERSION  (e.g. http://localhost:1442/v1/)
Auth:       Bearer token in localStorage key `auth_token`
User info:  localStorage key `auth_user`
```

HTTP wrapper in `src/core/http/http-client.ts` exposes:
- `get / post / put / patch / delete` — returns `ApiResponse<T>`
- `getUnwrapped / postUnwrapped` — unwraps and returns `ApiResponse<T>.data` directly

## Theme

Primary brand color: `#1DA081` (teal green). Configured in `src/core/theme.config.ts` and applied via Ant Design `ConfigProvider` in `App.tsx`.

## Environment Variables

```
VITE_API_URL=http://localhost:1442/
VITE_API_VERSION=v1
VITE_APP_NAME=One Punch HRIS
```

## Commands

```bash
pnpm dev      # Start dev server (localhost:5173)
pnpm build    # Production build
pnpm preview  # Preview production build
pnpm lint     # ESLint
```
