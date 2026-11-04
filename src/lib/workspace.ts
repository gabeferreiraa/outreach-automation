import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Draft } from './model'
export type WorkspaceLead={id:string;name:string;status:string;category:string;contact_email:string|null;address:string}
export type WorkspaceEvent={id:string;agent:string;type:string;created_at:string;payload:Record<string,unknown>}
export type Campaign={id:string;area:string;categories:string[]}
export const agentNames=['Orchestrator','Scout','Auditor','Enricher','Writer','Inbox'] as const
export function useWorkspace(client:SupabaseClient|null,drafts:Draft[]){
 const [leads,setLeads]=useState<WorkspaceLead[]>([]),[events,setEvents]=useState<WorkspaceEvent[]>([]),[campaigns,setCampaigns]=useState<Campaign[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(!!client),[updated,setUpdated]=useState('')
 useEffect(()=>{if(!client)return;let active=true;async function refresh(){try{
  const [l,e,c]=await Promise.all([client!.from('leads').select('id,name,status,category,contact_email,address').order('created_at').limit(1000),client!.from('agent_events').select('id,agent,type,created_at,payload').order('created_at',{ascending:false}).limit(50),client!.from('campaigns').select('id,area,categories').order('created_at',{ascending:false}).limit(10)])
  if(l.error||e.error||c.error)throw new Error(l.error?.message||e.error?.message||c.error?.message)
  if(active){setLeads(l.data||[]);setEvents(e.data||[]);setCampaigns(c.data||[]);setUpdated(new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));setError('')}
 }catch(e){if(active)setError(e instanceof Error?e.message:'Status unavailable')}finally{if(active)setLoading(false)}}void refresh();const interval=setInterval(refresh,30000);return()=>{active=false;clearInterval(interval)}},[client])
 return {leads:client?leads:drafts.map(d=>({id:d.lead_id,name:d.leads.name,status:'drafted',category:d.leads.category,contact_email:d.leads.contact_email,address:d.leads.address})),events,campaigns,error,loading,updated}
}
export function agentState(name:string,events:WorkspaceEvent[],preview:boolean){
 if(preview)return {state:'Idle',task:'Waiting for a campaign',tone:'idle'}
 const event=events.find(e=>e.agent.toLowerCase()===name.toLowerCase())
 if(!event)return {state:'Not connected',task:'No worker registered',tone:'offline'}
 if(event.type==='run_failed')return {state:'Needs attention',task:'Last run failed',tone:'error'}
 if(event.type==='run_completed')return {state:'Idle',task:'Last run completed',tone:'idle'}
 if(event.type==='run_started')return Date.now()-new Date(event.created_at).getTime()<600000?{state:'Working',task:'Processing campaign',tone:'working'}:{state:'Unconfirmed',task:'No recent completion',tone:'offline'}
 return {state:'Unconfirmed',task:'Open agent details',tone:'offline'}
}
