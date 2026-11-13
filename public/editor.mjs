import {categories,statusLabels} from './model.mjs';
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
export async function writeTask(data,values,id){
  const response=await fetch(id?'/api/tasks/'+id:'/api/tasks',{method:id?'PATCH':'POST',headers:{'Content-Type':'application/json','X-Work-Journal-Token':data.csrfToken},body:JSON.stringify(values)});
  const result=await response.json();
  if(!response.ok){const err=new Error(result.error||'Unable to save. Your draft is kept.');err.status=response.status;throw err;}
  return result;
}
export function openTaskEditor({data,record=null,projectId='',onSaved}){
  if(document.querySelector('.task-editor'))return;
  const dialog=el('dialog','task-editor');dialog.setAttribute('aria-labelledby','editor-title');
  const header=el('div','editor-header');header.append(el('p','eyebrow',record?'UPDATE TASK':'CAPTURE A NEXT STEP'),el('h2','',record?'Edit task':'New task'));header.querySelector('h2').id='editor-title';
  const description=el('p','subtitle','Saved directly to this project’s Markdown. Previous versions are kept.');header.append(description);
  const form=el('form'),fields={},grid=el('div','editor-grid');let saving=false,baseline='',version=record?.version;
  function field(label,name,{options,large=false,max,required=false}={}){
    const wrap=el('label','editor-field'+(large?' full':''));wrap.append(el('span','',label));
    const input=el(options?'select':name==='body'?'textarea':'input');input.name=name;if(!options&&name!=='body')input.type='text';
    if(options)for(const [value,text]of options){const option=el('option','',text);option.value=value;input.append(option);}
    if(max)input.maxLength=max;input.required=required;if(name==='body'){input.rows=12;input.spellcheck=false;}
    wrap.append(input);grid.append(wrap);fields[name]=input;return input;
  }
  const project=field('Project','projectId',{options:data.projects.filter(p=>p.canCreateTasks||p.id===record?.projectId).map(p=>[p.id,p.name]),required:true});project.disabled=!!record;
  field('Category','category',{options:categories.map(c=>[c.id,c.label])});
  field('Title','title',{large:true,max:200,required:true});
  field('Summary','summary',{large:true,max:600});
  field('Status','status',{options:Object.entries(statusLabels)});
  field('Priority','priority',{options:[['low','Low'],['normal','Normal'],['high','High']]});
  field('Details (Markdown)','body',{large:true,max:220000});
  const notice=el('div','editor-error');notice.setAttribute('role','alert');notice.hidden=true;
  const conflict=el('div','conflict-actions');conflict.hidden=true;
  const reload=el('button','button secondary','Load latest version');reload.type='button';
  const help=el('span','','Copy any draft text you need before loading the latest version.');conflict.append(help,reload);
  const actions=el('div','editor-actions');const cancel=el('button','button secondary','Cancel');cancel.type='button';const save=el('button','button primary','Save task');save.type='submit';actions.append(cancel,save);
  form.append(grid,notice,conflict,actions);dialog.append(header,form);document.body.append(dialog);
  const snapshot=()=>JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value])));
  function fill(r){fields.projectId.value=r?.projectId||projectId||data.projects.find(p=>p.canCreateTasks)?.id||'';for(const name of ['title','summary','body'])fields[name].value=r?.[name]||'';fields.status.value=r?.status||'todo';fields.priority.value=r?.priority||'normal';fields.category.value=r?.category||'uncategorized';baseline=snapshot();}
  fill(record);
  const previousFocus=document.activeElement;
  function close(){if(saving)return;if(snapshot()!==baseline&&!confirm('Discard your unsaved task changes?'))return;dialog.close();dialog.remove();window.removeEventListener('beforeunload',beforeUnload);previousFocus?.focus();}
  function beforeUnload(e){if(snapshot()!==baseline){e.preventDefault();e.returnValue='';}}
  window.addEventListener('beforeunload',beforeUnload);
  cancel.addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  reload.addEventListener('click',async()=>{
    if(!confirm('Replace your draft with the latest saved task? Copy anything you want to keep first.'))return;
    if(saving)return;saving=true;reload.disabled=true;save.disabled=true;cancel.disabled=true;
    const disabledStates=Object.values(fields).map(input=>[input,input.disabled]);for(const [input]of disabledStates)input.disabled=true;
    try{const response=await fetch('/api/catalog',{cache:'no-store'});if(!response.ok)throw new Error('Could not load the latest version. Your draft is kept.');const fresh=await response.json();const latest=fresh.records.find(r=>r.id===record.id);if(!latest)throw new Error('Task no longer exists in the configured sources. Your draft is kept.');if(!latest.editable)throw new Error('Task is no longer editable. Check source notices; your draft is kept.');version=latest.version;data.csrfToken=fresh.csrfToken;fill(latest);notice.hidden=true;conflict.hidden=true;}catch(err){notice.textContent=err.message;notice.hidden=false;}finally{for(const [input,disabled]of disabledStates)input.disabled=disabled;saving=false;reload.disabled=false;save.disabled=false;cancel.disabled=false;}
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(saving||!form.reportValidity())return;saving=true;save.disabled=true;cancel.disabled=true;save.textContent='Saving…';notice.hidden=true;conflict.hidden=true;
    const values=Object.fromEntries(Object.entries(fields).map(([name,input])=>[name,input.value]));if(record)values.version=version;
    const disabledStates=Object.values(fields).map(input=>[input,input.disabled]);for(const [input]of disabledStates)input.disabled=true;
    try{const saved=await writeTask(data,values,record?.id);baseline=snapshot();saving=false;dialog.close();dialog.remove();window.removeEventListener('beforeunload',beforeUnload);await onSaved(saved);}
    catch(err){notice.textContent=err.message;notice.hidden=false;conflict.hidden=err.status!==409||!record;}
    finally{for(const [input,disabled]of disabledStates)input.disabled=disabled;saving=false;save.disabled=false;cancel.disabled=false;save.textContent='Save task';}
  });
  dialog.showModal();fields.title.focus();
}
