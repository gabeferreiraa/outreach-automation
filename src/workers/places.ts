import { z } from 'zod'
import { campaignSchema,leadSchema,type DiscoveredLead } from '../lib/campaign.ts'
const responseSchema=z.object({places:z.array(z.object({id:z.string(),displayName:z.object({text:z.string()}),formattedAddress:z.string(),nationalPhoneNumber:z.string().optional(),websiteUri:z.string().optional(),rating:z.number().optional(),userRatingCount:z.number().optional()})).default([]),nextPageToken:z.string().optional()})
export async function discoverPlaces(input:unknown,key:string,fetcher:typeof fetch=fetch):Promise<DiscoveredLead[]>{
 const campaign=campaignSchema.parse(input),found=new Map<string,DiscoveredLead>()
 for(const [index,category] of campaign.categories.entries()){
  const target=Math.min(campaign.max_leads,found.size+Math.ceil((campaign.max_leads-found.size)/(campaign.categories.length-index)))
  let token:string|undefined
  // At most two pages per category and 25 distinct leads across the entire run.
  for(let page=0;page<2&&found.size<target;page++){
   const response=await fetcher('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,nextPageToken'},body:JSON.stringify({textQuery:`${category} near ${campaign.area}`,pageSize:Math.min(20,target-found.size),...(token?{pageToken:token}:{})}),signal:AbortSignal.timeout(20000)})
   if(!response.ok)throw new Error(`Google Places request failed (${response.status}). Check API enablement, billing, key restrictions, and quota.`)
   const data=responseSchema.parse(await response.json())
   for(const p of data.places){if(found.size>=target)break;if(!found.has(p.id))found.set(p.id,leadSchema.parse({place_id:p.id,name:p.displayName.text,category,address:p.formattedAddress,phone:p.nationalPhoneNumber||null,website:p.websiteUri||null,rating:p.rating??null,review_count:p.userRatingCount??null}))}
   token=data.nextPageToken;if(!token)break
  }
  if(found.size>=campaign.max_leads)break
 }
 return [...found.values()]
}
