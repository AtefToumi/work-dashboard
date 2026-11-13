import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseMarkdown, loadCatalog } from '../lib/catalog.mjs';

test('tracked source configuration loads only portable example records without warnings', async () => {
  for (const name of ['sources.json', 'sources.docker.json']) {
    const data = await loadCatalog(path.resolve(name));
    assert.deepEqual(data.warnings, [], name);
    assert.deepEqual(data.projects.map(project => project.id), ['example'], name);
    assert.ok(data.records.some(record => record.taskId === 'EXAMPLE-001'), name);
    assert.ok(data.records.every(record => record.source.startsWith('work-log/') || record.source.startsWith('references/')), name);
  }
});
import { filterRecords } from '../public/model.mjs';

async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'work-dashboard-'));
  t.after(() => rm(dir, {recursive:true, force:true}));
  await mkdir(path.join(dir,'notes'));
  const config = {projects:[{id:'devops',name:'DevOps',description:'Servers',roots:['notes']}]};
  await writeFile(path.join(dir,'sources.json'), JSON.stringify(config));
  return dir;
}

test('parses journal metadata while preserving body, Unicode and colons', () => {
  const record = parseMarkdown('---\r\ntype: journal\r\ntitle: "Today: VM setup"\r\ndate: 2026-10-27\r\nsummary: Prüfung passed\r\n---\r\n# Notes\r\nText');
  assert.equal(record.meta.title, 'Today: VM setup');
  assert.equal(record.meta.date, '2026-10-27');
  assert.equal(record.body, '# Notes\nText');
  assert.deepEqual(record.warnings, []);
});
test('invalid task status/date are flagged and never treated as completed', () => {
  const record = parseMarkdown('---\ntype: task\nstatus: finished-ish\ndate: 2026-02-30\n---\n# Task');
  assert.equal(record.meta.status, 'todo');
  assert.equal(record.meta.date, '');
  assert.ok(record.warnings.length >= 2);
});
test('unterminated metadata remains readable and warns', () => {
  const record = parseMarkdown('---\ntitle: Test\nbody without delimiter');
  assert.ok(record.body.includes('body without delimiter'));
  assert.ok(record.warnings.length);
});
test('catalog reads only listed roots, resolves known links, and refreshes edits', async t => {
  const dir = await fixture(t);
  await writeFile(path.join(dir,'secret.md'), 'DO NOT INDEX');
  await writeFile(path.join(dir,'notes','a.md'), '---\ntype: journal\ndate: 2026-10-27\ntitle: Setup\n---\n[Details](b.md) [Outside](../secret.md)');
  await writeFile(path.join(dir,'notes','b.md'), '# Details\nInitial');
  let data = await loadCatalog(path.join(dir,'sources.json'));
  assert.equal(data.records.length, 2);
  const a = data.records.find(r => r.title === 'Setup');
  assert.ok(a.links['b.md']);
  assert.equal(a.links['../secret.md'], undefined);
  assert.ok(!JSON.stringify(data).includes('DO NOT INDEX'));
  await writeFile(path.join(dir,'notes','b.md'), '# Details\nUpdated');
  data = await loadCatalog(path.join(dir,'sources.json'));
  assert.ok(data.records.some(r => r.body.includes('Updated')));
});
test('missing roots and oversized files warn without hiding valid notes', async t => {
  const dir = await fixture(t);
  await writeFile(path.join(dir,'sources.json'),JSON.stringify({projects:[{id:'devops',name:'DevOps',roots:['notes','absent']}]}));
  await writeFile(path.join(dir,'notes','large.md'), 'x'.repeat(270000));
  await writeFile(path.join(dir,'notes','ok.md'), '# Good');
  const data = await loadCatalog(path.join(dir,'sources.json'));
  assert.equal(data.records.length,1);
  assert.ok(data.warnings.length >= 2);
});
test('symlinked directories outside the root are not followed', async t => {
  const dir = await fixture(t);
  await mkdir(path.join(dir,'private'));
  await writeFile(path.join(dir,'private','secret.md'),'SECRET');
  await symlink(path.join(dir,'private'),path.join(dir,'notes','escape'),'junction');
  const data = await loadCatalog(path.join(dir,'sources.json'));
  assert.equal(data.records.length,0);
  assert.ok(data.warnings.length);
});
test('filter combines project, type, status and case-insensitive full-text search', () => {
  const records = [{id:'1',projectId:'devops',type:'task',status:'todo',title:'SSH setup',body:'Atef',summary:''}, {id:'2',projectId:'other',type:'task',status:'done',title:'SSH',body:'',summary:''}];
  assert.deepEqual(filterRecords(records,{project:'devops',type:'task',status:'todo',query:'ATEF'}).map(r=>r.id), ['1']);
  assert.equal(filterRecords(records,{query:'absent'}).length,0);
});
