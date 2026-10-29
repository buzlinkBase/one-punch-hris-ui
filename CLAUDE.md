# hris-react

React + Vite front end of the One Punch HRIS (multi-company SaaS: timekeeping, payroll, approvals, billing).

## Tech Stack

- **React 19** + TypeScript 6
- **Vite 8** — build tool
- **Ant Design (antd) v6** — UI component library
- **Tailwind CSS v4** — utility styling
- **@tanstack/react-router v1** — routing (NOT React Router)
- **@tanstack/react-query v5** — server state, data fetching, and mutations
- **Zustand v5** — client/UI state management
- **React Hook Form + Zod v4** — form handling and validation
- **Axios** — HTTP client
- **SignalR** (`@microsoft/signalr`) — push notifications / approval updates
- **Vitest** — unit tests (`*.test.ts` next to the code); **Husky** — git hooks

## Project Structure

```
src/
├── app/
│   ├── layouts/          # auth-layout, main-layout
│   ├── routes/           # app-routes.tsx + per-area routes (setup, analytics, portal, communication, client-portal)
│   └── modules/
│       ├── account, analytics, applications, auth, billing, biometric,
│       │   change-schedule (work-rotation, fixed-schedule, rest-day, holiday),
│       │   client-portal, communication, daily-time-record, dashboard, help,
│       │   portal (employee/approver), reports, security, timekeeping
│       └── setup/        # branch, client, department, employee, holiday, operation-area,
│                         # payroll-group, time-shift, deduction, other-income, leave-type,
│                         # approval-workflows, approval-delegations, statutory tables, ...
├── core/
│   ├── auth/             # token storage, refresh, session sync, JWT util, require-permission
│   ├── http/             # axios.instance.ts, http-client.ts, api-error.ts, service-registry.ts, interceptors/
│   ├── signalr/          # hub connection
│   ├── notifications/    # in-app notifications
│   ├── stores/           # global stores (e.g. loading)
│   ├── query-client.ts   # React Query defaults (staleTime 5m, gcTime 10m, retry 1)
│   └── theme.config.ts   # Ant Design theme tokens
└── shared/
    ├── components/       # reusable UI (page-header, employee-select, mobile-range-picker,
    │                     #   approval-*, attachment-upload, permission-gate, responsive-table, ...)
    ├── hooks/            # use-route-params, use-has-permission, use-table-pagination, approval queries, ...
    ├── drilldown/        # dashboard/analytics figure -> filtered list navigation
    ├── utils/, services/, types/, constants/, industry/
```

File and folder names are **kebab-case** (`department-table/`, `use-department-queries.ts`).

## Feature Module Pattern

Every feature module follows (omit what it doesn't need):

```
{feature}/
├── models/api/{request,response}/   # TypeScript interfaces (Create/Update/Response)
├── models/forms/                    # Zod validation schema ({feature}-form.schema.ts)
├── services/                        # {feature}.api.ts (+ optional {feature}.mapper.ts)
├── hooks/                           # use-{feature}-queries.ts — React Query hooks
├── components/{feature}-table/      # Presentational AntD table
├── pages/{feature}-list/            # List page (uses React Query hook)
├── pages/{feature}-detail/          # Form page (create/edit)
├── store/{feature}.store.ts         # Zustand store (selected item + manual load state)
└── constants/label.const.ts         # UI labels
```

## State Management

- **React Query hooks** — preferred for all data fetching and mutations (caching, refetch, loading/error state).
- **Zustand store** — selected item and manual `loadAll / loadById / add / update / remove` where manual control is needed.
- Components prefer React Query hooks. Do not call raw API functions directly from components or stores.
- New list screens that show approval items must be registered in `APPROVAL_LIST_QUERY_KEYS` so SignalR pushes refresh them.

## Architectural Rules

- HTTP calls live exclusively in `services/*.api.ts`; stores and hooks import from `services/` — never call axios elsewhere.
- Forms use React Hook Form bound to a Zod schema from `models/forms/`.
- Routing uses TanStack Router (`useNavigate`, `useParams` from `@tanstack/react-router`); `use-route-params` wraps param access.
- Path alias `@/` maps to `src/`.
- Code must follow SOLID and use GoF patterns where the shape fits, rather than ad-hoc branching.
- Gate screens/actions with `permission-gate` / `use-has-permission`, and with plan entitlements (`entitlement-keys.const.ts`) where the feature is plan-limited.

## UI Conventions

- **No inline `style` props** — use Tailwind classes (Tailwind v4 theme).
- **Date ranges**: always use the shared `MobileRangePicker` (`shared/components/mobile-range-picker`), never antd's `DatePicker.RangePicker`.
- **Terminology**: never show the word "tenant" in user-facing text — say "company". Backend code and claims keep "tenant". "Area", "cost center" and "project site" are the same entity.
- **No mock data**: do not add `MOCK_*` constants or fallback data to `*.api.ts`.
- **Excel export**: use xlsx/SheetJS via `downloadMultiSheetExcel`.
- **Printouts** open the server-generated PDF in a new browser tab, not an in-app modal.
- **Wall-clock DateTimes** (pass slips, loans) are Manila local time; the UI's Z-stripping is intentional — never convert them with `toPh`.
- antd v6 modal box element class is `.ant-modal-container` (there is no `.ant-modal-content`).
- Collapsible cards remember their open/closed state in `localStorage` (wrapped in try/catch).
- **Help Center**: user-facing changes must update the articles under `src/app/modules/help/content/` in the same change.
- A new setup module must also update `EmployeeDetail` to use its dropdown for the related `*Id` field.
- Payroll entity field changes must be mirrored in the Payroll Summary report and other related payroll reports.

## API

```
Base URL:   VITE_API_URL + VITE_API_VERSION  (e.g. http://localhost:1442/v1/)
Services:   routed per backend via VITE_PREFIX_{AUTH,HRMS,ADMS,TENANTS,NOTIFICATIONS} (core/http/service-registry.ts)
Auth:       Bearer token + refresh handled in core/auth (auth-storage.ts)
```

`src/core/http/http-client.ts` exposes `get / post / put / patch / delete` (returns `ApiResponse<T>`) and `getUnwrapped / postUnwrapped` (returns `.data` directly).

## Theme

Primary brand color `#1DA081` (teal green), configured in `src/core/theme.config.ts` and applied via Ant Design `ConfigProvider` in `App.tsx`.

## Environment Variables

```
VITE_API_URL=http://localhost:1442/
VITE_API_VERSION=v1
VITE_APP_NAME=One Punch HRIS
VITE_GOOGLE_CLIENT_ID=...
VITE_PREFIX_AUTH / _HRMS / _ADMS / _TENANTS / _NOTIFICATIONS
```

## Commands

```bash
pnpm dev            # Dev server (localhost:5173)
pnpm build          # tsc -b && vite build
pnpm preview        # Preview production build
pnpm lint           # ESLint
pnpm format         # Prettier write (format:check to verify)
pnpm test:run       # Vitest once (pnpm test = watch, test:coverage = coverage)
```

Write code that would pass tsc, lint and prettier; the user runs those manually.

## Related Docs

`BRANCHING.md`, `DEPLOYMENT.md`, `PROXY-SETUP.md`, `auth.spec.md`.
