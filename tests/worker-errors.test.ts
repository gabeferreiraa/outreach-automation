import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeWorkerError } from '../src/workers/errors.ts'
test('credit failures explain the required action',()=>{
 assert.match(safeWorkerError({code:'credit_balance_exhausted',status:429}),/Add API credits/)
})
test('provider error messages cannot echo credentials into the event log',()=>{
 const secret='sk-proj-private-test-value'
 assert.equal(safeWorkerError({message:secret}).includes(secret),false)
 assert.equal(safeWorkerError({message:'Google Places request failed (403) '+secret}).includes(secret),false)
})
