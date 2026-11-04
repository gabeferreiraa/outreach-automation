import { z } from 'zod'
export const categories=['restaurant','cafe','barber','nail salon','bicycle store','food truck'] as const
export const campaignSchema=z.object({area:z.string().trim().min(3).max(200),categories:z.array(z.enum(categories)).min(1).max(6).transform(v=>[...new Set(v)]),max_leads:z.number().int().min(1).max(25)})
export const jobSchema=campaignSchema.extend({id:z.uuid(),campaign_id:z.uuid()})
export const leadSchema=z.object({place_id:z.string().min(1),name:z.string().min(1),category:z.enum(categories),address:z.string().min(1),phone:z.string().nullable(),website:z.string().url().nullable(),rating:z.number().min(0).max(5).nullable(),review_count:z.number().int().nonnegative().nullable()})
export type DiscoveredLead=z.infer<typeof leadSchema>
