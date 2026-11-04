# Impossible Solutions Outreach

Milestone 1: a TanStack Start / React / TypeScript dashboard, Supabase migrations, and five explicitly fictional lead fixtures. The Overview home page brings together review counts, the lead pipeline, campaign context, agent availability, and recent activity. `/approvals` is the focused editing and rejection queue. No email-sending code or agents run in this milestone.

Use `/?preview=true` to explore the Overview with fictional data even when the local app is connected to Supabase. Preview mode never reads or changes the connected database. It stays clearly labeled and links to the sample approval queue. The normal home page requires owner sign-in. Overview snapshots refresh automatically every 30 seconds. Every overview item navigates to detail; there are no editing or review actions on the home screen. Business rows deep-link to their matching draft. Agents, Leads, and Campaigns have read-only detail pages while later milestones implement their workflows.

The sidebar collapses into an icon rail and remembers its state locally. The overview was measured at 907 × 712 with both navigation states: document dimensions matched the viewport with no scroll. Narrow/mobile screens stack panels to keep content readable. The visual hierarchy follows visibility of system status, recognition over recall, and minimalist presentation from [Nielsen's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): status first, named businesses and next steps second, pipeline and events third. Text accompanies status colors; links have focus outlines and descriptive labels, and sidebar control exposes its expanded state.

Live workers with no events are shown as Not connected, not Idle. Explicit run events distinguish Working, Idle, and Needs attention; a start event without completion after ten minutes becomes Unconfirmed. Preview Idle states are labeled examples. No workers run in milestone 1. Six tests cover validation, queue eligibility, missing-worker reporting, stale status, and failure priority.

## Run locally

Use Node 22.12+ (22 LTS recommended) and pnpm 10.30.3.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Without Supabase environment variables the app shows five fictional samples. Sample edits/rejections last for the current page session only; reload resets them. This is a preview, not a second database. E opens editing; R opens rejection feedback. A explains why approval is unavailable. Gmail approval is deliberately disabled until milestone 5.

## Connect a dedicated Supabase project

1. Create a dedicated project, then apply all files in `supabase/migrations/` in order and run `supabase/seed.sql`. The seed is idempotent.
2. Add your lowercase owner email to `public.workspace_owner_emails` using the SQL editor. This private table controls who can register. New users do not gain workspace membership until their email is verified.
3. Keep email confirmation enabled. Configure the Auth Site URL and redirect allowlist for `http://localhost:3000` and your eventual production URL. Email signup must remain enabled for the first passwordless owner login; database triggers reject any email outside the owner allowlist.
4. Copy `.env.example` to `.env` and fill the project URL and **publishable key**, never a service-role key. Restart `pnpm dev`. Enter your owner email and request a sign-in link. You must open that link yourself. Supabase default email delivery can restrict recipients; if the project reports an email delivery restriction, configure an approved SMTP provider before retrying.

## Current setup

A dedicated project, `Impossible Solutions Outreach` (`ibvwzirhrvpkgvzwwrbc`, us-east-1), is provisioned and seeded with five fictional leads. The local ignored `.env` connects to it. Owner access is configured for the email chosen during setup. No login email was sent by the agent.

Live database verification passed for member reads, atomic edit/rejection events, terminal-state protection, denied direct browser writes, non-member isolation, anonymous function restrictions, and verified-owner provisioning. Verification transactions were rolled back. The owner still needs to complete passwordless sign-in in their own browser.

The database uses row-level security and an explicit workspace membership allowlist. Browser clients can read only as an allowed member. Edits and rejections go through `review_draft`, which locks the draft and records its decision event in the same transaction. Direct browser writes to business tables are revoked. Unsupported actions, including approval, are rejected by the database. Agent events are included in the realtime publication for milestone 4. Connected-database checks are recorded above.

## Validation

```sh
pnpm check
pnpm test
pnpm build
pnpm start
```

Tests cover validation and queue eligibility. The browser sample flow was exercised for selecting, editing, saving, rejecting, and updating counts. Database permissions and atomic decision behavior were verified after provisioning. Dependency versions are pinned and the lockfile is committed. The Sonatype service was unavailable during setup; its additional dependency review remains outstanding.

## A Raspberry Pi running 24/7

A Pi can host the dashboard and later a separate scheduled worker. The monitor is optional: it can display the dashboard, but the worker continues without a browser or monitor. API calls run on OpenAI/Google infrastructure; the Pi does not need to run a local language model. Supabase remains the database.

Use 64-bit Raspberry Pi OS, a supported Node LTS, stable networking and storage, cooling, and the correct power supply. A Pi 4 you already own is worth testing before buying a new board; a Pi 5 with 4GB is a reasonable target for a dashboard plus light sequential API work, not a measured hardware requirement. Check current total kit prices against a used mini PC before buying. For Pi 5, the manufacturer recommends its 27W USB-C supply; display output uses micro-HDMI. Prefer an SSD for frequent logs/writes. The monitor can sleep independently.

After installing Node/pnpm on the Pi, clone the repo into `/opt/outreach`, install and build there (do not copy macOS node_modules), create a dedicated `outreach` Linux user, and adapt `deploy/outreach.service` to the actual Node path. Install the service in `/etc/systemd/system/`, then enable/start it with systemctl. It starts on boot and restarts after failure. It binds only to loopback: open Chromium on the Pi at localhost:3000. For access from other devices, configure authenticated private networking or an HTTPS reverse proxy; do not expose the development server directly.

`pnpm start` serves the production build with a small Node adapter. Build-time VITE_ values contain only public connection configuration; private API keys for future workers must stay in protected server-only `.env` files. Use an explicit worker schedule, per-campaign 25-lead cap, spending limits, retries with backoff, idempotent jobs and event logging when implementing later milestones. 24/7 availability does not mean constantly generating leads. Home power/internet outages pause work; use a UPS if continuous operation becomes important.

Milestone 1 starts no campaign loop, background worker, or Gmail integration. Those arrive in the prescribed order after this foundation has run against Supabase.

References: [TanStack setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch), [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Raspberry Pi 5](https://www.raspberrypi.com/products/raspberry-pi-5/), [Pi setup](https://www.raspberrypi.com/documentation/computers/getting-started.html).
