import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/campaigns')({validateSearch:(s:Record<string,unknown>)=>({preview:s.preview==='true'||s.preview===true}),component:Campaigns})
function Campaigns(){const {preview}=Route.useSearch();return <Dashboard page="campaigns" preview={preview}/>}
