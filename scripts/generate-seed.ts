import { writeFileSync } from 'node:fs'
import { sampleDrafts } from '../src/lib/samples.ts'
const quote = (value:string|null|number) => value === null ? 'null' : typeof value === 'number' ? String(value) : "'"+value.replaceAll("'","''")+"'"
const campaign='00000000-0000-4000-8000-000000000001'
const rows=[`-- Fictional fixtures only. Never use these recipients for outreach.\nbegin;`, `insert into public.campaigns(id,area,categories) values('${campaign}','SAMPLE — fictional Philadelphia businesses',array['cafe','bicycle store','barber','restaurant','food truck']) on conflict(id) do nothing;`]
sampleDrafts.forEach((d,i)=>{
 const id=`10000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`, draftId=`20000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`, l=d.leads, a=l.audits[0]
 rows.push(`insert into public.leads(id,campaign_id,place_id,name,category,address,website,contact_email,is_sample,status) values('${id}','${campaign}',${quote(d.lead_id)},${quote(l.name)},${quote(l.category)},${quote(l.address)},${quote(l.website)},${quote(l.contact_email)},true,'drafted') on conflict(id) do nothing;`)
 rows.push(`insert into public.audits(lead_id,has_website,mobile_score,issues,hook) values('${id}',${!!l.website},${quote(a.mobile_score)},${quote(JSON.stringify(a.issues))}::jsonb,${quote(a.hook)}) on conflict(lead_id) do nothing;`)
 rows.push(`insert into public.drafts(id,lead_id,subject,body,channel) values('${draftId}','${id}',${quote(d.subject)},${quote(d.body)},${quote(d.channel)}) on conflict(id) do nothing;`)
})
rows.push(`insert into public.agent_events(agent,type,payload) select 'seed','sample_queue_created','{"sample":true,"count":5}'::jsonb where not exists(select 1 from public.agent_events where type='sample_queue_created');`, 'commit;')
writeFileSync('supabase/seed.sql',rows.join('\n'))
