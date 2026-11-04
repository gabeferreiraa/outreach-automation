# Impossible Solutions — Outreach Agent System

You are building a small, always-on lead-generation system for Impossible Solutions LLC, a one-person web design studio in Philadelphia (near Drexel / Lancaster Ave). Agents find local businesses with missing or weak websites, research a specific hook for each, and draft a personalized email. **Nothing is ever sent automatically.** Every outbound action waits in an approval queue on a dashboard.

## Stack (do not substitute)
- TypeScript everywhere, pnpm
- TanStack Start (React) for the dashboard
- Supabase (Postgres + auth + realtime) for all state
- `@openai/agents` (OpenAI Agents SDK, TypeScript) for agents. Use `needsApproval` on any tool with side effects.
- Zod for every tool's parameters and every agent's structured output
- Check current OpenAI docs for model names. Use the cheapest small model for Scout/Auditor/Enricher/Classifier and a stronger model only for Writer.

## Hard rules
1. No agent sends email. "Approve" on the dashboard creates a **Gmail draft** via the Gmail API (`gmail.compose` scope). The human sends from Gmail.
2. Gmail access for the main inbox is read + draft only. Never request `gmail.send` in v1.
3. Use official APIs only: Google Places API (New) for discovery, PageSpeed Insights API for site checks. No scraping Google Maps.
4. Never invent facts in an email. The Writer may only reference fields stored on the lead (reviews snippets, site audit findings).
5. Upwork: read-only job discovery + proposal drafting. Never automate submission or log in to Upwork.
6. Every agent run and every human decision is logged to `agent_events`.
7. Secrets in `.env` only. Never commit them.

## Agents
| Agent | Input | Output | Side effects |
|---|---|---|---|
| Orchestrator | a "campaign" (area + categories) | runs the agents below in order, per lead | none |
| Scout | campaign | new rows in `leads` (name, address, phone, website, rating, review count, place_id, category) | none |
| Auditor | lead | `audit`: has_website, website_is_third_party_ordering, mobile_score, issues[], hook (one specific sentence from reviews or site, e.g. "reviews mention not getting a call when the bike is ready") | none |
| Enricher | lead with website | contact email if publicly listed on the site's contact/about page; else null + "walk-in" flag | none |
| Writer | lead + audit + templates | `drafts` row: subject, body, channel (email or walk_in_note) | none |
| Inbox | new Gmail messages | classify replies: interested / not_now / unsubscribe / other; draft a reply | create Gmail draft (needsApproval) |

Package tiers the Writer may reference: Review Kit (NFC/QR tap-to-review), Google Profile Fix, Truck Page, Starter Site, Care Plan. Never quote prices in a first email.

## Database (Supabase)
- `campaigns` (id, area, categories[], created_at)
- `leads` (id, campaign_id, place_id unique, name, category, address, phone, website, rating, review_count, status: new|audited|drafted|approved|contacted|replied|won|lost|walk_in, created_at)
- `audits` (lead_id, has_website, third_party_site, mobile_score, issues jsonb, hook)
- `drafts` (id, lead_id, subject, body, channel, status: pending|approved|rejected|edited, gmail_draft_id, decided_at)
- `agent_events` (id, agent, lead_id, type, payload jsonb, created_at)
- `upwork_jobs` (id, title, url, budget, posted_at, score, reason, draft_proposal, status)

## Dashboard pages
1. **Approvals** (home): cards for pending drafts, each with lead info, hook, editable subject/body, buttons Approve → Gmail draft / Edit / Reject (with reason, fed back to Writer). Keyboard shortcuts A / E / R.
2. **Agents**: one tile per agent showing status (idle/running/error), last run, items processed, live event feed via Supabase realtime.
3. **Leads**: kanban by status, filter by category, "Walk-in list" export for leads with no email.
4. **Campaigns**: form to start a run (area, categories, max leads).
5. **Upwork** (milestone 6): scored jobs with drafted proposals and an "Open on Upwork" link. No submit button.

## Milestones (build in order, each must run before the next)
1. Repo scaffold, Supabase schema + migrations, seed 5 fake leads, Approvals page renders them.
2. Scout via Places API → real leads for "Lancaster Ave, Philadelphia 19104" (categories: restaurant, cafe, barber, nail salon, bicycle store, food truck). Cap 25 per run.
3. Auditor + Enricher.
4. Writer → Approvals queue end to end. Agents page with live feed.
5. Google OAuth + Gmail: Approve creates a draft; Inbox agent classifies replies.
6. Upwork scout (RSS/saved-search alerts or manual paste of job URLs), scoring + proposal drafts.

## Email template (Writer adapts this, keeps it under 120 words)
Hi [name or "there"],
I'm Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions. [one line on walking past / being a customer, only if true for the area]
[the hook: one specific, true observation]
I help local shops with [the one package that fits the hook]. If you're open to it, I'm happy to stop by for a quick chat or set up a short call, whichever is easier.
Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[physical mailing address] · Reply "no thanks" and I won't follow up.

## Done means
`pnpm dev` starts the dashboard; starting a campaign fills the Approvals queue with real, accurate drafts; approving one creates a Gmail draft; every step shows in the Agents feed.
