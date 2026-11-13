import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryRecords} from '../public/model.mjs';
import {parseMarkdown} from '../lib/catalog.mjs';

const records=[
  {id:'current',type:'document',projectId:'devops',title:'IPv6 relay',body:'Kea',topic:'networking',documentState:'current'},
  {id:'old',type:'document',projectId:'devops',title:'Old IPv6 relay',topic:'history',documentState:'historical'},
  {id:'other',type:'document',projectId:'other',title:'IPv6 draft',topic:'networking',documentState:'draft'},
  {id:'task',type:'task',projectId:'devops',title:'IPv6 relay'}
];
test('library excludes history and tasks by default',()=>{
  assert.deepEqual(libraryRecords(records).map(r=>r.id),['other','current']);
});
test('library search preserves project and topic; history is opt in',()=>{
  assert.deepEqual(libraryRecords(records,{project:'devops',topic:'networking',query:'kea'}).map(r=>r.id),['current']);
  assert.equal(libraryRecords(records,{project:'devops',topic:'history'}).length,0);
  assert.deepEqual(libraryRecords(records,{project:'devops',topic:'history',history:'yes',query:'ipv6'}).map(r=>r.id),['old']);
});
test('reference metadata is accepted and invalid values are reported',()=>{
  assert.deepEqual(parseMarkdown('---\ntopic: networking\ndocument_state: draft\n---\n# Test').warnings,[]);
  assert.ok(parseMarkdown('---\ntopic: nonsense\ndocument_state: bogus\n---\n# Test').warnings.length>=2);
});
