-- Fictional fixtures only. Never use these recipients for outreach.
begin;
insert into public.campaigns(id,area,categories) values('00000000-0000-4000-8000-000000000001','SAMPLE — fictional Philadelphia businesses',array['cafe','bicycle store','barber','restaurant','food truck']) on conflict(id) do nothing;
insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','sample-lead-1','Juniper Coffee — SAMPLE','cafe','100 Example Ave, Philadelphia','https://example.com','hello@example.com',true,'drafted') on conflict(id) do nothing;
insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('10000000-0000-4000-8000-000000000001',true,38,'["The sample menu is an image that is difficult to read on a phone."]'::jsonb,'The sample menu is an image that is difficult to read on a phone.') on conflict(lead_id) do nothing;
insert into public.drafts(id,lead_id,subject,body,channel) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','A quick idea for Juniper Coffee','Hi there,

I''m Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions.

The sample menu is an image that is difficult to read on a phone.

I help local shops with a Starter Site. If you''re open to it, I''m happy to stop by for a quick chat or set up a short call, whichever is easier.

Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[Add physical mailing address before sending] · Reply "no thanks" and I won''t follow up.','email') on conflict(id) do nothing;
insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','sample-lead-2','Westside Bicycle — SAMPLE','bicycle store','102 Example Ave, Philadelphia','https://example.org','service@example.org',true,'drafted') on conflict(id) do nothing;
insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('10000000-0000-4000-8000-000000000002',true,54,'["The sample website does not explain how to book a repair."]'::jsonb,'The sample website does not explain how to book a repair.') on conflict(lead_id) do nothing;
insert into public.drafts(id,lead_id,subject,body,channel) values('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','A quick idea for Westside Bicycle','Hi there,

I''m Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions.

The sample website does not explain how to book a repair.

I help local shops with a Starter Site. If you''re open to it, I''m happy to stop by for a quick chat or set up a short call, whichever is easier.

Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[Add physical mailing address before sending] · Reply "no thanks" and I won''t follow up.','email') on conflict(id) do nothing;
insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','sample-lead-3','Sunday Barber — SAMPLE','barber','104 Example Ave, Philadelphia',null,null,true,'drafted') on conflict(id) do nothing;
insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('10000000-0000-4000-8000-000000000003',false,null,'["This fictional business has no dedicated website."]'::jsonb,'This fictional business has no dedicated website.') on conflict(lead_id) do nothing;
insert into public.drafts(id,lead_id,subject,body,channel) values('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','A quick idea for Sunday Barber','Hi there,

I''m Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions.

This fictional business has no dedicated website.

I help local shops with a Starter Site. If you''re open to it, I''m happy to stop by for a quick chat or set up a short call, whichever is easier.

Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[Add physical mailing address before sending] · Reply "no thanks" and I won''t follow up.','walk_in_note') on conflict(id) do nothing;
insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','sample-lead-4','Golden Bowl — SAMPLE','restaurant','106 Example Ave, Philadelphia','https://example.net','team@example.net',true,'drafted') on conflict(id) do nothing;
insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('10000000-0000-4000-8000-000000000004',true,42,'["The sample ordering link opens a broken page."]'::jsonb,'The sample ordering link opens a broken page.') on conflict(lead_id) do nothing;
insert into public.drafts(id,lead_id,subject,body,channel) values('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','A quick idea for Golden Bowl','Hi there,

I''m Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions.

The sample ordering link opens a broken page.

I help local shops with a Care Plan. If you''re open to it, I''m happy to stop by for a quick chat or set up a short call, whichever is easier.

Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[Add physical mailing address before sending] · Reply "no thanks" and I won''t follow up.','email') on conflict(id) do nothing;
insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','sample-lead-5','Rolling Kitchen — SAMPLE','food truck','108 Example Ave, Philadelphia',null,null,true,'drafted') on conflict(id) do nothing;
insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('10000000-0000-4000-8000-000000000005',false,null,'["The sample profile has no weekly location schedule."]'::jsonb,'The sample profile has no weekly location schedule.') on conflict(lead_id) do nothing;
insert into public.drafts(id,lead_id,subject,body,channel) values('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','A quick idea for Rolling Kitchen','Hi there,

I''m Gabe, a senior at Drexel studying User Experience & Interaction Design. I also run a small web design studio, Impossible Solutions.

The sample profile has no weekly location schedule.

I help local shops with a Truck Page. If you''re open to it, I''m happy to stop by for a quick chat or set up a short call, whichever is easier.

Thanks,
Gabe
— Gabriel Ferreira, Founder, Impossible Solutions LLC · impossiblesolutions.studio
[Add physical mailing address before sending] · Reply "no thanks" and I won''t follow up.','walk_in_note') on conflict(id) do nothing;
insert into public.agent_events(agent,type,payload) select 'seed','sample_queue_created','{"sample":true,"count":5}'::jsonb where not exists(select 1 from public.agent_events where type='sample_queue_created');
commit;