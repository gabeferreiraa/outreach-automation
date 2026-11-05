create or replace function public.claim_scout_run(p_worker_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.campaign_runs; campaign public.campaigns;
begin
 if not exists(select 1 from public.worker_status where agent='Scout' and worker_id=p_worker_id and state<>'offline' and last_seen>now()-interval '45 seconds') then raise exception 'Scout worker lease is inactive';end if;
 select * into job from public.campaign_runs where status='queued' order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 update public.campaign_runs set status='running',worker_id=p_worker_id,started_at=now() where id=job.id;
 select * into campaign from public.campaigns where id=job.campaign_id;
 insert into public.agent_events(agent,type,payload) values('Scout','run_started',jsonb_build_object('run_id',job.id,'campaign_id',campaign.id));
 return jsonb_build_object('id',job.id,'campaign_id',campaign.id,'area',campaign.area,'categories',campaign.categories,'max_leads',campaign.max_leads);
end $$;
revoke all on function public.claim_scout_run(uuid) from public,anon,authenticated;
grant execute on function public.claim_scout_run(uuid) to service_role;
