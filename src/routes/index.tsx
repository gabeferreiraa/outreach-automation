import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'
export const Route = createFileRoute('/')({validateSearch:(search:Record<string,unknown>)=>({preview:search.preview==='true'||search.preview===true}),component:Home})
function Home(){const {preview}=Route.useSearch();return <Dashboard page="overview" preview={preview}/>}
