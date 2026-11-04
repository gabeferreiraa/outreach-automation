import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/leads')({validateSearch:(s:Record<string,unknown>)=>({preview:s.preview==='true'||s.preview===true}),component:Leads})
function Leads(){const {preview}=Route.useSearch();return <Dashboard page="leads" preview={preview}/>}
