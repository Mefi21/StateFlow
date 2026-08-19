# Route and domain map

## Public

- `/` — landing page
- `/demo` and `/demo/{history,timeline,analytics,goals,medications,reports,settings}` — read-only synthetic product
- `/login`, `/register` — username authentication; registration is feature-flagged

## Private

- `/app/dashboard`, `/app/snapshots/new`, `/app/snapshots/[id]/edit`
- `/app/check-in`, `/app/morning`
- `/app/sleep`, `/app/caffeine`
- `/app/history`, `/app/timeline`, `/app/analytics`
- `/app/goals`, `/app/context`, `/app/medications`, `/app/reports`, `/app/search`
- `/app/settings`, `/app/settings/admin`

## Route handlers

- Better Auth: `/api/auth/[...all]`
- idempotent offline sync: `POST /api/sync/snapshots`
- owned snapshot detail/versioned edit/delete: `/api/snapshots/[id]`
- owned goal measurements: `/api/goals/[id]/measurements`
- daily/morning, sleep, caffeine, activities/events, goals, medications, settings: `/api/*`
- private versioned export: `/api/export`

## Major domain types

- `CoreMetric`, `MetricDirection`, `MetricCategory`
- `SnapshotInput`, `DailyEntryInput`, `SleepInput`, `CaffeineInput`
- `DashboardData`, `DemoDay`, `HistoryDay`, `TimelineItem`
- `CorrelationResult` and versioned export envelope

Validation, statistics, persistence, and ownership logic do not live inside visual components, keeping a future native client practical.
