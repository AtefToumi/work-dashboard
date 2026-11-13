export const statusLabels = {todo:'To do','in-progress':'In progress',blocked:'Blocked',verify:'To verify',done:'Done'};
export const referenceTopics = [
  {id:'overview',label:'Start here'},
  {id:'networking',label:'Networking & connectivity'},
  {id:'servers',label:'Server setup & access'},
  {id:'troubleshooting',label:'Troubleshooting'},
  {id:'app',label:'Journal app'},
  {id:'history',label:'History & handoffs'},
  {id:'general',label:'Other references'}
];
export const documentStates = {current:'Current',draft:'Draft',historical:'Historical'};
export function libraryRecords(records,filters={}) {
  return filterRecords(records,{...filters,type:'document'}).filter(r=>
    (filters.history==='yes'||r.documentState!=='historical') &&
    (!filters.topic||(r.topic||'general')===filters.topic)
  ).sort((a,b)=>a.title.localeCompare(b.title));
}
export const categories = [
  {id:'infrastructure',label:'Infrastructure / DevOps'},
  {id:'development',label:'Development / Automation'},
  {id:'testing',label:'Testing / Validation'},
  {id:'support',label:'Troubleshooting / Support'},
  {id:'documentation',label:'Documentation / Knowledge'},
  {id:'planning',label:'Planning / Coordination'},
  {id:'uncategorized',label:'Uncategorized'}
];
export const categoryLabel = value => categories.find(c=>c.id===(value||'uncategorized'))?.label || value;
export function calendarDate(now=new Date(),timeZone) {
  return new Intl.DateTimeFormat('en-CA',{...(timeZone?{timeZone}:{}),year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function workloadSummary(records,today=calendarDate()) {
  const tasks=records.filter(r=>r.type==='task');
  const start=new Date(today+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-6);const since=start.toISOString().slice(0,10);
  const counts=rows=>({total:rows.length,open:rows.filter(r=>r.status!=='done').length,todo:rows.filter(r=>r.status==='todo').length,inProgress:rows.filter(r=>r.status==='in-progress').length,blocked:rows.filter(r=>r.status==='blocked').length,verify:rows.filter(r=>r.status==='verify').length,done:rows.filter(r=>r.status==='done').length});
  return {...counts(tasks),completedToday:tasks.filter(r=>r.status==='done'&&r.completedAt===today).length,completedWeek:tasks.filter(r=>r.status==='done'&&r.completedAt>=since&&r.completedAt<=today).length,undatedCompleted:tasks.filter(r=>r.status==='done'&&!r.completedAt).length,
    byCategory:categories.map(c=>({...c,...counts(tasks.filter(r=>(r.category||'uncategorized')===c.id))})),
    byProject:[...new Set(tasks.map(r=>r.projectId))].map(id=>({id,label:tasks.find(r=>r.projectId===id).projectName||id,...counts(tasks.filter(r=>r.projectId===id))})),
    recent:tasks.filter(r=>r.date>=since&&r.date<=today).sort((a,b)=>b.date.localeCompare(a.date)),
    daily:Array.from({length:7},(_,i)=>{const d=new Date(since+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);const date=d.toISOString().slice(0,10);return {date,completed:tasks.filter(r=>r.status==='done'&&r.completedAt===date).length,updated:tasks.filter(r=>r.date===date).length};})
  };
}
export function filterRecords(records, filters={}) {
  const query = (filters.query || '').trim().toLocaleLowerCase();
  return records.filter(r => (!filters.project || r.projectId === filters.project) && (!filters.type || r.type === filters.type) && (!filters.status || r.status === filters.status) && (!filters.category || (r.category||'uncategorized')===filters.category) && (!query || [r.title,r.summary,r.body,r.projectName,r.taskId,categoryLabel(r.category)].join(' ').toLocaleLowerCase().includes(query)));
}
