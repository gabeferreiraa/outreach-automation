import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { jobSchema } from '../src/lib/campaign.ts'
import { runScout } from '../src/workers/scout.ts'
const required=['VITE_SUPABASE_URL','SUPABASE_SECRET_KEY','GOOGLE_PLACES_API_KEY','OPENAI_API_KEY'] as const
const missing=required.filter(name=>!process.env[name])
if(missing.length){console.error('Scout is not connected. Add these server-only settings to .env: '+missing.join(', '));process.exit(1)}
if(process.argv.includes('--check')){console.log('Required worker settings are present. No API calls made.');process.exit(0)}
const db=createClient(process.env.VITE_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false,autoRefreshToken:false}}),workerId=randomUUID()
let stopped=false,state:'idle'|'running'|'error'|'offline'='idle',task='Waiting for a campaign',processed=0,lastRun:string|null=null,currentRun:string|null=null
async function heartbeat(){const {data,error}=await db.from('worker_status').update({state,task,last_seen:new Date().toISOString(),items_processed:processed,last_run:lastRun}).eq('agent','Scout').eq('worker_id',workerId).select('agent');if(error)throw error;if(!data?.length)throw new Error('Worker lease was lost')}
async function log(type:string,payload:Record<string,unknown>){const {error}=await db.from('agent_events').insert({agent:'Scout',type,payload});if(error)throw error}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true})
const registration=await db.rpc('register_scout_worker',{p_worker_id:workerId});if(registration.error)throw registration.error
await heartbeat();await log('worker_connected',{worker_id:workerId});console.log('Scout connected. Waiting for campaigns. Nothing sends email.')
let heartbeating=false
const pulse=setInterval(()=>{if(heartbeating)return;heartbeating=true;void heartbeat().catch(()=>{console.error('Worker heartbeat failed; stopping to avoid untracked work.');stopped=true}).finally(()=>{heartbeating=false})},15000)
try{while(!stopped){
 const {data,error}=await db.rpc('claim_scout_run',{p_worker_id:workerId});if(error)throw error
 if(!data){await delay(2500);continue}
 const job=jobSchema.parse(data);currentRun=job.id;state='running';task=`Finding businesses · ${job.area}`;lastRun=new Date().toISOString();await heartbeat()
 try{
  const leads=await runScout(job,process.env.GOOGLE_PLACES_API_KEY!)
  const result=await db.rpc('finish_scout_run',{p_run_id:job.id,p_worker_id:workerId,p_leads:leads});if(result.error)throw result.error
  processed+=Number(result.data);state='idle';task='Waiting for a campaign';console.log(`Scout completed: ${result.data} new leads saved.`)
 }catch{
  // Provider errors may contain request details; keep credentials and raw payloads out of logs.
  const message='Discovery failed. Check worker credentials, Google billing/quota, and provider availability.'
  const failed=await db.from('campaign_runs').update({status:'failed',finished_at:new Date().toISOString(),error:message}).eq('id',job.id).eq('worker_id',workerId).eq('status','running');if(failed.error)throw failed.error
  await log('run_failed',{run_id:job.id,message});state='error';task=message;console.error(message)
 }
 currentRun=null;await heartbeat()
}}finally{clearInterval(pulse);if(currentRun){await db.from('campaign_runs').update({status:'failed',error:'Worker stopped before completion',finished_at:new Date().toISOString()}).eq('id',currentRun).eq('worker_id',workerId).eq('status','running')};state='offline';task='Worker stopped';await heartbeat();await log('worker_disconnected',{worker_id:workerId})}
