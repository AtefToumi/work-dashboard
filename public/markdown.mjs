// Small deliberately inert Markdown reader: HTML is always text; no images or embeds.
function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
export function safeLink(href,links={}) {
  if(Object.hasOwn(links,href)) return '#record='+encodeURIComponent(links[href]);
  try { const url=new URL(href); if(['https:','http:'].includes(url.protocol) && !url.username && !url.password) return url.href; } catch {}
  return null;
}
function inline(parent,text,links){
  const pattern=/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last=0;
  for(const m of text.matchAll(pattern)){
    parent.append(document.createTextNode(text.slice(last,m.index)));
    const token=m[0];
    if(token.startsWith('`'))parent.append(el('code',token.slice(1,-1)));
    else if(token.startsWith('**'))parent.append(el('strong',token.slice(2,-2)));
    else{
      const parts=/^\[([^\]]+)\]\(([^)]+)\)$/.exec(token), href=parts[2].replace(/^<|>$/g,'');
      const target=safeLink(href,links);
      const a=el(target?'a':'span',parts[1]);
      if(target){a.href=target;if(!target.startsWith('#')){a.target='_blank';a.rel='noopener noreferrer';}}
      else{a.className='unavailable-link';a.title='Reference outside the configured journal folders: '+href;}
      parent.append(a);
    }
    last=m.index+token.length;
  }
  parent.append(document.createTextNode(text.slice(last)));
}
export function renderMarkdown(text,links={}){
  const root=el('div');root.className='markdown';
  const lines=text.split('\n');let i=0;
  const tableCells=line=>line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    if(/^```/.test(line)){
      const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;
      const pre=el('pre');pre.append(el('code',code.join('\n')));root.append(pre);continue;
    }
    const heading=/^(#{1,6})\s+(.+)$/.exec(line);
    if(heading){const h=el('h'+heading[1].length);inline(h,heading[2],links);root.append(h);i++;continue;}
    if(/^\s*---+\s*$/.test(line)){root.append(el('hr'));i++;continue;}
    if(line.includes('|') && i+1<lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
      const table=el('table'),head=el('thead'),tr=el('tr');
      for(const cell of tableCells(line)){const th=el('th');inline(th,cell,links);tr.append(th);}head.append(tr);table.append(head);i+=2;
      const body=el('tbody');while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){const row=el('tr');for(const cell of tableCells(lines[i++])){const td=el('td');inline(td,cell,links);row.append(td);}body.append(row);}table.append(body);const wrap=el('div');wrap.className='table-wrap';wrap.append(table);root.append(wrap);continue;
    }
    if(/^\s*([-*]|\d+\.)\s+/.test(line)){
      const ordered=/^\s*\d+\./.test(line),list=el(ordered?'ol':'ul');
      while(i<lines.length&&(ordered?/^\s*\d+\.\s+/:/^\s*[-*]\s+/).test(lines[i])){
        let value=lines[i++].replace(/^\s*(?:[-*]|\d+\.)\s+/,'');const li=el('li');const check=/^\[([ xX])\]\s*/.exec(value);
        if(check){const input=el('input');input.type='checkbox';input.disabled=true;input.checked=check[1].toLowerCase()==='x';input.setAttribute('aria-label',input.checked?'Completed':'Not completed');li.append(input);value=value.slice(check[0].length);}inline(li,value,links);list.append(li);
      }root.append(list);continue;
    }
    if(/^>\s?/.test(line)){const block=el('blockquote'),p=el('p');inline(p,line.replace(/^>\s?/,''),links);block.append(p);root.append(block);i++;continue;}
    const paragraph=[line];i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,6}\s|```|>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) && !(lines[i].includes('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])))paragraph.push(lines[i++]);
    const p=el('p');inline(p,paragraph.join('\n'),links);root.append(p);
  }
  return root;
}
