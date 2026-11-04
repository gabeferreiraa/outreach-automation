import { test } from 'node:test'
import assert from 'node:assert/strict'
import { agentState, type WorkspaceEvent } from '../src/lib/workspace.ts'
const event=(type:string,age=0):WorkspaceEvent=>({id:'test',agent:'Writer',type,created_at:new Date(Date.now()-age).toISOString(),payload:{}})
test('a missing live worker is not reported as idle',()=>{
 assert.equal(agentState('Writer',[],false).state,'Not connected')
 assert.equal(agentState('Writer',[],true).state,'Idle')
})
test('stale run starts do not imply a worker is still running',()=>{
 assert.equal(agentState('Writer',[event('run_started',20*60*1000)],false).state,'Unconfirmed')
 assert.equal(agentState('Writer',[event('run_started')],false).state,'Working')
})
test('latest run failure takes priority over earlier completion',()=>{
 assert.equal(agentState('Writer',[event('run_failed'),event('run_completed',1000)],false).state,'Needs attention')
})
