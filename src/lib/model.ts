import { z } from 'zod'
export const editSchema = z.object({subject:z.string().trim().min(1).max(200),body:z.string().trim().min(1).max(5000)})
export const rejectionSchema = z.string().trim().min(3,'Please give a reason of at least 3 characters.').max(1000)
export type Draft = {id:string;lead_id:string;subject:string;body:string;channel:'email'|'walk_in_note';status:'pending'|'edited'|'rejected'|'approved';leads:{name:string;category:string;address:string;website:string|null;contact_email:string|null;audits:{hook:string;issues:string[];mobile_score:number|null}[]}}
export function pendingDrafts(drafts:Draft[]){return drafts.filter(d=>d.status==='pending'||d.status==='edited')}
