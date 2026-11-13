import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCatalog} from './lib/catalog.mjs';
import {randomBytes} from 'node:crypto';
import {saveTask,TaskError} from './lib/tasks.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const assets = new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.mjs','app.mjs'],['/model.mjs','model.mjs'],['/markdown.mjs','markdown.mjs'],['/editor.mjs','editor.mjs']]);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8'};
assets.set('/editor.css','editor.css');
async function readJSON(req){
  const limit=262144;
  if(Number(req.headers['content-length'])>limit){req.resume();throw new TaskError(413,'Request is too large.');}
  return new Promise((resolve,reject)=>{
    let bytes=0,chunks=[],finished=false;
    req.on('data',chunk=>{if(finished)return;bytes+=chunk.length;if(bytes>limit){finished=true;chunks=[];reject(new TaskError(413,'Request is too large.'));return;}chunks.push(chunk);});
    req.on('end',()=>{if(finished)return;try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(new TaskError(400,'Request body must be valid JSON.'));}});
    req.on('error',()=>reject(new TaskError(400,'Request was interrupted.')));
  });
}
export function createServer({configPath=path.join(appDir,'sources.json')}={}) {
  let pending;
  const csrfToken=randomBytes(32).toString('hex');
  return http.createServer(async(req,res)=>{
    const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",'Cross-Origin-Resource-Policy':'same-origin'};
    function send(code,body,type='text/plain; charset=utf-8') { res.writeHead(code,{...headers,'Content-Type':type}); res.end(req.method==='HEAD' ? undefined : body); }
    const host = req.headers.host || '';
    if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host) || (req.headers.origin && req.headers.origin !== 'http://'+host) || req.headers['sec-fetch-site'] === 'cross-site') return send(403,'Local, same-origin access only.');
    let pathname;
    try { pathname = new URL(req.url,'http://'+host).pathname; } catch { return send(400,'Invalid URL'); }
    try {
      const update=/^\/api\/tasks\/([a-f0-9]{20})$/.exec(pathname);
      const write=(pathname==='/api/tasks'&&req.method==='POST')||(update&&req.method==='PATCH');
      if(write){
        if(req.headers.origin!=='http://'+host||req.headers['x-work-journal-token']!==csrfToken)throw new TaskError(403,'Save requires this dashboard tab. Refresh it and try again.');
        if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw new TaskError(415,'Save requires application/json.');
        const input=await readJSON(req);
        const result=await saveTask(configPath,input,{id:update?.[1]});
        pending=null;
        return send(update?200:201,JSON.stringify(result),'application/json; charset=utf-8');
      }
      if(!['GET','HEAD'].includes(req.method))return send(405,'This operation is not supported.');
      if (pathname === '/api/catalog') {
        pending ||= loadCatalog(configPath).finally(()=>{pending=null;});
        return send(200,JSON.stringify({...await pending,csrfToken}),'application/json; charset=utf-8');
      }
      if (pathname === '/health') return send(200,'ok');
      const file = assets.get(pathname);
      if (!file) return send(404,'Not found');
      return send(200,await readFile(path.join(appDir,'public',file)),mime[path.extname(file)]);
    } catch (err) {
      if(err instanceof TaskError)return send(err.status,JSON.stringify({error:err.message}),'application/json; charset=utf-8');
      console.error('Dashboard request failed:',err.message);
      return send(500,JSON.stringify({error:'Unable to read or save notes. Your draft is kept. Check source-folder permissions and the server terminal; refresh before retrying.'}),'application/json; charset=utf-8');
    }
  });
}

export async function validateSourceConfig(configPath=path.join(appDir,'sources.json')) {
  try { return await loadCatalog(configPath); }
  catch (err) { throw new Error(`Unable to load source configuration ${configPath}: ${err.message}`); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  const host = process.env.DASHBOARD_BIND || '127.0.0.1';
  if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('PORT must be 1–65535');
  if (!['127.0.0.1','0.0.0.0'].includes(host)) throw new Error('Unsupported bind address');
  const configPath=process.env.SOURCES_CONFIG ? path.resolve(process.env.SOURCES_CONFIG) : path.join(appDir,'sources.json');
  try {
    await validateSourceConfig(configPath);
    const server = createServer({configPath});
    server.on('error',err=>{console.error('Cannot start dashboard:',err.message);process.exitCode=1;});
    server.listen(port,host,()=>console.log(`Work Journal: http://localhost:${port}\nOnly configured task folders accept edits. Press Ctrl+C to stop.`));
    for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
  } catch (err) {
    console.error('Cannot start dashboard:',err.message);
    process.exitCode=1;
  }
}
