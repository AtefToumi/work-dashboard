import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer,validateSourceConfig} from '../server.mjs';
import http from 'node:http';
import {spawn} from 'node:child_process';

test('startup validation rejects a missing source configuration before listening', async () => {
  const missing = path.join(os.tmpdir(), 'missing-sources-'+Date.now()+'.json');
  await assert.rejects(validateSourceConfig(missing), /source configuration/i);
});

test('CLI exits before announcing a URL when SOURCES_CONFIG is missing', async () => {
  const missing = path.join(os.tmpdir(), 'missing-cli-sources-'+Date.now()+'.json');
  const result = await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[path.resolve('server.mjs')],{env:{...process.env,SOURCES_CONFIG:missing},stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));
  });
  assert.equal(result.code,1);
  assert.equal(result.stdout,'');
  assert.match(result.stderr,/Cannot start dashboard: Unable to load source configuration/);
});

test('startup validation accepts a valid relative override and rejects invalid JSON', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'dashboard-startup-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  await writeFile(path.join(dir,'valid.json'),'{'+'"projects":[]}');
  await writeFile(path.join(dir,'invalid.json'),'{not json');
  await assert.doesNotReject(validateSourceConfig(path.resolve(dir,'valid.json')));
  await assert.rejects(validateSourceConfig(path.resolve(dir,'invalid.json')),/source configuration/i);
});

test('HTTP serves catalog, blocks writes, hostile hosts/origins and arbitrary files', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'dashboard-http-'));
  await writeFile(path.join(dir,'sources.json'),'{"projects":[]}');
  const server = createServer({configPath:path.join(dir,'sources.json')});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});
  const url = 'http://127.0.0.1:'+server.address().port;
  const catalog = await fetch(url+'/api/catalog');
  assert.equal(catalog.status,200);
  assert.deepEqual((await catalog.json()).records,[]);
  assert.equal((await fetch(url+'/')).status,200);
  assert.equal((await fetch(url+'/sources.json')).status,404);
  assert.equal((await fetch(url+'/api/catalog',{method:'POST'})).status,405);
  // Node fetch can normalize Host; use a real raw HTTP request to exercise this boundary.
  const hostileHostStatus = await new Promise((resolve,reject)=>{const req=http.get(url+'/api/catalog',{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});
  assert.equal(hostileHostStatus,403);
  assert.equal((await fetch(url+'/api/catalog',{headers:{Origin:'https://evil.example'}})).status,403);
  assert.equal((await fetch(url+'/api/catalog',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  assert.equal((await fetch(url+'/%2e%2e/.env')).status,404);
  assert.ok(catalog.headers.get('content-security-policy').includes("default-src 'self'"));
});
