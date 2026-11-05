import { test } from 'node:test'
import assert from 'node:assert/strict'
import { editSchema, rejectionSchema, pendingDrafts } from '../src/lib/model.ts'
test('blank and oversized messages cannot be saved',()=>{
 assert.equal(editSchema.safeParse({subject:' ',body:'Hello'}).success,false)
 assert.equal(editSchema.safeParse({subject:'Hello',body:'x'.repeat(5001)}).success,false)
 assert.deepEqual(editSchema.parse({subject:' Hello ',body:' Body '}),{subject:'Hello',body:'Body'})
})
test('rejections require meaningful feedback',()=>{
 assert.equal(rejectionSchema.safeParse('  ').success,false)
 assert.equal(rejectionSchema.safeParse('Wrong category').success,true)
})
test('only pending or edited drafts are reviewable',()=>{
 const rows=['pending','edited','approved','rejected'].map((status,i)=>({id:String(i),status}))
 assert.deepEqual(pendingDrafts(rows as Parameters<typeof pendingDrafts>[0]).map(d=>d.id),['0','1'])
})
