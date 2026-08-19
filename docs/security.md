# Security model

## Protected assets

Credentials, sessions, metric values, journal text, medication/substance notes, exports, and safety-plan text are sensitive. Confidentiality and cross-user isolation have priority.

## Trust boundaries

- The browser is untrusted for identity and authorization.
- Better Auth’s HTTP-only cookie identifies a session; every query still constrains `userId`.
- External JSON is parsed with Zod before persistence.
- PostgreSQL constraints are the final integrity layer.
- The server operator controls infrastructure, but the admin UI intentionally cannot browse journals.

## Controls

- Better Auth owns password hashing, session rotation, cookie signing, and auth origin validation.
- Auth endpoints are rate-limited; public registration is closed by default.
- Route handlers return generic errors and never expose stack traces.
- A snapshot UUID collision owned by a different user returns a conflict without record data.
- Private responses are `private, no-store` and vary on cookies.
- The service worker bypasses navigations, HTML, `/api/*`, and authenticated data.
- Audit records contain metadata only—never notes, passwords/tokens, sensitive metric values, or medication/substance notes.
- CSP, frame denial, MIME-sniffing prevention, restrictive permissions, and same-origin opener policy are global.

## Deployment responsibilities

Use TLS, a long random secret, managed encrypted storage, encrypted backups, least-privilege deployment access, and an explicit retention policy. Do not enable request-body logging. Run migrations before rollout and integration tests only against an isolated database.
