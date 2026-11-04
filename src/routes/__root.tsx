import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import '../styles.css'
import '../command.css'
export const Route = createRootRoute({ head:()=>({meta:[{charSet:'utf-8'},{name:'viewport',content:'width=device-width, initial-scale=1'},{title:'Outreach · Impossible Solutions'}]}), component:()=> <html lang="en"><head><HeadContent/></head><body><Outlet/><Scripts/></body></html> })
