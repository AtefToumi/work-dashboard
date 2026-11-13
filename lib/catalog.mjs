import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {categories,referenceTopics,documentStates} from '../public/model.mjs';
import {taskDirectory} from './paths.mjs';

const MAX_BYTES = 262144;
const MAX_FILES = 1000;
const TYPES = ['task', 'journal', 'document'];
export const STATUSES = ['todo', 'in-progress', 'blocked', 'verify', 'done'];
const FIELDS = new Set(['type','title','date','status','priority','summary','task_id','category','created_at','completed_at','topic','document_state']);
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value+'T12:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === value;
}
export function parseMarkdown(input) {
  const text = input.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const meta = Object.create(null), warnings = [];
  let body = text;
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---',4);
    if (end < 0 || !/^\n---(?:\n|$)/.test(text.slice(end))) warnings.push('Unclosed front matter; showing original text.');
    else {
      body = text.slice(end+4).replace(/^\n/,'');
      for (const line of text.slice(4,end).split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        const m = /^([a-z_]+):\s*(.*)$/.exec(line);
        if (!m || !FIELDS.has(m[1])) { warnings.push('Unsupported metadata line: '+line.slice(0,100)); continue; }
        let value = m[2].trim();
        if (value.startsWith('"')) {
          try { value = JSON.parse(value); if (typeof value !== 'string') throw Error(); }
          catch { warnings.push('Invalid quoted value for '+m[1]); continue; }
        } else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1,-1).replace(/''/g,"'");
        if (Object.hasOwn(meta,m[1])) warnings.push('Duplicate field: '+m[1]);
        meta[m[1]] = value;
      }
    }
  }
  if (meta.type && !TYPES.includes(meta.type)) warnings.push('Unknown type; displaying as a document.');
  meta.type = TYPES.includes(meta.type) ? meta.type : 'document';
  if (meta.type === 'task') {
    if (!STATUSES.includes(meta.status)) { warnings.push('Missing or invalid task status; using todo.'); meta.status = 'todo'; }
    if (meta.priority && !['low','normal','high'].includes(meta.priority)) warnings.push('Unknown priority; using normal.');
    meta.priority = ['low','normal','high'].includes(meta.priority) ? meta.priority : 'normal';
  }
  for(const field of ['date','created_at','completed_at'])if (meta[field] && !validDate(meta[field])) { warnings.push('Invalid '+field+'; use YYYY-MM-DD.'); meta[field] = ''; }
  if(meta.category&&!categories.some(c=>c.id===meta.category))warnings.push('Unknown category; edit the source metadata to a supported category.');
  if(meta.topic&&!referenceTopics.some(t=>t.id===meta.topic))warnings.push('Unknown reference topic.');
  if(meta.document_state&&!Object.hasOwn(documentStates,meta.document_state))warnings.push('Unknown document state.');
  if (meta.type === 'journal' && !meta.date) warnings.push('Journal entry has no valid date.');
  meta.title ||= /^#\s+(.+)$/m.exec(body)?.[1] || '';
  return {meta,body,warnings};
}

