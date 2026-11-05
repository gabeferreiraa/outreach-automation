begin;
create table public.workspace_members (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.workspace_members enable row level security;
create policy own_membership on public.workspace_members for select to authenticated using (user_id = (select auth.uid()));
create function public.is_workspace_member() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.workspace_members where user_id = (select auth.uid()));
$$;
revoke all on function public.is_workspace_member() from public;
grant execute on function public.is_workspace_member() to authenticated;

create table public.campaigns(id uuid primary key default gen_random_uuid(),area text not null,categories text[] not null, max_leads int not null default 25 check(max_leads between 1 and 25),created_at timestamptz not null default now());
create table public.leads(id uuid primary key default gen_random_uuid(),campaign_id uuid not null references public.campaigns(id),place_id text unique not null,name text not null,category text not null,address text not null,phone text,website text,contact_email text,rating numeric check(rating between 0 and 5),review_count int check(review_count>=0),is_sample boolean not null default false,status text not null default 'new' check(status in ('new','audited','drafted','approved','contacted','replied','won','lost','walk_in')),created_at timestamptz not null default now());
create table public.audits(lead_id uuid primary key references public.leads(id) on delete cascade,has_website boolean not null,third_party_site boolean not null default false,mobile_score int check(mobile_score between 0 and 100),issues jsonb not null default '[]' check(jsonb_typeof(issues)='array'),hook text not null);
create table public.drafts(id uuid primary key default gen_random_uuid(),lead_id uuid not null references public.leads(id),subject text not null check(length(trim(subject)) between 1 and 200),body text not null check(length(trim(body)) between 1 and 5000),channel text not null check(channel in ('email','walk_in_note')),status text not null default 'pending' check(status in ('pending','approved','rejected','edited')),gmail_draft_id text,decided_at timestamptz,created_at timestamptz not null default now());
create table public.agent_events(id uuid primary key default gen_random_uuid(),agent text not null,lead_id uuid references public.leads(id),type text not null,payload jsonb not null default '{}',created_at timestamptz not null default now());
create table public.upwork_jobs(id uuid primary key default gen_random_uuid(),title text not null,url text not null unique,budget text,posted_at timestamptz,score numeric,reason text,draft_proposal text,status text not null default 'new');
create index leads_campaign_idx on public.leads(campaign_id);
create index drafts_queue_idx on public.drafts(status,created_at);
create index drafts_lead_idx on public.drafts(lead_id);
create index agent_events_lead_idx on public.agent_events(lead_id,created_at desc);
do $$ declare t text; begin
 foreach t in array array['campaigns','leads','audits','drafts','agent_events','upwork_jobs'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy member_read on public.%I for select to authenticated using ((select public.is_workspace_member()))',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('revoke insert, update, delete on public.%I from anon, authenticated',t);
 end loop;
end $$;
-- Only this transaction can mutate drafts from the browser. Decisions and their events are atomic.
create function public.review_draft(p_draft_id uuid,p_action text,p_subject text default null,p_body text default null,p_reason text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare d public.drafts;
begin
 if not public.is_workspace_member() then raise exception 'Workspace access required'; end if;
 select * into d from public.drafts where id=p_draft_id for update;
 if not found then raise exception 'Draft not found'; end if;
 if d.status not in ('pending','edited') then raise exception 'Draft already decided'; end if;
 if p_action='edit' then
  if p_subject is null or length(trim(p_subject)) not between 1 and 200 or p_body is null or length(trim(p_body)) not between 1 and 5000 then raise exception 'Invalid subject or message'; end if;
  update public.drafts set subject=trim(p_subject),body=trim(p_body),status='edited' where id=p_draft_id;
 elsif p_action='reject' then
  if p_reason is null or length(trim(p_reason)) not between 3 and 1000 then raise exception 'A rejection reason is required'; end if;
  update public.drafts set status='rejected',decided_at=now() where id=p_draft_id;
 else raise exception 'Unsupported decision. Gmail approval is not enabled.';
 end if;
 insert into public.agent_events(agent,lead_id,type,payload) values('human',d.lead_id,'draft_'||p_action,jsonb_build_object('draft_id',d.id,'actor_id',auth.uid(),'reason',p_reason,'previous_subject',d.subject,'previous_body',d.body,'subject',p_subject,'body',p_body));
end $$;
revoke all on function public.review_draft(uuid,text,text,text,text) from public;
grant execute on function public.review_draft(uuid,text,text,text,text) to authenticated;
alter publication supabase_realtime add table public.agent_events;
commit;
