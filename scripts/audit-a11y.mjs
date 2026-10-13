import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
const B='http://localhost:4321', OUT='docs/v2/screenshots/audit';
const pages=['/','/course','/pricing','/primer','/reference','/glossary','/sources','/case-studies','/romania-lab-guide','/tools','/login','/legal/terms','/legal/privacy','/legal/refunds','/legal/imprint','/learn','/learn/00-setup','/learn/02-modulation','/learn/notebook','/404x'];
const vps=[360,768,1280]; const res=[];
const br=await chromium.launch();
for(const theme of ['light','dark']) for(const w of vps){
  const ctx=await br.newContext({viewport:{width:w,height:800},colorScheme:theme});
  await ctx.addInitScript(t=>{try{localStorage.setItem('signalpath.theme',t)}catch{}},theme);
  for(const p of pages){
    const pg=await ctx.newPage(); const errs=[];
    pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
    await pg.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})});
    const r=await pg.goto(B+p,{waitUntil:'networkidle'}).catch(()=>null);
    await pg.waitForTimeout(600);
    const actual=await pg.evaluate(()=>document.documentElement.dataset.theme);
    const m=await pg.evaluate(()=>{
      const de=document.documentElement;
      const small=[...document.querySelectorAll('a,button,input,select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&(r.width<24||r.height<24)}).map(e=>(e.tagName+'.'+(e.className||'').toString().slice(0,40)+' "'+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,25)+'" '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)));
      const under44=[...document.querySelectorAll('a,button,input:not([type=hidden]),select,textarea,summary,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&r.height<44&&!(e.tagName==='A'&&e.closest('p,li,.prose,td')&&!e.className.toString().includes('btn'))}).length;
      const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>+h.tagName[1]);
      const skips=[];for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1)skips.push(hs[i-1]+'>'+hs[i]);
      const lm=['header,[role=banner]','nav','main,[role=main]','footer,[role=contentinfo]'].map(s=>document.querySelectorAll(s).length);
      const wide=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('[class*=overflow],pre,table')).slice(0,3).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,50));
      const noalt=[...document.querySelectorAll('img:not([alt])')].length;
      const noDim=[...document.querySelectorAll('img')].filter(i=>!(i.getAttribute('width')&&i.getAttribute('height'))&&!i.style.aspectRatio).length;
      return {sw:de.scrollWidth,iw:innerWidth,small,under44,h1:hs.filter(x=>x===1).length,skips,lm,wide,noalt,noDim,title:document.title,lang:de.lang};
    });
    const cls=await pg.evaluate(()=>window.__cls);
    let axe=[];try{axe=(await new AxeBuilder({page:pg}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||n.all[0]?.message||n.none[0]?.message||'').slice(0,140))}))}catch(e){axe=[{id:'axe-fail',help:e.message}]}
    const name=(p==='/'?'home':p.slice(1).replace(/\//g,'_'))+`-${w}-${theme}`;
    await pg.screenshot({path:`${OUT}/${name}.png`,fullPage:false});
    res.push({p,w,theme,actual,status:r?.status(),errs:errs.slice(0,3),cls:+cls.toFixed(4),m,axe});
    await pg.close();
  }
  await ctx.close();
}
await br.close();
fs.writeFileSync('/private/tmp/claude-501/audit.json',JSON.stringify(res,null,1));
console.log('done',res.length);
