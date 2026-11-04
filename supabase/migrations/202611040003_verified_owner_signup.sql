create table public.workspace_owner_emails(email text primary key check(email=lower(email)));
alter table public.workspace_owner_emails enable row level security;
revoke all on public.workspace_owner_emails from anon,authenticated;
create function public.guard_workspace_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.workspace_owner_emails where email=lower(new.email)) then raise exception 'This workspace is private. Use the configured owner email.';end if;
 return new;
end $$;
revoke all on function public.guard_workspace_signup() from public,anon,authenticated;
create trigger guard_workspace_signup before insert or update of email on auth.users for each row execute function public.guard_workspace_signup();
create function public.sync_verified_workspace_owner() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.email_confirmed_at is not null and exists(select 1 from public.workspace_owner_emails where email=lower(new.email)) then
 insert into public.workspace_members(user_id) values(new.id) on conflict do nothing;
 else delete from public.workspace_members where user_id=new.id;
 end if;
 return new;
end $$;
revoke all on function public.sync_verified_workspace_owner() from public,anon,authenticated;
create trigger sync_verified_workspace_owner after insert or update of email,email_confirmed_at on auth.users for each row execute function public.sync_verified_workspace_owner();
