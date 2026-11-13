import {readFile,writeFile,mkdir,rmdir,lstat,readdir,open,rename,link,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {loadCatalog,parseMarkdown,STATUSES} from './catalog.mjs';
import {taskDirectory} from './paths.mjs';
import {calendarDate,categories} from '../public/model.mjs';

export class TaskError extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new TaskError(status,message);};
const digest=text=>createHash('sha256').update(text).digest('hex');
const allowed=new Set(['projectId','version','title','summary','body','status','priority','category']);
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value;}
function validate(input){
  if(!input||typeof input!=='object'||Array.isArray(input))fail(422,'A task object is required.');
  for(const [key,value]of Object.entries(input)){if(!allowed.has(key)||typeof value!=='string')fail(422,'Unsupported field or value: '+key);}
  if(!input.title?.trim()||input.title.length>200||/[\r\n]/.test(input.title))fail(422,'Title must be 1–200 characters on one line.');
  if((input.summary||'').length>600||/[\r\n]/.test(input.summary||''))fail(422,'Summary must be at most 600 characters on one line.');
  if(!STATUSES.includes(input.status))fail(422,'Select a valid status.');
  if(!['low','normal','high'].includes(input.priority))fail(422,'Select a valid priority.');
  if(!categories.some(c=>c.id===input.category))fail(422,'Select a valid category.');
  if(Buffer.byteLength(input.body||'')>220000)fail(422,'Task details are too large (maximum 220 KB).');
  return {...input,title:input.title.trim()};
}
async function regularFile(file){const stat=await lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)fail(403,'Only ordinary task files can be edited.');if(stat.size>262144)fail(422,'Task source is too large.');}
async function exclusiveWrite(file,text){const handle=await open(file,'wx',0o600);try{await handle.writeFile(text,'utf8');await handle.sync();}finally{await handle.close();}}
function serialize(meta,body){return '---\n'+Object.entries(meta).filter(([,v])=>v!==undefined&&v!=='').map(([key,value])=>key+': '+JSON.stringify(value)).join('\n')+'\n---\n'+body;}

export async function saveTask(configPath,input,{id,timeZone,date:requestedDate}={}){
  if(requestedDate!==undefined&&!validDate(requestedDate))fail(422,'Write date must use a real YYYY-MM-DD calendar date.');
  if(!input||typeof input!=='object'||Array.isArray(input))fail(422,'A task object is required.');
  for(const [key,value]of Object.entries(input))if(!allowed.has(key)||typeof value!=='string')fail(422,'Unsupported field or value: '+key);
  const cfg=JSON.parse(await readFile(configPath,'utf8'));
  const locations=new Map(),catalog=await loadCatalog(configPath,{locations});
  const previous=id?catalog.records.find(r=>r.id===id):null;
  if(id&&!previous)fail(404,'Task not found. Refresh the dashboard.');
  if(previous?.type!=='task'&&id)fail(403,'Reference and journal files are read-only.');
  const project=cfg.projects.find(p=>p.id===(previous?.projectId||input.projectId));
  if(!project)fail(404,'Project not found.');
  if(previous&&input.projectId&&input.projectId!==previous.projectId)fail(422,'Moving tasks between projects is not supported.');
  let root;try{root=await taskDirectory(configPath,project);}catch(err){fail(403,err.message);}
  const file=id?locations.get(id):null;
  if(file&&path.dirname(file)!==root)fail(403,'This file is outside the writable task folder.');
  const lock=path.join(root,'.dashboard-lock');
  try{await mkdir(lock);}catch(err){if(err.code==='EEXIST')fail(409,'Another save is in progress. Try again shortly.');throw err;}
  let temp;
  try{
    // Repeat validation after locking in case another program changed the folder.
    if(await taskDirectory(configPath,project)!==root)fail(403,'Task folder changed.');
    let old='',parsed=null;
    if(file){
      await regularFile(file);old=await readFile(file,'utf8');
      if(!input.version||digest(old)!==input.version)fail(409,'This task changed since you opened it. Your draft is kept; reload the latest version before saving.');
      parsed=parseMarkdown(old);
      if(parsed.warnings.length||parsed.meta.type!=='task')fail(422,'Source metadata needs repair in the Markdown file before editing: '+parsed.warnings.join(' '));
    }
    const values=validate({title:parsed?.meta.title||previous?.title||'',summary:parsed?.meta.summary||'',body:parsed?.body||'',status:parsed?.meta.status||'todo',priority:parsed?.meta.priority||'normal',category:parsed?.meta.category||'uncategorized',...input});
    const date=requestedDate||calendarDate(new Date(),timeZone);
    let taskId=parsed?.meta.task_id, destination=file;
    if(!file){
      const prefix=project.taskPrefix||project.id.toUpperCase();
      if(!/^[A-Z][A-Z0-9-]{0,29}$/.test(prefix))fail(422,'Invalid taskPrefix in source configuration.');
      const entries=await readdir(root);let n=0;
      for(const name of entries){const m=new RegExp('^'+prefix+'-(\\d+)(?:[-.]|$)').exec(name);if(m)n=Math.max(n,Number(m[1]));}
      taskId=prefix+'-'+String(n+1).padStart(3,'0');destination=path.join(root,taskId+'.md');
    }
    const meta={...(parsed?.meta||{}),type:'task',task_id:taskId,title:values.title,date,status:values.status,priority:values.priority,category:values.category,summary:values.summary};
    if(!file)meta.created_at=date;
    // Existing done records with no date stay undated; do not invent historical completion.
    meta.completed_at=values.status==='done'?(parsed?.meta.status==='done'?(parsed.meta.completed_at||''):date):'';
    const text=serialize(meta,values.body);
    if(Buffer.byteLength(text)>262144)fail(422,'Task file exceeds 256 KiB.');
    if(file){
      const history=path.join(root,'.history');await mkdir(history,{recursive:true});
      const hs=await lstat(history);if(hs.isSymbolicLink()||!hs.isDirectory())fail(403,'History folder must be an ordinary directory.');
      await exclusiveWrite(path.join(history,path.basename(file,'.md')+'-'+digest(old)+'-'+randomUUID()+'.md'),old);
    }
    temp=path.join(root,'.save-'+randomUUID());await exclusiveWrite(temp,text);
    if(file){
      await regularFile(file);
      if(digest(await readFile(file,'utf8'))!==input.version)fail(409,'Task changed during save. Your draft is kept; refresh before retrying.');
      await rename(temp,destination);temp=null;
    }else{
      // Hard-link publish is atomic and refuses to replace an existing filename.
      try{await link(temp,destination);}catch(err){if(err.code==='EEXIST')fail(409,'A task with this ID was just created. Try again.');throw err;}
      await unlink(temp);temp=null;
    }
    const updated=await loadCatalog(configPath);
    const result=updated.records.find(r=>r.projectId===project.id&&(file?r.id===id:r.taskId===taskId));
    if(!result)fail(500,'Task was saved but could not be reloaded. Refresh before retrying.');
    return result;
  }finally{if(temp)await unlink(temp).catch(()=>{});await rmdir(lock);}
}
