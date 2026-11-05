# Connecting Scout

The Scout worker is connected and a one-business live discovery run passed on November 4, 2026. It saved one real Google Places record and logged queued, started, and completed events before returning to Idle. The original trial encountered exhausted OpenAI API credits; after the owner funded the account, the retry completed. All private keys are in the local ignored `.env`, not in the repository. The worker is currently a local process; an always-on service still needs deployment.

## Accounts and keys

1. **Google Cloud:** the project is `impossible-solutions-outreach`. Its billing account was selected by the owner. Enable **Places API (New)** (`places.googleapis.com`), not the legacy API. Create a dedicated server API key and restrict it to Places API (New). If the worker has a stable public egress IP, restrict it to that IP as well; browser-referrer restrictions will not work for the server worker. Set a modest API quota and a billing budget alert. Budget alerts notify; they are not a hard spending cap.
2. **OpenAI:** create a project API key with available API credit. The Scout defaults to the documented small model `gpt-5-nano`; `SCOUT_MODEL` can override it. A live run is still needed to verify account access to this model. Tracing is disabled; run events are stored in Supabase.
3. **Supabase:** use a server secret key from the dedicated outreach project. It bypasses row-level security and belongs only in the private worker `.env`. Never use it in a `VITE_` variable or commit it.

Add these lines to the existing ignored `.env` file, preserving its two public Supabase settings:

```dotenv
SUPABASE_SECRET_KEY=your_server_secret
GOOGLE_PLACES_API_KEY=your_places_key
OPENAI_API_KEY=your_openai_project_key
SCOUT_MODEL=gpt-5-nano
```

Do not paste keys in chat, screenshots, source files, or the dashboard. The dashboard reads only public connection settings; private keys are loaded by the separate Node worker.

## Start and verify

```sh
pnpm worker:check
pnpm worker
```

`worker:check` validates presence only and does not call providers. The worker claims an exclusive Scout lease, reports a heartbeat every 15 seconds, and waits for work. The dashboard shows a stopped or stale worker as Offline after 45 seconds. Supabase realtime refreshes status/events, with polling as a fallback.

Sign in to the dashboard with the owner email. On Campaigns, start with a 1–3 lead run for `Lancaster Ave, Philadelphia 19104` before increasing the cap. The form is unavailable while Scout is offline. The database allows only one queued/running campaign at a time. Scout searches with official Google Places Text Search (New), divides the lead budget across categories, and persists only records returned by Google. The model must return source IDs exactly; it cannot invent lead details. Duplicate place IDs are not reinserted. Source data is stored by the host after the read-only agent returns, not by an agent mutation tool.

Each run is capped at 25 leads, two pages per selected category, three SDK turns, and bounded model output. Failed runs do not retry automatically. Queued/running/completed/failed events and worker connection events are logged. A replacement worker marks unfinished earlier runs failed instead of silently repeating billed requests. No email API is called. New leads are not yet audited or drafted.

Confirm these outcomes before calling milestone 2 complete:

- Scout changes from Idle to Working and back to Idle.
- The test campaign produces actual Google Places records under Leads.
- A completion event shows the saved lead count.
- Restarting the worker does not duplicate existing place IDs.
- Stopping the process changes the status to Offline.

## Running continuously

`deploy/scout.service` is a systemd template for the Pi or another Linux host. Use a supported Node LTS and the actual Node executable path, install dependencies on that host, keep `.env` readable only by the service user, and run the dashboard and worker as separate services. Do not enable a restart loop until keys are configured. A 24/7 worker waits when no campaign is queued; it does not constantly make paid API calls.

## Remaining milestones

1. Finish owner sign-in/email delivery and perform the live Scout smoke run.
2. Auditor via PageSpeed Insights and Enricher for publicly listed contact information, with source-backed findings.
3. Writer using only saved evidence, under-120-word templates, feedback from rejected drafts, and a valid studio mailing address.
4. Gmail OAuth: read/draft permissions only; approval creates a Gmail draft. The human sends from Gmail. Inbox classifies incoming replies and drafts responses for approval. Add unsubscribe suppression before any follow-up workflow.
5. Leads kanban, filters, and walk-in export; then production hosting, access controls, backups, quotas, and recovery checks.
6. Optional Upwork read-only discovery and proposal drafting. No automated submissions.

References: [Places Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search), [Google key security](https://developers.google.com/maps/api-security-best-practices), [OpenAI GPT-5 nano](https://developers.openai.com/api/docs/models/gpt-5-nano).
