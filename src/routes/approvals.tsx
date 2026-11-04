import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/approvals')({validateSearch:(search:Record<string,unknown>)=>({preview:search.preview==='true'||search.preview===true}),component:Approvals})
function Approvals(){const {preview}=Route.useSearch();return <Dashboard page="approvals" preview={preview}/>}
