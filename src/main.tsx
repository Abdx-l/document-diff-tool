import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {changes, diff} from './diff.mjs';
import './style.css';

function App() {
  const [before,setBefore]=useState('The agreement begins on Monday.\nPayment is due in 30 days.');
  const [after,setAfter]=useState('The agreement begins on Tuesday.\nPayment is due in 14 days.');
  const [view,setView]=useState<'inline'|'side'>('inline');
  const edits=useMemo(()=>diff(before,after),[before,after]);
  const blocks=useMemo(()=>changes(edits),[edits]);
  const jump=(index:number)=>document.getElementById('change-'+index)?.scrollIntoView({behavior:'smooth',block:'center'});
  const render=(kind:'before'|'after'|'all')=>edits.map((edit:{type:string,text:string},i:number)=>{
    if(kind==='before' && edit.type==='insert' || kind==='after' && edit.type==='delete')return null;
    const block=blocks.findIndex((b:{start:number,end:number})=>i>=b.start&&i<=b.end);
    return <span id={block>=0 && blocks[block].start===i && kind!=='before'?'change-'+block:undefined} key={i} className={edit.type}>{edit.text}</span>
  });
  return <main><h1>Document Diff</h1><p>Compare drafts locally, with no upload.</p>
    <div className="editors"><label>Original<textarea value={before} onChange={e=>setBefore(e.target.value)}/></label>
    <label>Revised<textarea value={after} onChange={e=>setAfter(e.target.value)}/></label></div>
    <div className="toolbar"><span>{blocks.length} change{blocks.length===1?'':'s'}</span>
      <button onClick={()=>setView('inline')} aria-pressed={view==='inline'}>Inline</button>
      <button onClick={()=>setView('side')} aria-pressed={view==='side'}>Side by side</button></div>
    <nav aria-label="Changes">{blocks.map((b:{deleted:string,inserted:string},i:number)=><button key={i} onClick={()=>jump(i)}>
      Change {i+1}: {b.deleted.trim().slice(0,30)||'�'}  {b.inserted.trim().slice(0,30)||'�'}</button>)}</nav>
    {view==='inline'?<section className="document" aria-label="Inline diff">{render('all')}</section>:
      <div className="editors"><section className="document" aria-label="Original diff">{render('before')}</section>
      <section className="document" aria-label="Revised diff">{render('after')}</section></div>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);

