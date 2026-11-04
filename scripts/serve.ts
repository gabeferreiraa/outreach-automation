import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { Readable } from 'node:stream'
const root=resolve('dist/client')
const entry=await import(resolve('dist/server/server.js'))
const types:Record<string,string>={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'}
const port=Number(process.env.PORT||3000), host=process.env.HOST||'127.0.0.1'
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',`http://${host}:${port}`)
  if(url.pathname.startsWith('/assets/')){
   const file=resolve(root,'.'+decodeURIComponent(url.pathname))
   if(!file.startsWith(root+sep)){res.writeHead(403).end();return}
   try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable'});res.end(req.method==='HEAD'?undefined:bytes)}catch{res.writeHead(404).end('Not found')}
   return
  }
  const init:RequestInit & {duplex?:'half'}={method:req.method,headers:req.headers as HeadersInit}
  if(req.method!=='GET'&&req.method!=='HEAD'){init.body=Readable.toWeb(req) as ReadableStream;init.duplex='half'}
  const response:Response=await entry.default.fetch(new Request(url,init))
  res.writeHead(response.status,Object.fromEntries(response.headers))
  if(response.body)Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);else res.end()
 }catch(error){console.error(error);if(!res.headersSent)res.writeHead(500);res.end('Unable to load the workspace')}
})
server.listen(port,host,()=>console.log(`Outreach dashboard: http://${host}:${port}`))
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)))
