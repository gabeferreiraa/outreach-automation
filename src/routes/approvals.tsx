import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/approvals')({validateSearch:(search:Record<string,unknown>)=>({preview:search.preview==='true'||search.preview===true,lead:typeof search.lead==='string'?search.lead:undefined}),component:Approvals})
function Approvals(){const {preview,lead}=Route.useSearch();return <Dashboard page="approvals" preview={preview} initialLead={lead}/>}
