# Impossible Solutions Outreach

Milestone 1: a TanStack Start / React / TypeScript approvals dashboard, Supabase migration, and five explicitly fictional lead fixtures. No email-sending code or agents run in this milestone.

## Run locally

Use Node 22.12+ (22 LTS recommended) and pnpm 10.30.3.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Without Supabase environment variables the app shows five fictional samples. Sample edits/rejections last for the current page session only; reload resets them. This is a preview, not a second database. E opens editing; R opens rejection feedback. A explains why approval is unavailable. Gmail approval is deliberately disabled until milestone 5.

## Connect a dedicated Supabase project

1. Create a free project when an active-project slot is available. Existing staging projects need not be deleted. As of setup, creation was blocked by the account's two-active-free-project limit; no existing project was modified.
2. Run `supabase/migrations/202611040001_foundation.sql` using the Supabase SQL editor, then `supabase/seed.sql`. Alternatively use Supabase CLI migrations against the intended project. Seed is idempotent and does not overwrite review decisions.
3. In Authentication, create/invite your owner user. Disable public signups. Configure Site URL and redirect URLs for localhost and your eventual production URL.
4. Add the owner to the workspace allowlist in the SQL editor:

```sql
insert into public.workspace_members(user_id)
select id from auth.users where email = 'YOUR_OWNER_EMAIL'
on conflict do nothing;
```

5. Copy `.env.example` to `.env`, then set the project URL and **publishable key**, not the service-role key. Restart `pnpm dev`. Sign in with the owner email. No passwords or secret keys belong in source control.

The database uses row-level security and an explicit workspace membership allowlist. Browser clients can read only as an allowed member. Edits and rejections go through `review_draft`, which locks the draft and records its decision event in the same transaction. Direct browser writes to business tables are revoked. Unsupported actions, including approval, are rejected by the database. Agent events are included in the realtime publication for milestone 4. No connected-database verification has happened until the migration runs on a project.

## Validation

```sh
pnpm check
pnpm test
pnpm build
pnpm start
```

Tests cover validation and queue eligibility. The browser sample flow was exercised for selecting, editing, saving, rejecting, and updating counts. Database permissions and atomic decision behavior must also be verified after provisioning. Dependency versions are pinned and the lockfile is committed. The Sonatype service was unavailable during setup; its additional dependency review remains outstanding.

## A Raspberry Pi running 24/7

A Pi can host the dashboard and later a separate scheduled worker. The monitor is optional: it can display the dashboard, but the worker continues without a browser or monitor. API calls run on OpenAI/Google infrastructure; the Pi does not need to run a local language model. Supabase remains the database.

Use 64-bit Raspberry Pi OS, a supported Node LTS, stable networking and storage, cooling, and the correct power supply. A Pi 4 you already own is worth testing before buying a new board; a Pi 5 with 4GB is a reasonable target for a dashboard plus light sequential API work, not a measured hardware requirement. Check current total kit prices against a used mini PC before buying. For Pi 5, the manufacturer recommends its 27W USB-C supply; display output uses micro-HDMI. Prefer an SSD for frequent logs/writes. The monitor can sleep independently.

After installing Node/pnpm on the Pi, clone the repo into `/opt/outreach`, install and build there (do not copy macOS node_modules), create a dedicated `outreach` Linux user, and adapt `deploy/outreach.service` to the actual Node path. Install the service in `/etc/systemd/system/`, then enable/start it with systemctl. It starts on boot and restarts after failure. It binds only to loopback: open Chromium on the Pi at localhost:3000. For access from other devices, configure authenticated private networking or an HTTPS reverse proxy; do not expose the development server directly.

`pnpm start` serves the production build with a small Node adapter. Build-time VITE_ values contain only public connection configuration; private API keys for future workers must stay in protected server-only `.env` files. Use an explicit worker schedule, per-campaign 25-lead cap, spending limits, retries with backoff, idempotent jobs and event logging when implementing later milestones. 24/7 availability does not mean constantly generating leads. Home power/internet outages pause work; use a UPS if continuous operation becomes important.

Milestone 1 starts no campaign loop, background worker, or Gmail integration. Those arrive in the prescribed order after this foundation has run against Supabase.

References: [TanStack setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch), [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Raspberry Pi 5](https://www.raspberrypi.com/products/raspberry-pi-5/), [Pi setup](https://www.raspberrypi.com/documentation/computers/getting-started.html).
