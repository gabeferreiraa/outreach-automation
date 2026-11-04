import { test } from 'node:test'
import assert from 'node:assert/strict'
import { discoverPlaces } from '../src/workers/places.ts'
const campaign={area:'Lancaster Ave, Philadelphia 19104',categories:['cafe','barber'],max_leads:25}
test('discovery shares the cap across categories and never stores more than 25',async()=>{
 const requests:Record<string,unknown>[]=[]
 const fetcher:typeof fetch=async(_url,init)=>{const body=JSON.parse(String(init?.body));requests.push(body);return new Response(JSON.stringify({places:Array.from({length:20},(_,i)=>({id:body.textQuery+'-'+i,displayName:{text:'Source business '+i},formattedAddress:'Source address'}))}))}
 const result=await discoverPlaces(campaign,'test-key',fetcher)
 assert.equal(result.length,25);assert.equal(new Set(result.map(x=>x.category)).size,2);assert.equal(requests.length,2)
 assert.ok(result.every(x=>x.name.startsWith('Source business')))
})
test('repeated place IDs are deduplicated and missing contact facts stay null',async()=>{
 const place={id:'one',displayName:{text:'One'},formattedAddress:'Address'}
 const result=await discoverPlaces({...campaign,max_leads:5},'test-key',async()=>new Response(JSON.stringify({places:[place,place]})))
 assert.equal(result.length,1);assert.equal(result[0].phone,null);assert.equal(result[0].website,null)
})
test('an over-cap campaign is rejected before any provider call',async()=>{
 let called=false;await assert.rejects(discoverPlaces({...campaign,max_leads:26},'test',async()=>{called=true;return new Response('{}')}));assert.equal(called,false)
})
test('provider failure reports a safe actionable message without echoing credentials',async()=>{
 await assert.rejects(discoverPlaces(campaign,'secret-key',async()=>new Response('secret-key',{status:403})),e=>e instanceof Error&&e.message.includes('403')&&!e.message.includes('secret-key'))
})
