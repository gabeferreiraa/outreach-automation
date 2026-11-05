export function safeWorkerError(error:unknown):string{
 const detail=error&&typeof error==='object'?error as {code?:unknown;status?:unknown;message?:unknown}:{}
 if(detail.code==='credit_balance_exhausted'||detail.code==='insufficient_quota')return 'OpenAI API credits are exhausted. Add API credits in OpenAI Billing, then start a new campaign.'
 if(detail.status===401)return 'OpenAI rejected the worker key. Check the private OpenAI key configuration.'
 if(detail.status===403)return 'OpenAI access is restricted. Check Responses API permission and model access.'
 if(detail.status===429)return 'OpenAI rate limit reached. Wait before starting another campaign.'
 if(typeof detail.message==='string'&&/^Google Places request failed \(\d{3}\)/.test(detail.message))return detail.message.match(/^Google Places request failed \(\d{3}\)/)![0]+'. Check API enablement, key restrictions, billing, and quota.'
 return 'Discovery failed. Check worker credentials, provider availability, and the campaign settings.'
}
