begin;
create or replace function public.queue_scout_campaign(p_area text,p_categories text[],p_max_leads int) returns uuid language plpgsql security definer set search_path='' as $$
declare campaign uuid; run_id uuid;
begin
 if not public.is_workspace_member() then raise exception 'Workspace access required';end if;
 if length(trim(p_area)) not between 3 and 200 or p_area is null or p_max_leads is null or p_max_leads not between 1 and 25 or cardinality(p_categories) not between 1 and 6 or p_categories is null or array_position(p_categories,null) is not null or not (p_categories <@ array['restaurant','cafe','barber','nail salon','bicycle store','food truck']) then raise exception 'Invalid campaign';end if;
 perform pg_advisory_xact_lock(470044);
 if not exists(select 1 from public.worker_status where agent='Scout' and state in ('idle','error') and last_seen>now()-interval '45 seconds') then raise exception 'Scout must be online and idle before queuing a campaign';end if;
 if exists(select 1 from public.campaign_runs where status in ('queued','running')) then raise exception 'Finish the queued or running campaign before starting another';end if;
 insert into public.campaigns(area,categories,max_leads) values(trim(p_area),p_categories,p_max_leads) returning id into campaign;
 insert into public.campaign_runs(campaign_id) values(campaign) returning id into run_id;
 insert into public.agent_events(agent,type,payload) values('Scout','run_queued',jsonb_build_object('run_id',run_id,'campaign_id',campaign,'actor_id',auth.uid()));
 return run_id;
end $$;
revoke all on function public.queue_scout_campaign(text,text[],int) from public,anon;
grant execute on function public.queue_scout_campaign(text,text[],int) to authenticated;

create function public.register_scout_worker(p_worker_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(470045);
 if exists(select 1 from public.worker_status where agent='Scout' and worker_id<>p_worker_id and state<>'offline' and last_seen>now()-interval '45 seconds') then raise exception 'Another Scout worker is online';end if;
 update public.campaign_runs set status='failed',finished_at=now(),error='Previous worker stopped before completion' where status='running';
 insert into public.worker_status(agent,state,task,worker_id) values('Scout','idle','Waiting for a campaign',p_worker_id) on conflict(agent) do update set worker_id=p_worker_id,state='idle',task='Waiting for a campaign',last_seen=now();
end $$;
revoke all on function public.register_scout_worker(uuid) from public,anon,authenticated;
grant execute on function public.register_scout_worker(uuid) to service_role;
commit;
