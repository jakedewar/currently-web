Intention: What Currently (MVP) Is

One-liner: Generate a living, shareable project status page for any Project in Currently.

Primary user job: “When someone asks ‘Where are we at?’, share one link that is always up-to-date.”

Inputs: Tasks (status only), Decisions, Blockers, Resources (links), Project metadata (title, owner).

Output: Public, view-only page /share/[token] showing progress, done/doing/next, recent decisions, blockers, and pinned resources.

Non-goals (MVP): No editing on public page, no external auth, no deep PM features, no side-panel dependency.

Success Criteria (MVP)

Create a share link for a project in <10s.

Paste link into Slack/email and it renders without login.

Page loads in <1s TTFB (SSR) and shows only whitelisted fields.

Owners can revoke/expire links instantly.

5+ target users say it replaces their weekly status doc.

The Safe Pattern (overview)

Add project_shares table (revocable share tokens)

Maps a random token → project_id, org_id, expires_at (nullable), revoked (bool), scope (JSON), created_by, timestamps.

Purpose: act as a controlled gate for public viewing. No data duplication.

Keep RLS ON everywhere

All existing tables (projects, tasks, resources, etc.) stay fully private.

Do not grant anon any access to those tables.

Public reads go through server code using service role to fetch + redact.

Two API routes

POST /api/projects/:id/shares (auth required)

Ownership check → write a row with token, optional expires_at, optional scope.

Returns shareUrl (/share/:token).

GET /api/shares/:token (public)

Server validates token, checks revoked/expires_at.

Queries minimal project data via service-role client.

Redacts to whitelisted fields (honor scope).

Adds rate limiting + response headers.

Public page /share/[token] (SSR)

Server fetches GET /api/shares/:token → renders view-only status page.

No client-side data writes; no Supabase key on the client.

Include <meta name="robots" content="noindex,nofollow" />.

Revocation / expiration

Project owners can revoke, set expiration, or rotate a link.

Tokens are random, URL-safe, and long (≥24 bytes).

Hygiene

Basic rate limiting on the public endpoint.

No PII or sensitive content unless explicitly allowed via scope.

Security headers + short cache (Cache-Control: private, max-age=15).

Why this is safe: All private data remains behind RLS. The public page is a server-rendered projection controlled by a token that you can revoke at any time.