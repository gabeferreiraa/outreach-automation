begin;
create table public.worker_status(agent text primary key,state text not null check(state in ('idle','running','error','offline')),task text,last_seen timestamptz not null default now(),last_run timestamptz,items_processed int not null default 0 check(items_processed>=0),worker_id uuid not null);
create table public.campaign_runs(id uuid primary key default gen_random_uuid(),campaign_id uuid not null references public.campaigns(id),status text not null default 'queued' check(status in ('queued','running','completed','failed')),worker_id uuid,started_at timestamptz,finished_at timestamptz,lead_count int not null default 0,error text,created_at timestamptz not null default now());
create unique index one_open_scout_run on public.campaign_runs(campaign_id) where status in ('queued','running');
create index campaign_runs_queue on public.campaign_runs(status,created_at);
alter table public.worker_status enable row level security;
alter table public.campaign_runs enable row level security;
create policy member_read on public.worker_status for select to authenticated using ((select public.is_workspace_member()));
create policy member_read on public.campaign_runs for select to authenticated using ((select public.is_workspace_member()));
revoke all on public.worker_status,public.campaign_runs from anon,authenticated;
grant select on public.worker_status,public.campaign_runs to authenticated;
grant all on public.worker_status,public.campaign_runs to service_role;
create function public.queue_scout_campaign(p_area text,p_categories text[],p_max_leads int) returns uuid language plpgsql security definer set search_path='' as $$
declare campaign uuid; run_id uuid;
begin
 if not public.is_workspace_member() then raise exception 'Workspace access required';end if;
 if length(trim(p_area)) not between 3 and 200 or p_area is null or p_max_leads is null or p_max_leads not between 1 and 25 or cardinality(p_categories) not between 1 and 6 or p_categories is null or array_position(p_categories,null) is not null or not (p_categories <@ array['restaurant','cafe','barber','nail salon','bicycle store','food truck']) then raise exception 'Invalid campaign';end if;
 if exists(select 1 from public.campaign_runs where status in ('queued','running')) then raise exception 'Finish the queued or running campaign before starting another';end if;
 insert into public.campaigns(area,categories,max_leads) values(trim(p_area),p_categories,p_max_leads) returning id into campaign;
 insert into public.campaign_runs(campaign_id) values(campaign) returning id into run_id;
 insert into public.agent_events(agent,type,payload) values('Scout','run_queued',jsonb_build_object('run_id',run_id,'campaign_id',campaign,'actor_id',auth.uid()));
 return run_id;
end $$;
revoke all on function public.queue_scout_campaign(text,text[],int) from public,anon;
grant execute on function public.queue_scout_campaign(text,text[],int) to authenticated;
create function public.claim_scout_run(p_worker_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.campaign_runs; campaign public.campaigns;
begin
 select * into job from public.campaign_runs where status='queued' order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 update public.campaign_runs set status='running',worker_id=p_worker_id,started_at=now() where id=job.id;
 select * into campaign from public.campaigns where id=job.campaign_id;
 insert into public.agent_events(agent,type,payload) values('Scout','run_started',jsonb_build_object('run_id',job.id,'campaign_id',campaign.id));
 return jsonb_build_object('id',job.id,'campaign_id',campaign.id,'area',campaign.area,'categories',campaign.categories,'max_leads',campaign.max_leads);
end $$;
revoke all on function public.claim_scout_run(uuid) from public,anon,authenticated;
grant execute on function public.claim_scout_run(uuid) to service_role;
create function public.finish_scout_run(p_run_id uuid,p_worker_id uuid,p_leads jsonb) returns int language plpgsql security definer set search_path='' as $$
declare job public.campaign_runs; cap int; added int;
begin
 select * into job from public.campaign_runs where id=p_run_id for update;
 if not found or job.status<>'running' or job.worker_id<>p_worker_id then raise exception 'Run is not owned by this worker';end if;
 select max_leads into cap from public.campaigns where id=job.campaign_id;
 if jsonb_typeof(p_leads)<>'array' or jsonb_array_length(p_leads)>cap then raise exception 'Lead cap exceeded';end if;
 insert into public.leads(campaign_id,place_id,name,category,address,phone,website,rating,review_count,status)
 select job.campaign_id,x.place_id,x.name,x.category,x.address,x.phone,x.website,x.rating,x.review_count,'new'
 from jsonb_to_recordset(p_leads) as x(place_id text,name text,category text,address text,phone text,website text,rating numeric,review_count int)
 on conflict(place_id) do nothing;
 get diagnostics added=row_count;
 update public.campaign_runs set status='completed',finished_at=now(),lead_count=added where id=job.id;
 insert into public.agent_events(agent,type,payload) values('Scout','run_completed',jsonb_build_object('run_id',job.id,'campaign_id',job.campaign_id,'items_processed',added,'discovered',jsonb_array_length(p_leads)));
 return added;
end $$;
revoke all on function public.finish_scout_run(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_scout_run(uuid,uuid,jsonb) to service_role;
alter publication supabase_realtime add table public.worker_status,public.campaign_runs;
commit;
