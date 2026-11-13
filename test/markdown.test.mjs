import test from 'node:test';
import assert from 'node:assert/strict';
import {safeLink} from '../public/markdown.mjs';
test('only catalog links or explicit http(s) URLs are navigable',()=>{
  assert.equal(safeLink('javascript:alert(1)'),null);
  assert.equal(safeLink('file:///C:/Users/private.txt'),null);
  assert.equal(safeLink('data:text/html,hello'),null);
  assert.equal(safeLink('//evil.example'),null);
  assert.equal(safeLink('../../.env'),null);
  assert.equal(safeLink('https://user:secret@example.com'),null);
  assert.equal(safeLink('https://ubuntu.com'),'https://ubuntu.com/');
  assert.equal(safeLink('notes.md',{'notes.md':'abc'}),'#record=abc');
});