const inside = (root, file) => { const rel = path.relative(root,file); return rel === '' || (!rel.startsWith('..'+path.sep) && rel !== '..' && !path.isAbsolute(rel)); };
const canonicalKey = file => process.platform === 'win32' ? file.toLowerCase() : file;
export async function loadCatalog(configPath,{locations}={}) {
  const cfg = JSON.parse(await readFile(configPath,'utf8'));
  if (!Array.isArray(cfg.projects)) throw new Error('sources.json must contain a projects array.');
  const records = [], projects = [], warnings = [], seen = new Set(), files = new Map(), ids = new Set();
  let visited = 0;
  for (const project of cfg.projects) {
    if (!/^[a-z0-9-]+$/.test(project.id || '') || ids.has(project.id) || typeof project.name !== 'string' || !Array.isArray(project.roots)) throw new Error('Invalid or duplicate project in sources.json.');
    ids.add(project.id);
    let writableRoot='';
    if(project.taskRoot){try{writableRoot=await taskDirectory(configPath,project);}catch(err){warnings.push(project.name+': '+err.message);}}
    projects.push({id:project.id,name:project.name,description:project.description || '',roots:project.roots.map(r=>path.basename(r)),canCreateTasks:!!writableRoot});
    for (const [rootIndex, configured] of project.roots.entries()) {
      const root = path.resolve(path.dirname(configPath),configured);
      const label = project.name+' / '+path.basename(root);
      let resolvedRoot;
      try {
        if ((await lstat(root)).isSymbolicLink()) throw new Error('Symbolic root not allowed');
        resolvedRoot = await realpath(root);
      } catch { warnings.push(label+': folder missing, unreadable, or symbolic.'); continue; }
      async function walk(folder, depth=0) {
        if (depth > 8) { warnings.push(label+': maximum folder depth reached.'); return; }
        const entries = (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name));
        for (const entry of entries) {
          if (++visited > 10000 || records.length >= MAX_FILES) throw new Error('Catalog size limit reached');
          if (entry.name.startsWith('.')) continue;
          const full = path.join(folder,entry.name);
          const rel = path.relative(root,full).split(path.sep).join('/');
          if (entry.isSymbolicLink()) { warnings.push(label+'/'+rel+': symbolic link skipped.'); continue; }
          if (entry.isDirectory()) { await walk(full,depth+1); continue; }
          if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue;
          try {
            const stat = await lstat(full);
            const actual = await realpath(full);
            if (stat.isSymbolicLink() || !inside(resolvedRoot,actual)) throw new Error('File escapes source root');
            if (stat.size > MAX_BYTES) throw new Error('Markdown exceeds 256 KiB');
            const key = canonicalKey(actual);
            if (seen.has(key)) continue;
            const content = await readFile(full,'utf8');
            if (Buffer.byteLength(content) > MAX_BYTES) throw new Error('Markdown exceeds 256 KiB');
            const parsed = parseMarkdown(content);
            const id = createHash('sha256').update(project.id+':'+rootIndex+':'+rel).digest('hex').slice(0,20);
            const record = {id,projectId:project.id,projectName:project.name,type:parsed.meta.type,title:parsed.meta.title || entry.name.slice(0,-3),date:parsed.meta.date || '',status:parsed.meta.status || '',priority:parsed.meta.priority || '',taskId:parsed.meta.task_id || '',summary:parsed.meta.summary || '',category:parsed.meta.category||'',createdAt:parsed.meta.created_at||'',completedAt:parsed.meta.completed_at||'',version:createHash('sha256').update(content).digest('hex'),editable:parsed.meta.type==='task'&&!!writableRoot&&canonicalKey(path.dirname(full))===canonicalKey(writableRoot)&&parsed.warnings.length===0,body:parsed.body,source:path.basename(root)+'/'+rel,links:Object.create(null),warnings:parsed.warnings};
            record.topic = referenceTopics.some(t=>t.id===parsed.meta.topic)?parsed.meta.topic:'general';
            record.documentState = Object.hasOwn(documentStates,parsed.meta.document_state)?parsed.meta.document_state:'current';
            locations?.set(id,full);
            records.push(record); files.set(key,{record,actual}); seen.add(key);
            for (const w of parsed.warnings) warnings.push(label+'/'+rel+': '+w);
          } catch (err) { warnings.push(label+'/'+rel+': '+err.message); }
        }
      }
      try { await walk(root); } catch (err) { warnings.push(label+': '+err.message); }
    }
  }
  // Resolve only links to files already included in the explicit source catalog.
  for (const {record,actual} of files.values()) {
    for (const m of record.body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = m[1].replace(/^<|>$/g,'');
      if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) continue;
      try {
        const target = path.resolve(path.dirname(actual),decodeURIComponent(href.split('#')[0]));
        const found = files.get(canonicalKey(target));
        if (found) record.links[href] = found.record.id;
      } catch { /* invalid URL encoding remains plain text */ }
    }
  }
  records.sort((a,b)=>b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  return {projects,records,warnings,loadedAt:new Date().toISOString()};
}
