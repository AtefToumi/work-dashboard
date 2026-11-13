import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm,symlink} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {saveTask} from '../lib/tasks.mjs';
import {loadCatalog} from '../lib/catalog.mjs';
import {calendarDate,filterRecords,workloadSummary} from '../public/model.mjs';

async function fixture(t){
  const dir=await mkdtemp(path.join(os.tmpdir(),'work-task-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  await mkdir(path.join(dir,'notes','tasks'),{recursive:true});
  const config=path.join(dir,'sources.json');
  await writeFile(config,JSON.stringify({projects:[{id:'test',name:'Test',roots:['notes'],taskRoot:'notes/tasks',taskPrefix:'TEST'}]}));
  return {dir,config,tasks:path.join(dir,'notes','tasks')};
}
const input={projectId:'test',title:'A real task',body:'## Details\n\n[Keep link](../reference.md)\n',status:'todo',priority:'high',category:'development',summary:'Summary'};
test('calendar dates use the requested timezone instead of a hard-coded workspace timezone',()=>{
  const instant=new Date('2026-01-15T02:00:00Z');
  assert.equal(calendarDate(instant,'America/Toronto'),'2026-01-14');
  assert.equal(calendarDate(instant,'Europe/Berlin'),'2026-01-15');
});
test('quick completion supports an existing filename-derived title',async t=>{
  const f=await fixture(t);await writeFile(path.join(f.tasks,'old.md'),'---\ntype: task\nstatus: todo\n---\nDetails without heading');
  const a=(await loadCatalog(f.config)).records[0];assert.equal(a.title,'old');assert.equal(a.editable,true);
  const done=await saveTask(f.config,{status:'done',version:a.version},{id:a.id});assert.equal(done.title,'old');assert.equal(done.status,'done');assert.equal(done.body,a.body);
});
test('create then edit preserves Markdown, IDs, completion semantics and previous version',async t=>{
  const f=await fixture(t);const a=await saveTask(f.config,{...input});
  assert.equal(a.taskId,'TEST-001');assert.equal(a.category,'development');assert.ok(a.version);assert.equal(a.editable,true);
  const done=await saveTask(f.config,{status:'done',version:a.version},{id:a.id});
  assert.equal(done.status,'done');assert.match(done.completedAt,/^\d{4}-\d{2}-\d{2}$/);assert.equal(done.body,a.body);assert.equal(done.taskId,a.taskId);
  const edited=await saveTask(f.config,{title:'Renamed',version:done.version},{id:a.id});
  assert.equal(edited.completedAt,done.completedAt);
  const reopened=await saveTask(f.config,{status:'in-progress',version:edited.version},{id:a.id});
  assert.equal(reopened.completedAt,'');assert.equal(reopened.body,a.body);
  const backups=await readdir(path.join(f.tasks,'.history'));
  assert.equal(backups.length,3);
  const prior=await readFile(path.join(f.tasks,'.history',backups.find(n=>n.includes(a.version))),'utf8');
  assert.ok(prior.includes('[Keep link](../reference.md)'));
});
test('trusted task writes can preserve an explicit client or historical event date',async t=>{
  const f=await fixture(t);
  const created=await saveTask(f.config,input,{date:'2026-01-14'});
  assert.equal(created.date,'2026-01-14');
  assert.equal(created.createdAt,'2026-01-14');
  await assert.rejects(saveTask(f.config,{...input,title:'Invalid date'},{date:'2026-02-30'}),e=>e.status===422);
});
test('stale version rejects without overwriting externally edited content',async t=>{
  const f=await fixture(t);const a=await saveTask(f.config,input);
  const file=path.join(f.tasks,'TEST-001.md');await writeFile(file,(await readFile(file,'utf8'))+'\nExternal note');
  await assert.rejects(saveTask(f.config,{title:'Overwrite',version:a.version},{id:a.id}),e=>e.status===409);
  assert.ok((await readFile(file,'utf8')).includes('External note'));
});
test('rejects unknown project, invalid values, invalid ID and reference updates',async t=>{
  const f=await fixture(t);
  await assert.rejects(saveTask(f.config,{...input,projectId:'../other'}),e=>e.status===404);
  await assert.rejects(saveTask(f.config,{...input,title:' '}),e=>e.status===422);
  await assert.rejects(saveTask(f.config,{...input,category:'made-up'}),e=>e.status===422);
  await assert.rejects(saveTask(f.config,{...input,status:'maybe'}),e=>e.status===422);
  await assert.rejects(saveTask(f.config,{...input,body:'x'.repeat(270000)}),e=>e.status===422);
  await assert.rejects(saveTask(f.config,{version:'a'},{id:'../reference.md'}),e=>e.status===404);
  await writeFile(path.join(f.dir,'notes','reference.md'),'# Reference');
  const ref=(await loadCatalog(f.config)).records[0];
  await assert.rejects(saveTask(f.config,{title:'Oops',version:ref.version},{id:ref.id}),e=>e.status===403);
});
test('unsafe source metadata cannot be silently rewritten',async t=>{
  const f=await fixture(t);await writeFile(path.join(f.tasks,'old.md'),'---\ntype: task\nstatus: todo\ncustom: preserve me\n---\nBody');
  const old=(await loadCatalog(f.config)).records[0];
  await assert.rejects(saveTask(f.config,{title:'Changed',version:old.version},{id:old.id}),e=>e.status===422);
  assert.ok((await readFile(path.join(f.tasks,'old.md'),'utf8')).includes('custom: preserve me'));
});
test('task root outside read roots or replaced by a junction is rejected',async t=>{
  const f=await fixture(t);await mkdir(path.join(f.dir,'outside'));
  await writeFile(f.config,JSON.stringify({projects:[{id:'test',name:'Test',roots:['notes'],taskRoot:'outside'}]}));
  await assert.rejects(saveTask(f.config,input),e=>e.status===403);
  await rm(f.tasks,{recursive:true});await symlink(path.join(f.dir,'outside'),f.tasks,'junction');
  await writeFile(f.config,JSON.stringify({projects:[{id:'test',name:'Test',roots:['notes'],taskRoot:'notes/tasks'}]}));
  await assert.rejects(saveTask(f.config,input),e=>e.status===403);
});
test('two simultaneous saves of one version cannot both overwrite it',async t=>{
  const f=await fixture(t);const a=await saveTask(f.config,input);
  const results=await Promise.allSettled([saveTask(f.config,{title:'First',version:a.version},{id:a.id}),saveTask(f.config,{title:'Second',version:a.version},{id:a.id})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
});
test('category filters and workload counts use recorded completion dates, not update dates',()=>{
  const records=[{type:'task',status:'done',category:'development',projectId:'p',completedAt:'2026-10-27',date:'2026-10-27'}, {type:'task',status:'done',category:'',projectId:'p',date:'2026-10-27'}, {type:'task',status:'blocked',category:'infrastructure',projectId:'p'}, {type:'task',status:'done',category:'development',projectId:'q',completedAt:'2026-10-20'}];
  assert.equal(filterRecords(records,{category:'uncategorized'}).length,1);
  assert.equal(filterRecords(records,{category:'development'}).length,2);
  const summary=workloadSummary(records,'2026-10-27');
  assert.equal(summary.completedToday,1);assert.equal(summary.completedWeek,1);assert.equal(summary.undatedCompleted,1);assert.equal(summary.open,1);
  assert.equal(summary.byCategory.find(r=>r.id==='infrastructure').blocked,1);
});
