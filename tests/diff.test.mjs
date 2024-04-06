import test from 'node:test';
import assert from 'node:assert/strict';
import {diff, changes} from '../src/diff.mjs';

test('reconstructs both inputs and marks replacement',()=>{
  const a='The contract starts Monday.', b='The contract starts Tuesday.';
  const edits=diff(a,b);
  assert.equal(edits.filter(e=>e.type!=='insert').map(e=>e.text).join(''),a);
  assert.equal(edits.filter(e=>e.type!=='delete').map(e=>e.text).join(''),b);
  assert.ok(changes(edits).length);
});
test('whitespace and moved paragraph remain visible',()=>{
  const whitespace=diff('hello  world','hello world');
  assert.ok(whitespace.some(e=>e.type==='delete'&&e.text==='  '));
  const a='First paragraph.\n\nSecond paragraph.';
  const b='Second paragraph.\n\nFirst paragraph.';
  const edits=diff(a,b);
  assert.ok(edits.some(e=>e.type==='delete'));
  assert.ok(edits.some(e=>e.type==='insert'));
});
test('localized edit in 50000-word text',()=>{
  const words=Array.from({length:50000},(_,i)=>'word'+i);
  const before=words.join(' ');
  words[25000]='updated';
  const edits=diff(before,words.join(' '));
  assert.equal(edits.filter(e=>e.type==='delete').map(e=>e.text).join(''),'word25000');
  assert.equal(edits.filter(e=>e.type==='insert').map(e=>e.text).join(''),'updated');
});

