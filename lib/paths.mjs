import {lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
export function inside(root,file){const rel=path.relative(root,file);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
export async function taskDirectory(configPath,project){
  if(typeof project.taskRoot!=='string')throw new Error('No writable task folder is configured.');
  const base=path.dirname(path.resolve(configPath)),target=path.resolve(base,project.taskRoot);
  const root=project.roots.map(r=>path.resolve(base,r)).find(r=>inside(r,target));
  if(!root)throw new Error('Task folder must be inside a configured source root.');
  let cursor=root;
  for(const part of ['',...path.relative(root,target).split(path.sep).filter(Boolean)]){
    if(part)cursor=path.join(cursor,part);
    const stat=await lstat(cursor);
    if(stat.isSymbolicLink()||!stat.isDirectory())throw new Error('Task folders cannot contain symbolic links.');
  }
  if(!inside(await realpath(root),await realpath(target)))throw new Error('Task folder escapes its source.');
  return target;
}
