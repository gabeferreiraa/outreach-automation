import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/agents')({validateSearch:(s:Record<string,unknown>)=>({preview:s.preview==='true'||s.preview===true}),component:Agents})
function Agents(){const {preview}=Route.useSearch();return <Dashboard page="agents" preview={preview}/>}
