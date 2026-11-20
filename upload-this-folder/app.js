
(function(){const o=Number.prototype.toLocaleString;Number.prototype.toLocaleString=function(l,opt){if(l===undefined||/^en-ZA$/i.test(String(l))) l='en-US';return o.call(this,l,opt);};})();
// ═══════════════════════════════════════
// DEFAULT STATE
// ═══════════════════════════════════════
const DEFAULTS = {
  settings:{compName:"M.F.D Bricks and Sand Supply",slogan:"We Make It Happen",vat:"",phone:"079 846 1978",whatsapp:"075 258 4582",email:"admin@mfdbricksandsand.co.za",ownerWa:"075 258 4582",addr:"Vuwani to Malamulele Road, Mbhalati Village, 0982",bank:"MFD Bricks and Sand Supply · First National Bank (FNB) · Gold Business · Acc No 63207860255 · Branch 250655",footer:"Thank you for your support. Goods sold are not returnable without prior arrangement.",maxDisc:5,vatRate:0,qValidity:14,lowStock:5,autoLockMinutes:10},
  users:[
    {id:1,name:"Owner / Admin",role:"admin",avatar:"👑"},
  ],
  products:[
    {id:1,name:"River Sand",cat:"sand",unit:"load",up:1600,bp:null,bm:null,stk:20,ls:3,ico:"🏖️",cost:400},
    {id:2,name:"Bou Sand",cat:"sand",unit:"load",up:1600,bp:null,bm:null,stk:20,ls:3,ico:"🏖️",cost:400},
    {id:3,name:"Paving Sand",cat:"sand",unit:"load",up:1600,bp:null,bm:null,stk:15,ls:3,ico:"🏖️",cost:400},
    {id:4,name:"Stock Bricks",cat:"brick",unit:"each",up:2.5,bp:2.5,bm:500,stk:120000,ls:10000,ico:"🧱",cost:0.9,pallet:{qty:500,price:1250}},
    {id:5,name:"Maxi Brick",cat:"brick",unit:"each",up:4.3,bp:4.3,bm:250,stk:40000,ls:5000,ico:"🧱",cost:1.6,pallet:{qty:250,price:1075}},
    {id:8,name:"Pillar – Small",cat:"concrete",unit:"each",up:300,bp:null,bm:null,stk:60,ls:10,ico:"🏗️",cost:170,group:"Pillar",size:"Small"},
    {id:11,name:"Pillar – Medium",cat:"concrete",unit:"each",up:350,bp:null,bm:null,stk:0,ls:10,ico:"🏗️",cost:null,group:"Pillar",size:"Medium"},
    {id:9,name:"Pillar – Large",cat:"concrete",unit:"each",up:400,bp:null,bm:null,stk:40,ls:10,ico:"🏗️",cost:310,group:"Pillar",size:"Large"},
    {id:10,name:"Cement 50kg",cat:"cement",unit:"bag",up:122,bp:null,bm:null,stk:150,ls:20,ico:"🪨",cost:119},
    {id:12,name:"Water – 20 L",cat:"water",unit:"20 L",up:2,bp:null,bm:null,stk:0,ls:0,ico:"💧",cost:null,group:"Water",size:"20 L",noStock:true},
    {id:13,name:"Water – 200 L",cat:"water",unit:"200 L",up:10,bp:null,bm:null,stk:0,ls:0,ico:"💧",cost:null,group:"Water",size:"200 L",noStock:true},
    {id:14,name:"Water – 1,000 L",cat:"water",unit:"1,000 L",up:30,bp:null,bm:null,stk:0,ls:0,ico:"💧",cost:null,group:"Water",size:"1,000 L",noStock:true},
  ],
  zones:[
    {id:1,name:"0 – 10 km",fee:800,code:"TRSVERZ"},
    {id:2,name:"11 – 20 km",fee:1090,code:"TRS1VERZ"},
    {id:3,name:"21 – 40 km",fee:1390,code:"TRS2VERZ"},
    {id:4,name:"41 – 60 km",fee:1990,code:"TRS3VERZ"},
    {id:5,name:"61 – 80 km",fee:2290,code:"TRS4VERZ"},
  ],
  nextZoneId:6,
  customers:[],
  quotes:[],
  deliveries:[],
  transactions:[],
  nextProdId:28,nextTxId:1,nextQId:1,nextDelId:1,nextCustId:1,nextUserId:2,nextPurchId:1,nextReturnId:1,nextSupplierId:1,nextAuditId:1,
  auditLog:[],
  shiftStartTime:new Date().toISOString(),
  shift:{open:false},
  suppliers:[],
  sellReturns:[],
  cashupHistory:[],
  stockAdj:[],
  nextAdjId:1,
  heldSales:[],
  nextHeldId:1,
  pendingSync:0,
  purchases:[],
  yardReports:[],
  nextRptId:1,
  workers:[],
  nextWorkerId:1,
};


// ═══════════════════════════════════════
// MFD HELPERS — documents, transport, discount approval
// ═══════════════════════════════════════

// Mobile: label table cells so list tables can render as cards
function labelTables(){
  document.querySelectorAll('.tbl-w table').forEach(t=>{
    const hs=[...t.querySelectorAll('thead th')].map(th=>th.textContent.replace(/[▲▼↕]/g,'').trim());
    t.querySelectorAll('tbody tr, tfoot tr').forEach(tr=>{let ci=0;[...tr.children].forEach(td=>{const lbl=hs[ci]||'';if(td.getAttribute('data-label')!==lbl) td.setAttribute('data-label',lbl);ci+=parseInt(td.getAttribute('colspan')||1);});});
  });
}
{let _lt=null;new MutationObserver(()=>{clearTimeout(_lt);_lt=setTimeout(labelTables,30);}).observe(document.body,{childList:true,subtree:true});}
let discApprovedBy=null,qDiscApprovedBy=null;
function toggleTbNav(e){if(e) e.stopPropagation();const tb=document.querySelector('.tb');tb.classList.toggle('nav-open');document.getElementById('tbMenuBtn').textContent=tb.classList.contains('nav-open')?'✕':'☰';}
document.addEventListener('click',e=>{const tb=document.querySelector('.tb');if(tb&&tb.classList.contains('nav-open')&&!e.target.closest('.tb')){tb.classList.remove('nav-open');document.getElementById('tbMenuBtn').textContent='☰';}});
function posTab(t){
  const sc=document.getElementById('sc-pos');sc.classList.toggle('show-cart',t==='cart');
  document.getElementById('mtProd').classList.toggle('on',t!=='cart');document.getElementById('mtCart').classList.toggle('on',t==='cart');
}
function updateMobileCartBadge(){const n=document.getElementById('mtCartN');if(!n) return;const c=cart.reduce((s,i)=>s+1,0);n.textContent=c;n.style.display=c?'inline-block':'none';}

function nowStamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;}
function fixStamp(v){if(typeof v!=='string') return v;const m=v.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2}),?\s+(\d{2}:\d{2}(?::\d{2})?)/);return m?`${m[1]}-${m[2]}-${m[3]} ${m[4]}`:v;}
function txD(v){const d=new Date(fixStamp(v||'').replace(' ','T'));return isNaN(d)?new Date(0):d;}
// what receipts, slips, invoices, quotes, reports and WhatsApp messages say: the business, never the
// person who is logged in (their name stays on the login and in the internal records only)
const DOC_BY='MFD';
function adminName(){if(curUser&&curUser.role==='admin') return curUser.name;const a=lastApprover||S.users.find(u=>u.role==='admin');return (a?a.name:'Admin')+' (PIN)';}
function invLabel(){return S.settings.vat&&S.settings.vatRate>0?'TAX INVOICE':'INVOICE';}
// M·F·D logo rebuilt as vector (gold for dark screens, print = deep gold on white paper, black = till slips)
function mfdLogo(v,opt){
  opt=opt||{};
  const id='mfdg'+Math.random().toString(36).slice(2,8);
  const st={gold:['#FCE6A8','#E2B055','#A8701D','#E8BF68'],print:['#B98A31','#8F6219','#5E3E0C','#97702A'],black:['#111','#111','#111','#111']}[v]||['#FCE6A8','#E2B055','#A8701D','#E8BF68'];
  const line=v==='black'?'#111':`url(#${id}h)`;
  const sub=opt.compact?'':`<text x="320" y="214" text-anchor="middle" font-family="Cinzel,serif" font-weight="700" font-size="35.5" letter-spacing="3.2" fill="url(#${id})">BRICKS AND SAND SUPPLY</text>
    <path d="M96 241 H306 L320 236 L334 241 H544 L334 246 L320 251 L306 246 Z" fill="${line}"/>
    <text x="320" y="293" text-anchor="middle" font-family="Cinzel,serif" font-weight="600" font-size="31" letter-spacing="4.4" fill="url(#${id})">WE MAKE IT HAPPEN</text>`;
  return `<svg class="mfd-logo" viewBox="0 0 640 ${opt.compact?178:310}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="M.F.D Bricks and Sand Supply. We make it happen." style="display:block;width:100%;height:auto">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/><stop offset=".82" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>
  <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${st[2]}" stop-opacity="0"/><stop offset=".5" stop-color="${st[0]}"/><stop offset="1" stop-color="${st[2]}" stop-opacity="0"/></linearGradient></defs>
  <g fill="url(#${id})"><text x="58" y="168" font-family="Cinzel,serif" font-weight="700" font-size="178">M</text>
  <circle cx="246" cy="104" r="13"/>
  <text x="270" y="168" font-family="Cinzel,serif" font-weight="700" font-size="178">F</text>
  <circle cx="404" cy="104" r="13"/>
  <text x="430" y="168" font-family="Cinzel,serif" font-weight="700" font-size="178">D</text></g>
  ${sub}</svg>`;
}

function docHead(){
  const c=S.settings;
  const contact=[c.phone?'Call: '+c.phone:'',c.whatsapp?'WhatsApp: '+c.whatsapp:''].filter(Boolean).join(' · ');
  return `<div class="rc-logo">${mfdLogo('black')}</div>
  ${c.addr?`<span style="font-size:11px;color:var(--g)">${c.addr}</span><br>`:''}
  ${contact?`<span style="font-size:11px;color:var(--g)">${contact}</span><br>`:''}
  ${c.email?`<span style="font-size:11px;color:var(--g)">${c.email}</span><br>`:''}
  ${c.vat?`<span style="font-size:11px">VAT No: ${c.vat}</span><br>`:''}`;
}
function bankBlock(){
  const b=S.settings.bank;if(!b) return '';
  return `<div class="rdv"></div><div style="font-size:11px;color:var(--gd);text-align:center"><strong>EFT payments:</strong> ${b}</div>`;
}
function zoneById(v){return S.zones.find(z=>String(z.id)===String(v))||null;}
const zoneLabel=z=>z?(z.code?`${z.name} · ${z.code}`:z.name):'';
function getDelFee(selId,feeId){
  const el=document.getElementById(selId);const z=el?zoneById(el.value):null;
  if(!z) return 0;
  if(z.fee>0) return z.fee*tripsFor(selId);
  return parseFloat(document.getElementById(feeId)?.value)||0;
}
function syncCustFee(selId,feeId,on){
  const sel=document.getElementById(selId),f=document.getElementById(feeId);if(!sel||!f) return;
  const z=zoneById(sel.value);
  const qt=document.getElementById('qDelTrips');if(selId==='qDelZone'&&qt) qt.style.display=on?'inline-block':'none';
  const h=document.getElementById(selId==='qDelZone'?null:'delTripsHint');
  if(h){const t=tripsFor(selId);h.textContent=z?(z.fee>0?`R${z.fee.toLocaleString()} × ${t} = R${(z.fee*t).toLocaleString()}`:(t>1?'price typed is for all trips':'')):'';}
  f.style.display=on&&z&&!(z.fee>0)?'inline-block':'none';
}
function setZoneForFee(selId,feeId,fee,zoneName,trips){
  const t=Math.max(1,trips||1);
  const sel=document.getElementById(selId);if(!sel) return;
  let z=zoneName?S.zones.find(x=>x.name===zoneName||zoneLabel(x)===zoneName):null;
  if(!z) z=S.zones.find(x=>x.fee*t===fee)||S.zones.find(x=>!(x.fee>0));
  if(!z) return;
  sel.value=String(z.id);
  if(!(z.fee>0)) document.getElementById(feeId).value=fee;
}
function qDiscChanged(){
  const sel=document.getElementById('qDiscType');
  if(sel.value!=='none'&&!qDiscApprovedBy){
    const want=sel.value;sel.value='none';calcQ();
    reqAdmin('Admin PIN required to approve a quote discount',()=>{qDiscApprovedBy=adminName();sel.value=want;calcQ();});
    return;
  }
  if(sel.value==='none') qDiscApprovedBy=null;
  calcQ();
}

// ═══════════════════════════════════════
// LOCALSTORAGE PERSISTENCE
// ═══════════════════════════════════════
function loadState(raw){
  try{
    let saved=raw||null;
    if(saved){}
    else if(window.mfdDesktop){saved=window.mfdDesktop.load();if(!saved){try{saved=localStorage.getItem('mfd_pos_v1');}catch(e){}}}
    else saved=localStorage.getItem('mfd_pos_v1');
    if(saved){
      const st={...DEFAULTS,...JSON.parse(saved)};
      (st.products||[]).forEach(p=>{if(p.cat==='block'){p.cat='brick';}});
      if(!st.shift) st.shift={open:false};
      if(st.settings){['email','ownerEmail'].forEach(k=>{if(typeof st.settings[k]==='string') st.settings[k]=st.settings[k].replace(/^sale@mfdbricksands\.co\.za$/i,'admin@mfdbricksandsand.co.za').replace(/@mfdbricksands\.co\.za$/i,'@mfdbricksandsand.co.za');});}
      ['transactions','auditLog','cashupHistory','refunds','returns'].forEach(k=>{if(Array.isArray(st[k])) st[k].forEach(r=>{if(r&&r.date) r.date=fixStamp(r.date);});});
      if(!st.pricesBanner2026&&Array.isArray(st.products)){
        const upd={'Stock Bricks':[1250,2500],'Maxi Brick':[2200,4300]};
        st.products.forEach(p=>{const u=upd[p.name];if(u&&p.up===u[0]) p.up=u[1];});
        st.pricesBanner2026=true;
      }
      if(!st.bossWa2026&&st.settings){
        const n=String(st.settings.ownerWa||'').replace(/[^\d]/g,'');
        if(!n||n==='0798461978'||n==='27798461978') st.settings.ownerWa='075 258 4582';
        st.bossWa2026=true;
      }
      if(!st.oneCashierMigrated&&Array.isArray(st.users)){
        st.users=st.users.filter(u=>u.name!=='Cashier 2');
        st.users.forEach(u=>{if(u.name==='Cashier 1') u.name='Cashier';});
        st.oneCashierMigrated=true;
      }
      return st;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULTS));
}
function saveState(){
  if(Store.blocked) return;                       // another window owns the data
  const json=JSON.stringify(S);
  try{cloudSchedule();}catch(e){}
  if(window.mfdDesktop){try{window.mfdDesktop.save(json);}catch(e){toast('Could not save to the laptop: '+e.message,true);}return;}
  Store.save(json);
}
// ═══ WEB STORAGE: IndexedDB (room for years of sales) + small localStorage mirror ═══
const Store={db:null,ready:false,blocked:false,busy:false,next:null,lastErr:0,bytes:0,
  open(){return new Promise((res,rej)=>{try{const r=indexedDB.open('mfd_pos',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});},
  async init(){try{if(!('indexedDB' in window)) return null;this.db=await this.open();this.ready=true;return await this.get('state');}catch(e){this.ready=false;return null;}},
  get(k){return new Promise((res,rej)=>{const t=this.db.transaction('kv','readonly').objectStore('kv').get(k);t.onsuccess=()=>res(t.result||null);t.onerror=()=>rej(t.error);});},
  put(k,v){return new Promise((res,rej)=>{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});},
  save(json){
    this.bytes=json.length;
    let mirrored=false;
    if(json.length<4000000){try{localStorage.setItem('mfd_pos_v1',json);mirrored=true;}catch(e){}}
    else{try{localStorage.removeItem('mfd_pos_v1');}catch(e){}}
    if(!this.ready){if(!mirrored) this.fail();return;}
    this.next=json;if(!this.busy) this.flushLoop();
  },
  async flushLoop(){this.busy=true;
    while(this.next!==null){const j=this.next;this.next=null;
      try{await this.put('state',j);this.savedAt=new Date().toISOString();await this.put('savedAt',this.savedAt);}catch(e){this.fail(e);}}
    this.busy=false;
    try{if(document.getElementById('sc-settings')?.classList.contains('on')) renderStoreInfo();}catch(e){}},
  flush(){return new Promise(res=>{const w=()=>{if(!this.busy&&this.next===null) res();else setTimeout(w,40);};w();});},
  fail(e){if(Date.now()-this.lastErr<60000) return;this.lastErr=Date.now();
    toast('Could not save on this laptop. Make a backup now (Settings → Backup) and call support.',true);}
};
function flushSave(){return Store.flush();}
async function storageInfo(){
  const o={persisted:null,usage:0,quota:0};
  try{if(navigator.storage&&navigator.storage.persisted) o.persisted=await navigator.storage.persisted();}catch(e){}
  try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();o.usage=e.usage||0;o.quota=e.quota||0;}}catch(e){}
  return o;
}
async function askPersist(){try{if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted())) await navigator.storage.persist();}catch(e){}}
// ═══ ONE WINDOW AT A TIME (two open windows would overwrite each other's sales) ═══
const OneWin={held:false,
  claim(steal){
    if(!(navigator.locks&&navigator.locks.request)) {this.held=true;return Promise.resolve(true);}
    return new Promise(res=>{
      navigator.locks.request('mfd_pos_main',steal?{steal:true}:{ifAvailable:true},lock=>{
        if(!lock){res(false);return;}
        this.held=true;Store.blocked=false;res(true);
        return new Promise(()=>{});                  // hold until this window closes
      }).catch(()=>{this.held=false;Store.blocked=true;showWinBlock(true);});
    });
  }
};
function showWinBlock(taken){
  let d=document.getElementById('winBlock');
  if(!d){d=document.createElement('div');d.id='winBlock';d.className='win-block';document.body.appendChild(d);}
  d.innerHTML=`<div class="win-box"><h3>MFD POS is open in another window</h3><p>${taken?'You opened the POS in another window, so this one has stopped to keep the sales safe.':'Only one window can run the till at a time, so sales are never overwritten.'}</p>
  <div class="win-acts"><button class="btn" onclick="useThisWindow()">Use this window instead</button></div><small>The other window will stop when you continue here.</small></div>`;
  d.style.display='flex';
}
async function useThisWindow(){
  await OneWin.claim(true);
  const raw=Store.ready?await Store.get('state'):null;
  S=loadState(raw);
  const d=document.getElementById('winBlock');if(d) d.style.display='none';
  try{logout();}catch(e){initLogin();}
}
window.addEventListener('beforeunload',e=>{
  if(Store.busy||Store.next!==null){e.preventDefault();e.returnValue='Still saving…';return 'Still saving…';}
});

// Offer a generated file as a normal download
async function offerFile(filename,data,mime){
  try{
    const blob=new Blob([data],{type:mime||'application/octet-stream'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1500);return true;
  }catch(e){toast('Download is not available here',true);return false;}
}
async function downloadBackup(){
  if(window.mfdDesktop){
    saveState();
    const r=window.mfdDesktop.backupNow();
    if(r&&r.ok){updateLastBackupLbl();toast('Backup saved to '+r.folder);}else toast('Backup failed'+(r&&r.error?': '+r.error:''),true);
    return;
  }
  const payload={app:'MFD POS',version:1,exportedAt:new Date().toISOString(),data:S};
  const stamp=new Date().toISOString().replace(/[:.]/g,'-').split('T').join('_').slice(0,19);
  const ok=await offerFile(`mfd-pos-backup-${stamp}.json`,JSON.stringify(payload,null,2),'application/json');
  if(!ok) return;
  try{localStorage.setItem('mfd_pos_last_backup',new Date().toLocaleString('en-ZA'));}catch(e){}
  updateLastBackupLbl();
  toast('Backup saved');
}

function restoreBackup(input){
  const file=input.files[0];
  if(!file) return;
  reqAdmin('Admin PIN required to restore a backup',()=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      let payload;
      try{payload=JSON.parse(e.target.result);}catch(err){toast('Invalid backup file — could not parse JSON',true);input.value='';return;}
      const incoming=payload&&payload.data?payload.data:payload;
      if(!incoming||!Array.isArray(incoming.products)||!Array.isArray(incoming.transactions)){
        toast('This does not look like a valid BrickYard POS backup file',true);input.value='';return;
      }
      confirm('Restore Backup',`This will replace ALL current data with the backup${payload.exportedAt?' from '+new Date(payload.exportedAt).toLocaleString('en-ZA'):''}. This cannot be undone — continue?`,()=>{
        S={...DEFAULTS,...incoming};
        saveState();
        toast('Backup restored — reloading…');
        flushSave().then(()=>setTimeout(()=>location.reload(),300));
      });
      input.value='';
    };
    reader.readAsText(file);
  });
}

function updateLastBackupLbl(){
  const el=document.getElementById('lastBackupLbl');
  if(!el) return;
  let last='';
  if(window.mfdDesktop){const i=window.mfdDesktop.info();last=i.lastBackup||'';el.textContent=(last?`Last backup: ${last}`:'No backup copy yet.')+` · Backups folder: ${i.backupFolder}`;return;}
  try{last=localStorage.getItem('mfd_pos_last_backup')||'';}catch(e){}
  el.textContent=last?`Last backup: ${last}`:'No backup taken yet on this device.';
}

let S=loadState();
if(window.mfdDesktop&&window.mfdDesktop.print){window.print=()=>{window.mfdDesktop.print(window._pgFmt||'a4');};}
if(window.mfdDesktop){document.addEventListener('DOMContentLoaded',()=>{const n=document.getElementById('backupNote');if(n)n.textContent='Every change is saved automatically to this laptop, and a backup copy is made every day and when the app closes (last 60 kept). Use Backup Now before big changes, or to copy data to a flash drive.';const b=document.querySelector('[onclick="downloadBackup()"]');if(b)b.textContent='Backup Now';const o=document.createElement('button');o.className='btn-s';o.style.fontSize='13px';o.textContent='Open Backups Folder';o.onclick=()=>window.mfdDesktop.openBackupFolder();if(b)b.parentNode.appendChild(o);updateLastBackupLbl();});}

// Session-only
let curUser=null,catFilter="all",apinEntry="",apinCb=null,editProdId=null,editCustId=null,editSupplierId=null,
    payMethod=null,selCust=null,qLines=[],activeQId=null,
    shiftCashier="",confCb=null,lastTxId=null,stmtCustId=null,loginEntry="",loginUser=null,custFromSale=false,pendingAuditReason='',activeDelNoteId=null,activePOId=null;

// ═══════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════
setInterval(()=>{document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});},1000);

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════
// ── security helpers: passwords and PINs are stored only as salted PBKDF2-SHA256 hashes ──
const AUTH_ITER=150000;
const b64=u8=>{let s='';u8.forEach(b=>s+=String.fromCharCode(b));return btoa(s);};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function hashSecret(secret,saltB64){
  const salt=saltB64?unb64(saltB64):crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(secret)),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:AUTH_ITER},key,256);
  return {hash:b64(new Uint8Array(bits)),salt:b64(salt)};
}
function safeEq(a,b){a=String(a);b=String(b);let r=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++) r|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return r===0;}
async function verifySecret(secret,hash,salt){if(!hash||!salt){await hashSecret(secret);return false;}const h=await hashSecret(secret,salt);return safeEq(h.hash,hash);}
const normEmail=e=>(e||'').trim().toLowerCase();
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function pwProblem(p){if(!p||p.length<8) return 'Password must be at least 8 characters';if(!/[A-Za-z]/.test(p)||!/\d/.test(p)) return 'Password must contain letters and at least one number';return '';}
const validPin=p=>/^\d{4}$/.test(p||'');
function newRecoveryCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const r=crypto.getRandomValues(new Uint8Array(16));let c='';r.forEach((b,i)=>{c+=A[b%A.length];if(i%4===3&&i<15) c+='-';});return c;}
const normCode=c=>(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function lockInfo(key){S.authLock=S.authLock||{};const l=S.authLock[key];return l&&typeof l==='object'?l:{fails:0,until:0};}
function noteFail(key,max,mins){const l=lockInfo(key);l.fails=(l.fails||0)+1;if(l.fails>=max){l.until=Date.now()+mins*60000;l.fails=0;}S.authLock[key]=l;saveState();}
function clearFail(key){if(S.authLock&&S.authLock[key]){delete S.authLock[key];saveState();}}
function lockedMsg(key){const l=lockInfo(key);if(l.until>Date.now()){const m=Math.ceil((l.until-Date.now())/60000);return `Too many wrong attempts. Try again in ${m} minute${m>1?'s':''}.`;}return '';}
function needsSetup(){return !S.users.some(u=>u.role==='admin'&&u.pwHash);}
function el(id){return document.getElementById(id);}
function togglePw(id,btn){const i=el(id);const show=i.type==='password';i.type=show?'text':'password';btn.textContent=show?'Hide':'Show';}
function setBusy(btnId,busy,label){const b=el(btnId);if(!b) return;if(busy){b.dataset.lbl=b.textContent;b.textContent=label||'Please wait…';b.disabled=true;}else{b.textContent=b.dataset.lbl||b.textContent;b.disabled=false;}}
let pendingUser=null,pendingRecovery=null;

function showAuthView(v){
  ['avLogin','avSetup','avForgot','avChange','avRecovery','avReset'].forEach(id=>el(id)?.classList.remove('on'));
  const map={login:'avLogin',setup:'avSetup',forgot:'avForgot',change:'avChange',recovery:'avRecovery',reset:'avReset'};
  el(map[v])?.classList.add('on');el('loginErr').textContent='';
  if(v==='login'&&el('lgSetupLink')) el('lgSetupLink').hidden=!needsSetup();
  const focus={login:el('lgEmail')?.value?'lgPass':'lgEmail',setup:'suName',forgot:'fgEmail',change:'chPass',reset:'rsPass'}[v];
  if(focus) setTimeout(()=>el(focus)?.focus(),60);
}
function initLogin(){
  if(!S||!S.users||!S.users.length){S=JSON.parse(JSON.stringify(DEFAULTS));}
  ['lgPass','suPass','suPass2','suPin','suPin2','fgCode','fgPass','fgPass2','chPass','chPass2','rsPass','rsPass2'].forEach(id=>{const i=el(id);if(i) i.value='';});
  if(needsSetup()){
    const a=S.users.find(u=>u.role==='admin');el('suName').value=a&&a.name!=='Owner / Admin'?a.name:'';
    let last='';try{last=localStorage.getItem('mfd_last_email')||'';}catch(e){}
    el('lgEmail').value=last;showAuthView('login');return;
  }
  let last='';try{last=localStorage.getItem('mfd_last_email')||'';}catch(e){}
  el('lgEmail').value=last;showAuthView('login');
}

async function doSetup(){
  const name=el('suName').value.trim(),email=normEmail(el('suEmail').value),pw=el('suPass').value,pin=el('suPin').value.trim(),err=el('loginErr');
  if(!needsSetup()){initLogin();return;}
  if(!name){err.textContent='Enter the owner name';return;}
  if(!validEmail(email)){err.textContent='Enter a valid email address';return;}
  const pp=pwProblem(pw);if(pp){err.textContent=pp;return;}
  if(pw!==el('suPass2').value){err.textContent='The passwords do not match';return;}
  if(!validPin(pin)){err.textContent='The approval PIN must be exactly 4 digits';return;}
  if(pin!==el('suPin2').value.trim()){err.textContent='The approval PINs do not match';return;}
  setBusy('suBtn',true,'Checking…');
  // one owner only: if the shop already has an owner, or this email already has a login
  // (whatever name or password is typed), nothing is created and Sign in opens instead
  const known=await cloudAccountCheck(email);
  if(known.offline){err.textContent='Connect to the internet to create the owner account.';setBusy('suBtn',false);return;}
  if(known.email||known.owner){
    setBusy('suBtn',false);['suPass','suPass2','suPin','suPin2'].forEach(id=>el(id).value='');
    el('lgEmail').value=known.email?email:'';showAuthView('login');
    el('loginErr').textContent=known.email?'This email already has an MFD POS account. Sign in below.':'MFD POS already has an owner account. Sign in below, or ask the owner to create your login.';
    return;
  }
  // the owner account can only be created with the email + password registered for MFD's
  // cloud, and only while the shop has no owner yet: anyone else is turned away
  const cc={url:CLOUD_DEFAULT.url,key:CLOUD_DEFAULT.key,email};
  try{
    try{await cloudAuth(cc,'password',{email,password:pw});}
    catch(e){
      if(e.offline) throw new Error('Connect to the internet to create the owner account.');
      throw new Error('This email and password are not registered as the MFD owner, so no account was created. Cashiers: sign in with the login the owner gave you.');
    }
    const r=await cloudReq('staff?select=id&limit=1',{method:'GET'});
    if((await r.json()).length){
      const k=cloudCfg();delete k.access;delete k.refresh;delete k.exp;k.linked=false;cloudSaveCfg(k);
      ['suPass','suPass2','suPin','suPin2'].forEach(id=>el(id).value='');
      el('lgEmail').value=email;showAuthView('login');
      el('loginErr').textContent='MFD POS already has an owner account. Sign in below.';return;
    }
  }catch(e){err.textContent=e.message;setBusy('suBtn',false);return;}
  setBusy('suBtn',true,'Creating account…');
  try{
    let a=S.users.find(u=>u.role==='admin');
    if(!a){a={id:S.nextUserId++,role:'admin',avatar:'👑'};S.users.unshift(a);}
    const ph=await hashSecret(pw),ah=await hashSecret(pin),code=newRecoveryCode(),rh=await hashSecret(normCode(code));
    Object.assign(a,{name,email,pwHash:ph.hash,pwSalt:ph.salt,apHash:ah.hash,apSalt:ah.salt,recHash:rh.hash,recSalt:rh.salt,mustChange:false,created:nowStamp()});
    // retire the old PIN sign-in: remove plaintext PINs; staff without an email get a sign-in from Settings
    S.users.forEach(u=>{delete u.pin;});
    if(!deviceInfo()) setDevice('',true);                 // the device the owner is set up on is the main till
    // this device is connected to MFD's cloud straight away (first device: the cloud is empty)
    {const k=cloudCfg();k.linked=true;cloudSaveCfg(k);cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});}
    logAudit('Owner account set up (email and password sign-in)',name);
    saveState();
    cloudSync({skipPull:true});                         // the owner reaches the database at once, so no second owner can be made
    pendingUser=a;showRecovery(code);
  }catch(e){err.textContent='Could not create the account: '+e.message;}
  finally{setBusy('suBtn',false);}
}
// asks MFD's database (no sign-in needed, yes/no answers only): {owner, email} or {offline}
async function cloudAccountCheck(email){
  try{
    const r=await fetch(CLOUD_DEFAULT.url.replace(/\/+$/,'')+'/rest/v1/rpc/mfd_account_check',{method:'POST',headers:{apikey:CLOUD_DEFAULT.key,'Content-Type':'application/json'},body:JSON.stringify({p_email:email})});
    if(!r.ok) return {};                                 // check not installed yet: the password check below still applies
    const j=await r.json();return {owner:!!(j&&j.owner),email:!!(j&&j.email)};
  }catch(e){return {offline:true};}
}
// new laptop / phone: the owner signs in with their usual email and password. The same
// email and password open MFD's cloud account, so the shop (products, sales, settings and
// everyone's sign-ins) is copied onto this device and nobody sets it up again.
async function joinFromCloud(email,pw){
  const err=el('loginErr');
  if(Cloud.busy){err.textContent='Please wait a moment and try again';return;}
  setBusy('lgBtn',true,'Signing in…');Cloud.busy=true;
  try{
    const c={url:CLOUD_DEFAULT.url,key:CLOUD_DEFAULT.key,email};
    try{await cloudAuth(c,'password',{email,password:pw});}
    catch(e){
      if(e.offline) throw new Error('This device has no MFD POS data yet. Connect to the internet once to sign in.');
      noteFail('login:'+email,5,5);
      const lk=lockedMsg('login:'+email);if(lk) throw new Error(lk);
      // the owner's new email is in MFD POS, but the cloud sign-in still waits for its confirmation link
      const chk=await cloudAccountCheck(email);
      if(chk.email) throw new Error(`The password is incorrect, or the cloud sign-in still uses the previous owner email (an email change only counts once its confirmation link is clicked). Try the previous owner email, or use “Forgot password?” → “Email me a reset link”.`);
      throw new Error('Email or password is incorrect. This device is new: the owner signs in on it once first, then cashiers can sign in with their own login.');
    }
    cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});
    try{await cloudRestoreAll();}
    catch(e){if(/no owner/i.test(e.message)) e.message='No MFD POS account found for this email. Setting up the shop for the very first time? Use “Create the owner account” below.';throw e;}
    await cloudClaimDevice();
    const cfg=cloudCfg();cfg.linked=true;cfg.lastSync=new Date().toISOString();cfg.lastError='';cloudSaveCfg(cfg);
    Cloud.busy=false;cloudSetState('ok');clearFail('login:'+email);
    logAudit('Device '+deviceCode()+' connected from the cloud',email);
    el('lgPass').value='';
    const u=S.users.find(x=>normEmail(x.email)===email&&x.pwHash);
    if(u&&await verifySecret(pw,u.pwHash,u.pwSalt)){
      if(u.mustChange){pendingUser=u;showAuthView('change');return;}
      completeLogin(u);return;
    }
    el('lgEmail').value='';showAuthView('login');
    toast('This device is now connected to MFD. Sign in with your MFD POS email and password.');
  }catch(e){err.textContent=e.message;}
  finally{Cloud.busy=false;setBusy('lgBtn',false);}
}
function showRecovery(code){el('recCode').textContent=code;el('recAck').checked=false;el('recBtn').disabled=true;showAuthView('recovery');}
function afterRecoveryShown(){el('recCode').textContent='';const u=pendingUser;pendingUser=null;if(u) completeLogin(u);else initLogin();}

async function doLogin(){
  const email=normEmail(el('lgEmail').value),pw=el('lgPass').value,err=el('loginErr');
  if(!email||!pw){err.textContent='Enter your email and password';return;}
  const lk=lockedMsg('login:'+email);if(lk){err.textContent=lk;return;}
  if(needsSetup()){await joinFromCloud(email,pw);return;}
  setBusy('lgBtn',true,'Signing in…');
  try{
    const u=S.users.find(x=>normEmail(x.email)===email&&x.pwHash);
    const ok=await verifySecret(pw,u?.pwHash,u?.pwSalt);
    if(!ok){noteFail('login:'+email,5,5);err.textContent=lockedMsg('login:'+email)||'Email or password is incorrect';el('lgPass').value='';el('lgPass').focus();return;}
    clearFail('login:'+email);
    el('lgPass').value='';
    if(u.mustChange){pendingUser=u;el('chInfo').textContent=`Hi ${u.name.split(' ')[0]}. Your password was set by the owner. Choose a new one that only you know.`;showAuthView('change');return;}
    completeLogin(u);
  }finally{setBusy('lgBtn',false);}
}
async function doFirstChange(){
  const u=pendingUser,pw=el('chPass').value,err=el('loginErr');if(!u){initLogin();return;}
  const pp=pwProblem(pw);if(pp){err.textContent=pp;return;}
  if(pw!==el('chPass2').value){err.textContent='The passwords do not match';return;}
  if(await verifySecret(pw,u.pwHash,u.pwSalt)){err.textContent='Choose a different password from the temporary one';return;}
  setBusy('chBtn',true,'Saving…');
  try{const h=await hashSecret(pw);u.pwHash=h.hash;u.pwSalt=h.salt;u.mustChange=false;logAudit('Changed own password',u.name);saveState();pendingUser=null;el('chPass').value='';el('chPass2').value='';completeLogin(u);}
  finally{setBusy('chBtn',false);}
}
async function doRecover(){
  const email=normEmail(el('fgEmail').value),code=normCode(el('fgCode').value),pw=el('fgPass').value,err=el('loginErr');
  if(!validEmail(email)||code.length<16){err.textContent='Enter the owner email and the 16-character recovery code';return;}
  const pp=pwProblem(pw);if(pp){err.textContent=pp;return;}
  if(pw!==el('fgPass2').value){err.textContent='The passwords do not match';return;}
  const lk=lockedMsg('recover:'+email);if(lk){err.textContent=lk;return;}
  setBusy('fgBtn',true,'Checking…');
  try{
    const u=S.users.find(x=>x.role==='admin'&&normEmail(x.email)===email&&x.recHash);
    const ok=await verifySecret(code,u?.recHash,u?.recSalt);
    if(!ok){noteFail('recover:'+email,5,15);err.textContent=lockedMsg('recover:'+email)||'Email or recovery code is incorrect';return;}
    clearFail('recover:'+email);clearFail('login:'+email);
    if(!await ownerCloudChange(u,{password:pw})) return;
    const h=await hashSecret(pw),nc=newRecoveryCode(),rh=await hashSecret(normCode(nc));
    Object.assign(u,{pwHash:h.hash,pwSalt:h.salt,mustChange:false,recHash:rh.hash,recSalt:rh.salt});
    logAudit('Owner password reset with recovery code (new recovery code issued)',u.name);saveState();
    ['fgCode','fgPass','fgPass2'].forEach(id=>el(id).value='');
    pendingUser=u;showRecovery(nc);
  }finally{setBusy('fgBtn',false);}
}

// ── "Email me a reset link": the cloud emails the owner a one-time link back to this app.
// Opening it (on any device) sets the new password in the cloud sign-in AND the MFD POS owner login.
let resetSess=null,resetMailAt=0;
const cloudRoot=()=>CLOUD_DEFAULT.url.replace(/\/+$/,'');
async function sendResetLink(){
  const email=normEmail(el('fgEmail').value),err=el('loginErr'),msg=el('fgMailMsg');msg.textContent='';
  if(!validEmail(email)){err.textContent='Type the owner email first';return;}
  if(navigator.onLine===false){err.textContent='Connect to the internet to get a reset link by email';return;}
  if(Date.now()-resetMailAt<60000){err.textContent='A link was just sent. Wait a minute before asking for another one.';return;}
  setBusy('fgMailBtn',true,'Sending…');
  try{
    const r=await fetch(cloudRoot()+'/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+location.pathname),{method:'POST',headers:{apikey:CLOUD_DEFAULT.key,'Content-Type':'application/json'},body:JSON.stringify({email})});
    if(r.status===429){err.textContent='Too many reset emails were asked for. Wait a few minutes and try again.';return;}
    if(!r.ok){err.textContent='Could not send the email: '+await cloudErrText(r);return;}
    resetMailAt=Date.now();err.textContent='';
    msg.textContent=`If ${email} is the owner's sign-in email, a reset link is on its way. Look in Spam too. Open the link on any device, choose a new password, and it works everywhere.`;
  }catch(e){err.textContent='No internet connection right now. Try again when connected.';}
  finally{setBusy('fgMailBtn',false);}
}
// the email link comes back as …/#access_token=…&type=recovery (or #error_code=otp_expired…)
const isResetReturn=()=>/(^|[#&])(type=recovery|error_code=)/.test(location.hash||'');
async function startEmailReset(){
  const h=Object.fromEntries(new URLSearchParams((location.hash||'').replace(/^#/,'')).entries());
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}   // the one-time token never stays in the address bar
  const err=el('loginErr');
  if(!h.access_token){
    showAuthView('forgot');
    err.textContent=/expired|invalid/i.test((h.error_code||'')+' '+(h.error_description||''))?'That reset link has expired or was already used. Ask for a new one below.':'That reset link did not work'+(h.error_description?': '+h.error_description:'')+'. Ask for a new one below.';
    return;
  }
  resetSess={access:h.access_token,refresh:h.refresh_token||'',exp:Date.now()+((parseInt(h.expires_in)||3600)*1000),email:'',uid:''};
  try{const r=await fetch(cloudRoot()+'/auth/v1/user',{headers:{apikey:CLOUD_DEFAULT.key,Authorization:'Bearer '+resetSess.access}});
    if(r.ok){const j=await r.json();resetSess.email=normEmail(j.email||'');resetSess.uid=j.id||'';}}catch(e){}
  el('rsInfo').textContent=`Choose a new password for ${resetSess.email||'the owner account'}. It becomes the sign-in on every device.`;
  showAuthView('reset');
}
async function doEmailReset(){
  const pw=el('rsPass').value,err=el('loginErr');
  if(!resetSess){showAuthView('forgot');return;}
  const pp=pwProblem(pw);if(pp){err.textContent=pp;return;}
  if(pw!==el('rsPass2').value){err.textContent='The passwords do not match';return;}
  setBusy('rsBtn',true,'Saving…');
  try{
    let r;
    try{r=await fetch(cloudRoot()+'/auth/v1/user',{method:'PUT',headers:{apikey:CLOUD_DEFAULT.key,Authorization:'Bearer '+resetSess.access,'Content-Type':'application/json'},body:JSON.stringify({password:pw})});}
    catch(e){err.textContent='No internet connection right now. Connect and press Save again.';return;}
    if(r.status===401||r.status===403){resetSess=null;showAuthView('forgot');err.textContent='The reset link has expired. Ask for a new one.';return;}
    if(!r.ok){err.textContent='The new password was not accepted: '+await cloudErrText(r);return;}
    // the cloud has the new password: connect this device with it, then give the MFD POS owner login the same password
    const s=resetSess;
    if(!needsSetup()&&cloudReady()){
      const c=cloudCfg();if(!c.uid||c.uid===s.uid){Object.assign(c,{access:s.access,refresh:s.refresh||c.refresh,exp:s.exp,uid:s.uid||c.uid,email:s.email||c.email});cloudSaveCfg(c);}
      await cloudSync();
    } else {
      cloudSaveCfg({url:CLOUD_DEFAULT.url,key:CLOUD_DEFAULT.key,email:s.email,access:s.access,refresh:s.refresh,exp:s.exp,uid:s.uid});
      cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});
      Cloud.busy=true;
      try{await cloudRestoreAll();await cloudClaimDevice();}
      catch(e){showAuthView('login');err.textContent='Your new password is saved in the cloud, but the shop could not be copied here: '+e.message+' Sign in with the new password.';return;}
      finally{Cloud.busy=false;}
      const cfg=cloudCfg();cfg.linked=true;cfg.lastSync=new Date().toISOString();cfg.lastError='';cloudSaveCfg(cfg);cloudSetState('ok');
    }
    const owners=S.users.filter(u=>u.role==='admin'&&u.pwHash);
    const u=owners.find(x=>normEmail(x.email)===s.email)||(owners.length===1?owners[0]:null);
    resetSess=null;el('rsPass').value='';el('rsPass2').value='';
    if(!u){initLogin();toast('Password changed. Sign in with the new password.');return;}
    const hs=await hashSecret(pw);Object.assign(u,{pwHash:hs.hash,pwSalt:hs.salt,mustChange:false});
    clearFail('login:'+normEmail(u.email));
    logAudit('Owner password reset with the email link',u.name);saveState();
    if(cloudReady()) await cloudSync();                  // other tills get the new owner password at their next sync
    completeLogin(u);toast('Password changed — use it to sign in on every device');
  }finally{setBusy('rsBtn',false);}
}

function completeLogin(u,quiet){
  curUser=u;
  try{sessionStorage.setItem('mfd_sess',JSON.stringify({id:u.id,t:Date.now()}));}catch(e){}
  askPersist();
  try{localStorage.setItem('mfd_last_email',u.email||'');}catch(e){}
  shiftCashier=curUser.name;
  document.getElementById('loginSc').classList.add('gone');
  document.getElementById('curUserLbl').textContent=`${curUser.name}`;
  buildNav();showSc(curUser.role==='admin'?'home':'pos');renderProds();renderCustSel();renderZoneOptions();
  updateSuspBadge();updateSyncUI();
  const backBtn=document.getElementById('posBackBtn');
  if(backBtn) backBtn.style.display=curUser.role==='admin'?'flex':'none';
  resetIdleTimer();
  if(!quiet) toast(`Welcome, ${curUser.name}`);
  const osh=curShift();
  if(osh&&new Date(osh.start).toDateString()!==new Date().toDateString()){
    const d=new Date(osh.start).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'});
    setTimeout(()=>confirm('Shift not closed',`The shift opened on ${d} was never closed. Do the cash-up for that shift before starting today's sales.`,()=>showSc('cashup'),false),400);
  }
}

function logoutPrompt(){
  const sh=curShift();
  if(!sh){logout();return;}
  const st=new Date(sh.start);
  const when=st.toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'})+' at '+st.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('logoutInfo').textContent=`Opened ${when}${sh.openedBy?' by '+sh.openedBy:''} · Float R ${fmtR(Number(sh.float||0))}`;
  openMo('logoutMo');
}
function endShiftFromLogout(){
  closeMo('logoutMo');showSc('cashup');
  toast('Count the till and submit the cash-up to close the shift');
}
function logout(){try{sessionStorage.removeItem('mfd_sess');sessionStorage.removeItem('mfd_cart');}catch(e){}clearTimeout(idleTimer);curUser=null;pendingUser=null;document.querySelectorAll('.ov.on').forEach(o=>o.classList.remove('on'));document.getElementById('loginSc').classList.remove('gone');initLogin();}

// ═══════════════════════════════════════
// AUTO-LOCK (idle timeout)
// ═══════════════════════════════════════
let idleTimer=null;
function resetIdleTimer(){
  clearTimeout(idleTimer);
  if(!curUser) return;
  try{const ss=JSON.parse(sessionStorage.getItem('mfd_sess')||'null');if(ss&&Date.now()-ss.t>20000){ss.t=Date.now();sessionStorage.setItem('mfd_sess',JSON.stringify(ss));}}catch(e){}
  const mins=parseInt(S.settings.autoLockMinutes)||0;
  if(mins<=0) return;
  idleTimer=setTimeout(autoLock,mins*60*1000);
}
function autoLock(){
  if(!curUser) return;
  const name=curUser.name;
  logout();
  toast(`${name} was auto-locked after inactivity`);
}
['mousemove','mousedown','keydown','touchstart','scroll','click'].forEach(evt=>{
  document.addEventListener(evt,()=>{if(curUser) resetIdleTimer();},{passive:true});
});

// ═══════════════════════════════════════
// ADMIN PIN
// ═══════════════════════════════════════
function reqAdmin(reason,cb){
  if(curUser&&curUser.role==='admin'){logAudit(reason,curUser.name);cb();return;}
  apinCb=cb;apinEntry="";
  pendingAuditReason=reason;
  document.getElementById('apinReason').textContent=reason;
  document.getElementById('apinErr').textContent='';
  const dotEl=document.getElementById('apinDots');
  if(dotEl) dotEl.innerHTML='<div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div>';
  const padEl=document.getElementById('apinPad');
  if(padEl){
    padEl.innerHTML='';
    ['1','2','3','4','5','6','7','8','9','✕','0','↵'].forEach(function(k){
      const btn=document.createElement('button');
      btn.className='pp'; btn.textContent=k;
      btn.onclick=function(){adminPinKey(k);};
      padEl.appendChild(btn);
    });
  }
  document.getElementById('apinOv').classList.add('on');
}
let lastApprover=null;
async function verifyApprovalPin(pin){
  for(const a of S.users.filter(u=>u.role==='admin'&&u.apHash)){if(await verifySecret(pin,a.apHash,a.apSalt)) return a;}
  return null;
}
async function adminPinKey(k){
  const err=document.getElementById('apinErr');
  if(k==='✕') apinEntry=apinEntry.slice(0,-1);
  else if(k!=='↵'&&apinEntry.length<4) apinEntry+=k;
  const dotEl=document.getElementById('apinDots');
  const paint=()=>{if(dotEl){dotEl.querySelectorAll('.pin-dot').forEach((d,i)=>d.classList.toggle('on',i<apinEntry.length));}};
  paint();
  if(k==='↵'||apinEntry.length===4){
    if(apinEntry.length<4){err.textContent='Enter the 4-digit PIN';return;}
    const lk=lockedMsg('approve');if(lk){err.textContent=lk;apinEntry='';paint();return;}
    const entry=apinEntry;apinEntry='';paint();err.textContent='Checking…';
    const admin=await verifyApprovalPin(entry);
    if(admin){clearFail('approve');lastApprover=admin;closeApin();logAudit(pendingAuditReason,`${curUser?curUser.name:'Unknown'} (approved by ${admin.name})`);if(apinCb) apinCb();}
    else{noteFail('approve',5,5);err.textContent=lockedMsg('approve')||'Incorrect PIN';}
  }
}
function doApinKey(){}

function logAudit(action,by){
  S.auditLog.unshift({id:newNumId('nextAuditId',S.auditLog),action,by,date:nowStamp()});
  if(S.auditLog.length>500) S.auditLog=S.auditLog.slice(0,500);
  saveState();
}

function openAuditLog(){
  document.getElementById('auditSrch').value='';
  renderAuditLog();
  openMo('auditMo');
}

function renderAuditLog(){
  const srch=document.getElementById('auditSrch')?.value.toLowerCase()||'';
  const list=S.auditLog.filter(a=>a.action.toLowerCase().includes(srch)||(a.by||'').toLowerCase().includes(srch));
  const tbl=document.getElementById('auditTbl');
  if(!list.length){tbl.innerHTML='<tr><td colspan="3" style="padding:20px;text-align:center;color:var(--gl)">No admin actions logged yet</td></tr>';return;}
  tbl.innerHTML=list.map(a=>`<tr>
    <td style="padding:7px;font-size:11px;color:var(--g);border-bottom:1px solid var(--sand)">${a.date}</td>
    <td style="padding:7px;border-bottom:1px solid var(--sand)">${a.action}</td>
    <td style="padding:7px;font-size:12px;border-bottom:1px solid var(--sand)">${a.by}</td>
  </tr>`).join('');
}

function pinKey(k,dotId,cbName){
  const entries={pinDots:'loginEntry',apinDots:'apinEntry'};
  if(dotId==='pinDots'){return;
  } else {
    if(k==='✕') apinEntry=apinEntry.slice(0,-1);
    else if(k==='↵'){adminPinKey('↵');return;}
    else if(apinEntry.length<4) apinEntry+=k;
    dots(dotId,apinEntry.length);
  }
}
function closeApin(){document.getElementById('apinOv').classList.remove('on');apinEntry="";}

// ═══════════════════════════════════════
// CONFIRM DIALOG
// ═══════════════════════════════════════
function confirm(title,msg,cb,danger=true){
  confCb=cb;
  document.getElementById('confTitle').textContent=title;
  document.getElementById('confMsg').textContent=msg;
  const btn=document.getElementById('confOkBtn');
  btn.className=danger?'btn-d':'btn';
  document.getElementById('confOv').classList.add('on');
}
function closeConf(){document.getElementById('confOv').classList.remove('on');confCb=null;}
function doConf(){const cb=confCb;closeConf();if(cb) cb();}

// small in-app form: askForm('Edit zone',[{id,label,type,value,placeholder}],vals=>{…; return true to close})
let askCb=null;
function askForm(title,fields,onOk,okLabel){
  const q=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  el('askTitle').textContent=title;el('askOkBtn').textContent=okLabel||'Save';
  el('askBody').innerHTML=fields.map(f=>
    f.type==='html'?`<div>${f.html}</div>`
    :f.type==='checkbox'?`<label style="display:flex;gap:8px;align-items:center;font-size:13px;cursor:pointer"><input id="ask_${f.id}" type="checkbox" ${f.value?'checked':''}> ${q(f.label)}</label>`
    :f.type==='select'?`<div class="fg"><label for="ask_${f.id}">${q(f.label)}</label><select id="ask_${f.id}">${f.options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${q(v)}" ${String(v)===String(f.value)?'selected':''}>${q(l)}</option>`;}).join('')}</select></div>`
    :`<div class="fg"><label for="ask_${f.id}">${q(f.label)}</label><input id="ask_${f.id}" type="${f.type||'text'}" ${f.type==='number'?'step="any" min="0" inputmode="decimal"':''} value="${q(f.value)}" placeholder="${q(f.placeholder)}" autocomplete="off"></div>`).join('')+'<button type="submit" hidden></button>';
  askCb=()=>{const v={};fields.forEach(f=>{const i=el('ask_'+f.id);if(i) v[f.id]=f.type==='checkbox'?i.checked:i.value;});return onOk(v);};
  openMo('askMo');setTimeout(()=>{const i=el('ask_'+fields[0].id);if(i){i.focus();if(typeof i.select==='function') i.select();}},60);
}
function askOk(){if(askCb&&askCb()!==false){closeMo('askMo');askCb=null;}}
function showShortcuts(){
  el('askTitle').textContent='Keyboard shortcuts';el('askOkBtn').textContent='OK';
  el('askBody').innerHTML=[['F2','Search products'],['Enter','Add the first result'],['F4 · F6 · F7','Pay by cash · card · EFT'],['F8','Calculator'],['F9','Charge'],['Esc','Close window'],['F11','Full screen (desktop app)']]
    .map(([k,v])=>`<div style="display:flex;gap:12px;font-size:13px;padding:3px 0"><b style="min-width:96px;font-family:var(--font-mono)">${k}</b><span>${v}</span></div>`).join('');
  askCb=()=>true;openMo('askMo');
}

// ═══════════════════════════════════════
// NAV
// ═══════════════════════════════════════
function buildNav(){
  updateNavBadge();
  try{buildSidebar();}catch(e){}
}

function toggleContactsNavMenu(ev){
  ev.stopPropagation();
  const menu=document.getElementById('navContactsMenu');
  const wasOpen=menu.classList.contains('open');
  closeAllSaleMenus();
  if(!wasOpen) menu.classList.add('open');
}

function toggleSellNavMenu(ev){
  ev.stopPropagation();
  const menu=document.getElementById('navSellMenu');
  const wasOpen=menu.classList.contains('open');
  closeAllSaleMenus();
  if(!wasOpen) menu.classList.add('open');
}

function showSc(name){
  try{document.body.classList.toggle('on-till',name==='pos');}catch(e){}
  {const ts=document.getElementById('taxSec')||document.getElementById('taxReport')?.closest('.rep-sec');if(ts) ts.style.display=(S.settings.vatRate>0)?'':'none';}
  try{sbActive(name);}catch(e){}
  if(name==='pos'){try{renderQuick();}catch(e){}}
  document.querySelector('.tb')?.classList.remove('nav-open');
  {const mb=document.getElementById('tbMenuBtn');if(mb) mb.textContent='☰';}
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  document.getElementById('sc-'+name)?.classList.add('on');
  document.getElementById('nb-'+name)?.classList.add('on');
  if(['pos','sales','quotes','sellreturns','discounts'].includes(name)) document.getElementById('nb-sell')?.classList.add('on');
  if(name==='delivery') document.getElementById('nb-sell')?.classList.add('on');
  if(['customers','suppliers','owed'].includes(name)) document.getElementById('nb-contacts')?.classList.add('on');
  if(name==='owed') renderOwed();
  if(name==='inventory') renderInv();
  if(name==='customers') renderCusts();
  if(name==='suppliers') renderSuppliers();
  if(name==='reports') renderReports();
  if(name==='delivery') renderKanban();
  if(name==='quotes') renderQuotes();
  if(name==='cashup') renderCashup();
  if(name==='pos'&&!curShift()) setTimeout(()=>{if(!curShift()) openShiftPrompt();},150);
  if(name==='settings') renderSettings();
  if(name==='sales') renderSales();
  if(name==='home') renderHome();
  if(name==='purchases') renderPurchases();
  if(name==='sellreturns') renderSellReturns();
  if(name==='discounts') renderDiscounts();
  if(name==='yard') renderYard();
}

function updateNavBadge(){
  const low=S.products.filter(p=>!p.noStock&&p.stk<=p.ls).length;
  const nb=document.getElementById('nb-inventory');
  if(nb) nb.innerHTML=`<i class=i-box></i> Inventory${low>0?` <span style="background:var(--err);color:#fff;border-radius:10px;padding:1px 6px;font-size:10px;margin-left:2px;">${low}</span>`:''}`;
}

// ═══════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════
function renderProds(){
  const srch=document.getElementById('pSrch')?.value.toLowerCase()||'';
  const list=S.products.filter(p=>(catFilter==='all'||p.cat===catFilter)&&p.name.toLowerCase().includes(srch));
  const g=document.getElementById('pgrid');
  if(!list.length){g.innerHTML='<div style="padding:30px;color:var(--gl);text-align:center;grid-column:1/-1">No products found</div>';return;}
  const seen=new Set();
  g.innerHTML=list.map(p=>{
    if(p.group){
      if(seen.has(p.group)) return '';seen.add(p.group);
      const ms=list.filter(x=>x.group===p.group),prices=ms.map(x=>priceFor(x,selCust)),lo=Math.min(...prices),hi=Math.max(...prices);
      const avail=ms.filter(x=>x.noStock||x.stk>0).length,out=!avail;
      return `<div class="pc ${out?'out':''}" data-cat="${p.cat}" onclick="pickSize('${esc(p.group).replace(/'/g,"\\'")}')">
        <div class="pc-nm">${esc(p.group)}</div>
        <div class="pc-unit">${ms.length} sizes · ${esc(ms.map(x=>x.size||x.name).join(' / '))}</div>
        <div class="pc-pr">${lo===hi?'':'from '}R ${lo.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div>
        <div class="pc-stk ${out?'none':''}">${ms.every(x=>x.noStock)?'Always available':out?'✗ Out of stock':'Tap to choose the size'}</div>
      </div>`;
    }
    const isOut=!p.noStock&&!(p.stk>0),isLow=!isOut&&!p.noStock&&p.stk<=p.ls;
    return `<div class="pc ${isOut?'out':''}" data-cat="${p.cat}" onclick="addCart(${p.id})">
      ${isLow&&!isOut?'<div class="pc-low">Low</div>':''}
      <div class="pc-nm">${p.name}</div>${p.code?`<div class="pc-code">${esc(p.code)}</div>`:''}
      <div class="pc-unit">${/^per /.test(p.unit)?p.unit:"per "+p.unit}</div>
      <div class="pc-pr">R ${priceFor(p,selCust).toLocaleString('en-ZA',{minimumFractionDigits:2})}</div>${isBuilder(selCust)&&p.trade>0?'<div class="ci-sub" style="color:var(--clay);font-weight:600">Builder price</div>':''}
      ${p.bp?`<div class="pc-bulk">Bulk ≥${p.bm.toLocaleString()}: R ${fmtR(p.bp)}</div>`:''}
      ${p.pallet&&p.pallet.qty?`<div class="pc-bulk">Pallet of ${p.pallet.qty.toLocaleString('en-ZA')}${p.pallet.price?': R '+fmtR(p.pallet.price):''} <button class="pc-pal" onclick="event.stopPropagation();addPallet(${p.id})">+ Pallet</button></div>`:''}
      <div class="pc-stk ${isOut?'none':isLow?'low':''}">${p.noStock?'Always available':isOut?'✗ Out of stock':isLow?`<i class=i-alert></i> ${p.stk.toLocaleString()} left`:`${p.stk.toLocaleString()} in stock`}</div>
    </div>`;
  }).join('');
}
function pickSize(group){
  const ms=S.products.filter(x=>x.group===group);if(!ms.length) return;
  el('askTitle').textContent=`${group} — choose the size`;el('askOkBtn').textContent='Close';
  el('askBody').innerHTML=`<div class="size-pick">${ms.map(x=>{const out=!x.noStock&&!(x.stk>0);return `<button type="button" class="size-btn ${out?'out':''}" onclick="closeMo('askMo');addCart(${x.id})"><b>${esc(x.size||x.name)}</b><span>R ${fmtR(priceFor(x,selCust))}${x.unit&&x.unit!=='each'?' / '+esc(x.unit):''}</span><small>${x.noStock?'Always available':out?'Out of stock':x.stk.toLocaleString()+' in stock'}</small></button>`;}).join('')}</div>`;
  askCb=()=>true;openMo('askMo');
}
// "+ Pallet": adds one full pallet to the cart (pallet price applies from that quantity)
function addPallet(id){
  const p=S.products.find(x=>x.id===id);if(!p||!p.pallet||!p.pallet.qty) return;
  const ex=cart.find(x=>x.id===id),q=p.pallet.qty;
  if(!p.noStock&&(ex?ex.qty:0)+q>p.stk){toast(`Only ${p.stk.toLocaleString()} ${p.unit} in stock`,true);return;}
  if(ex) ex.qty+=q;else{addCart(id);const n=cart.find(x=>x.id===id);if(!n) return;n.qty=q;}
  const it=cart.find(x=>x.id===id);it.bulk=!!(it.bm&&it.qty>=it.bm);renderCart();scrollCartTo(id);
}

function setCat(btn,cat){
  document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');catFilter=cat;renderProds();
}

// ═══════════════════════════════════════
// CART
// ═══════════════════════════════════════
let cart=[];
function gP(i){return i.bulk&&i.bp?i.bp:i.up;}

function addCart(id){
  const p=S.products.find(x=>x.id===id);
  if(!p) return;
  if(!p.noStock&&!(p.stk>0)){
    if(curUser&&curUser.role==='admin'){openAdjust(id);toast(`${p.name} is out of stock. Add the stock you have, then sell.`);}
    else toast(`${p.name} is out of stock. Ask the owner to add stock (Inventory → Adjust).`,true);
    return;
  }
  const ex=cart.find(x=>x.id===id);
  if(ex){if(!p.noStock&&ex.qty>=p.stk){toast('Max stock reached',true);return;}ex.qty++;if(p.bm&&ex.qty>=p.bm)ex.bulk=true;}
  else cart.push({id:p.id,name:p.name,qty:1,up:priceFor(p,selCust),bp:p.bp,bm:p.bm,bulk:false,unit:p.unit,tier:isBuilder(selCust)&&p.trade>0?'builder':''});
  renderCart();
  scrollCartTo(id);
}

function scrollCartTo(id){
  requestAnimationFrame(()=>{
    const row=document.querySelector('.ci-row[data-id="'+id+'"]');
    if(row) row.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
}

function chQty(id,d){
  const item=cart.find(x=>x.id===id);const prod=S.products.find(x=>x.id===id);if(!item) return;
  item.qty=Math.max(Number.isInteger(item.qty+d)?1:0.5,Math.round((item.qty+d)*100)/100);
  if(prod&&!prod.noStock&&item.qty>prod.stk){item.qty=prod.stk;toast('Max stock reached',true);}
  item.bulk=item.bm&&item.qty>=item.bm;renderCart();
}

function setQty(id,v){const item=cart.find(x=>x.id===id);if(!item) return;const n=parseFloat(v);if(!(n>0)){rmCart(id);return;}chQty(id,n-item.qty);}
function rmCart(id){cart=cart.filter(x=>x.id!==id);renderCart();}

function clearCartNow(){
  cart=[];payMethod=null;selCust=null;
  document.getElementById('custSel').value='';
  resetWalkin();
  const bi=document.getElementById('custBalanceInfo');if(bi){bi.style.display='none';bi.innerHTML='';}
  document.getElementById('delChk').checked=false;
  document.getElementById('delZone').style.display='none';
  document.getElementById('delZone').value='0';
  document.getElementById('delDets').style.display='none';
  {const dt=document.getElementById('delTrips');if(dt) dt.value=1;}
  ['delAddr','delDriver','delTruck','delCustFee','delReq'].forEach(id=>{const el=document.getElementById(id);if(el) el.value='';});
  const dcf=document.getElementById('delCustFee');if(dcf) dcf.style.display='none';
  document.getElementById('discChk').checked=false;
  discApprovedBy=null;
  document.getElementById('discType').value='pct';
  document.getElementById('discType').style.display='none';
  document.getElementById('discAmt').value='0';
  document.getElementById('discAmt').style.display='none';
  document.getElementById('discLbl').style.display='none';
  document.getElementById('saleNote').value='';
  document.getElementById('cashBox').style.display='none';
  document.getElementById('splitBox').style.display='none';
  const sc=document.getElementById('splitCash'),scd=document.getElementById('splitCard');
  if(sc) sc.value='';if(scd) scd.value='';
  document.getElementById('depositBox').style.display='none';
  const da=document.getElementById('depositAmt');if(da) da.value='';
  const dm=document.getElementById('depositMethod');if(dm) dm.value='cash';
  const ds=document.getElementById('depositStatus');if(ds) ds.textContent='';
  const ci=document.getElementById('cashIn');if(ci) ci.value='';
  const er=document.getElementById('eftRefNo');if(er) er.value='';
  const cb2=document.getElementById('changeBox'),ca2=document.getElementById('changeAmt');
  if(cb2) cb2.style.display='none';
  if(ca2) ca2.textContent='';
  document.getElementById('moreToggle').classList.remove('open');
  document.getElementById('morePanel').classList.remove('open');
  setPay(null);renderCart();
  try{posTab('prod');}catch(e){}
}

function confirmClear(){
  if(!cart.length) return;
  confirm('Clear Sale','This will remove all items from the current sale.',clearCartNow);
}

function confirmHold(){
  if(!cart.length){toast('Add products first',true);return;}
  confirm('Hold Sale','Save this sale to Suspended Sales? You can resume it anytime before checkout.',()=>{
    const heldId=newDocId('HOLD','nextHeldId',S.heldSales);
    S.heldSales.unshift({
      id:heldId,
      cart:cart.map(i=>({...i})),
      custId:selCust?selCust.id:null,
      custName:selCust?selCust.name:'Walk-in Customer',
      walkinPhone:document.getElementById('walkinPhone')?.value||'',
      walkinName:document.getElementById('walkinName')?.value||'',
      delChk:document.getElementById('delChk').checked,
      delZone:document.getElementById('delZone').value,
      delAddr:document.getElementById('delAddr').value,
      delDriver:document.getElementById('delDriver').value,
      delTruck:document.getElementById('delTruck').value,
      delCustFee:document.getElementById('delCustFee').value,
      delReq:document.getElementById('delReq').value,
      delTrips:document.getElementById('delTrips').value,
      discApprovedBy:discApprovedBy,
      discChk:document.getElementById('discChk').checked,
      discAmt:document.getElementById('discAmt').value,
      note:document.getElementById('saleNote').value,
      itemCount:cart.length,
      total:document.getElementById('cTotal').textContent,
      cashier:curUser?.name,
      savedAt:new Date().toLocaleString('en-ZA'),
    });
    clearCartNow();saveState();updateSuspBadge();
    toast(`Sale suspended — ${heldId}`);
  },false);
}

function updateSuspBadge(){
  const badge=document.getElementById('suspBadge');
  if(!badge) return;
  const n=S.heldSales.length;
  badge.style.display=n>0?'flex':'none';
  badge.textContent=n;
}

function openSuspended(){renderSuspendedList();openMo('suspMo');}

function renderSuspendedList(){
  const el=document.getElementById('suspList');
  if(!S.heldSales.length){el.innerHTML='<div style="font-size:13px;color:var(--g);padding:20px;text-align:center">No suspended sales.</div>';return;}
  el.innerHTML=S.heldSales.map(h=>`
    <div style="background:var(--sand);border-radius:8px;padding:11px 14px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:700">${h.id} — ${h.custName}</div>
        <div style="font-size:11px;color:var(--g)">${h.itemCount} item(s) · ${h.total} · Held at ${h.savedAt}</div>
        ${h.note?`<div style="font-size:11px;color:var(--g);margin-top:2px"><i class=i-note></i> ${h.note}</div>`:''}
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn" style="font-size:12px;padding:6px 12px" onclick="resumeSuspended('${h.id}')">Resume</button>
        <button class="btn-d" style="font-size:12px;padding:6px 12px" onclick="deleteSuspended('${h.id}')">Delete</button>
      </div>
    </div>`).join('');
}

function resumeSuspended(id){
  const h=S.heldSales.find(x=>x.id===id);if(!h) return;
  if(cart.length){toast('Clear or complete the current sale before resuming a held one',true);return;}
  cart=h.cart.map(i=>({...i}));
  if(h.custId){
    selCust=S.customers.find(c=>c.id===h.custId)||null;
    document.getElementById('custSel').value=h.custId;
  }
  document.getElementById('walkinPhone').value=h.walkinPhone||'';
  {const wn=document.getElementById('walkinName');if(wn) wn.value=h.walkinName||'';}
  document.getElementById('walkinBox').style.display=selCust?'none':'block';
  document.getElementById('delChk').checked=h.delChk;
  togDel();
  if(h.delChk){
    document.getElementById('delZone').value=h.delZone;
    document.getElementById('delAddr').value=h.delAddr;
    document.getElementById('delDriver').value=h.delDriver;
    document.getElementById('delTruck').value=h.delTruck;
    document.getElementById('delCustFee').value=h.delCustFee||'';
    document.getElementById('delReq').value=h.delReq||'';
    document.getElementById('delTrips').value=h.delTrips||1;
  }
  discApprovedBy=h.discChk?(h.discApprovedBy||null):null;
  document.getElementById('discChk').checked=h.discChk;
  togDisc();
  if(h.discChk) document.getElementById('discAmt').value=h.discAmt;
  document.getElementById('saleNote').value=h.note||'';
  if(h.delChk||h.discChk||h.note){
    document.getElementById('moreToggle').classList.add('open');
    document.getElementById('morePanel').classList.add('open');
  }
  S.heldSales=S.heldSales.filter(x=>x.id!==id);
  saveState();updateSuspBadge();
  closeMo('suspMo');renderCart();
  toast(`${id} resumed`);
}

function deleteSuspended(id){
  confirm('Delete Suspended Sale',`Delete ${id} permanently?`,()=>{
    S.heldSales=S.heldSales.filter(x=>x.id!==id);
    saveState();updateSuspBadge();renderSuspendedList();
    toast('Suspended sale deleted');
  });
}

function togBulk(id){const item=cart.find(x=>x.id===id);if(item&&item.bp) item.bulk=!item.bulk;renderCart();}

function renderCart(){
  try{if(curUser) sessionStorage.setItem('mfd_cart',JSON.stringify({cart,cust:selCust?selCust.id:null}));}catch(e){}
  const el=document.getElementById('cartEl');
  document.getElementById('cartCnt').textContent=cart.length?`(${cart.length})`:'';
  if(!cart.length){el.innerHTML='<tr><td colspan="4"><div class="cart-empty" style="padding:40px 10px"><div><i class=i-cart></i></div><div style="font-size:12px">Select products to begin</div></div></td></tr>';calcCart();return;}
  el.innerHTML=cart.map(item=>`
    <tr class="ci-row" data-id="${item.id}">
      <td>
        <div class="ci-nm">${item.name}${item.bp?`<button class="ci-blk ${item.bulk?'on':''}" onclick="togBulk(${item.id})">${item.bulk?' Bulk':'Unit'}</button>`:''}</div>
        <div class="ci-sub">R ${gP(item).toLocaleString('en-ZA',{minimumFractionDigits:2})} / ${item.unit}${item.tier==='builder'?' · <b style="color:var(--clay)">Builder price</b>':''}</div>
      </td>
      <td>
        <div class="qty">
          <button class="qb" onclick="chQty(${item.id},-1)" aria-label="Less">−</button>
          <input class="qv-in" type="number" inputmode="decimal" min="0" step="any" value="${item.qty}" onchange="setQty(${item.id},this.value)" onfocus="this.select()">
          <button class="qb" onclick="chQty(${item.id},1)" aria-label="More">+</button>
        </div>
      </td>
      <td class="ci-pr">R ${(gP(item)*item.qty).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
      <td><button class="rm" onclick="rmCart(${item.id})" title="Remove"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg></button></td>
    </tr>`).join('');
  calcCart();
}

function toggleMoreOptions(){
  document.getElementById('moreToggle').classList.toggle('open');
  document.getElementById('morePanel').classList.toggle('open');
}

function togDel(){
  const chk=document.getElementById('delChk');
  const on=chk&&chk.checked;
  const zone=document.getElementById('delZone');
  const dets=document.getElementById('delDets');
  if(zone) zone.style.display=on?'block':'none';
  if(dets) dets.style.display=on?'flex':'none';
  calcCart();
}

function togDisc(){
  const chk=document.getElementById('discChk');
  if(chk.checked&&!discApprovedBy){
    chk.checked=false;togDiscShow();
    reqAdmin('Admin PIN required to approve a discount',()=>{discApprovedBy=adminName();chk.checked=true;togDiscShow();});
    return;
  }
  if(!chk.checked) discApprovedBy=null;
  togDiscShow();
}
function togDiscShow(){
  const on=document.getElementById('discChk').checked;
  document.getElementById('discType').style.display=on?'inline-block':'none';
  document.getElementById('discAmt').style.display=on?'inline-block':'none';
  document.getElementById('discLbl').style.display=on?'inline':'none';
  updateDiscLbl();
  calcCart();
}

function updateDiscLbl(){
  const type=document.getElementById('discType').value;
  document.getElementById('discLbl').textContent=type==='pct'?`max ${S.settings.maxDisc}% · admin approved`:`max R${(cart.reduce((s,i)=>s+gP(i)*i.qty,0)*S.settings.maxDisc/100).toFixed(0)}`;
}

function calcCart(){
  try{syncQuick();}catch(e){}
  try{updateMobileCartBadge();}catch(e){}
  syncCustFee('delZone','delCustFee',document.getElementById('delChk').checked);
  const sub=cart.reduce((s,i)=>s+gP(i)*i.qty,0);
  const discOn=document.getElementById('discChk').checked;
  const discType=document.getElementById('discType').value;
  const maxFixed=sub*S.settings.maxDisc/100;
  let rawD=parseFloat(document.getElementById('discAmt')?.value)||0;
  const cap=discType==='pct'?S.settings.maxDisc:maxFixed;
  if(rawD>cap){rawD=cap;document.getElementById('discAmt').value=discType==='pct'?cap:cap.toFixed(2);}
  updateDiscLbl();
  let discAmt=0;
  if(discOn){discAmt=discType==='pct'?sub*rawD/100:rawD;}
  const afterD=sub-discAmt;
  const delOn=document.getElementById('delChk').checked;
  const del=delOn?getDelFee('delZone','delCustFee'):0;
  const vat=afterD*(S.settings.vatRate/100);
  const grand=afterD+vat+del;
  document.getElementById('cSub').textContent=`R ${fmtR(sub)}`;
  document.getElementById('cVat').textContent=`R ${fmtR(vat)}`;
  document.getElementById('cVatRow').style.display=S.settings.vatRate>0?'flex':'none';
  document.getElementById('cVatLbl').textContent=`VAT (${S.settings.vatRate}%)`;
  document.getElementById('cTotal').textContent=`R ${fmtR(grand)}`;
  const ctf=document.getElementById('cTotalFooter');
  if(ctf) ctf.textContent=`R ${fmtR(grand)}`;
  const discRow=document.getElementById('discSummaryRow');
  if(discRow){discRow.style.display=discOn&&discAmt>0?'flex':'none';document.getElementById('discSummaryVal').textContent=`− R ${fmtR(discAmt)}`;}
  const delRow=document.getElementById('delSummaryRow');
  if(delRow){delRow.style.display=delOn&&del>0?'flex':'none';document.getElementById('delSummaryVal').textContent=`R ${fmtR(del)}`;}
  const btn=document.getElementById('chargeBtn');
  btn.textContent='Charge';
  let blocked=!cart.length;
  if(payMethod==='cash'){
    const tendered=parseFloat(document.getElementById('cashIn')?.value)||0;
    if(tendered<=0||tendered<grand-0.01) blocked=true;
  }
  btn.disabled=blocked;
  if(payMethod==='cash') renderQuickCash();
  if(payMethod==='account') calcDeposit();
  calcChange();
}

function setPay(m){
  payMethod=m;
  if(m&&window.innerWidth<=760&&typeof posTab==='function'&&document.getElementById('sc-pos').classList.contains('on')) posTab('cart');
  ['cash','card','eft','account','split'].forEach(x=>document.getElementById('p-'+x).classList.toggle('on',x===m));
  document.getElementById('cashBox').style.display=m==='cash'?'block':'none';
  document.getElementById('eftRef').style.display=m==='eft'?'block':'none';
  document.getElementById('splitBox').style.display=m==='split'?'block':'none';
  document.getElementById('depositBox').style.display=m==='account'?'block':'none';
  const ci=document.getElementById('cashIn');if(ci) ci.value='';
  const cb=document.getElementById('changeBox'),ca=document.getElementById('changeAmt');
  if(cb) cb.style.display='none';
  if(ca) ca.textContent='';
  if(m==='cash') renderQuickCash();
  if(m==='split'){document.getElementById('splitCash').value='';document.getElementById('splitCard').value='';calcSplit();}
  if(m==='account'){document.getElementById('depositAmt').value='';calcDeposit();}
  calcCart();
}

function calcDeposit(){
  const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
  const dep=parseFloat(document.getElementById('depositAmt')?.value)||0;
  const st=document.getElementById('depositStatus');
  if(!st) return;
  if(dep<=0){st.textContent=`Full R ${fmtR(total)} will go onto the customer's account.`;return;}
  if(dep>=total){st.textContent='✓ Fully paid now — nothing added to account.';return;}
  st.textContent=`R ${fmtR((total-dep))} will go onto the customer's account.`;
}

function calcSplit(){
  const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
  const cash=parseFloat(document.getElementById('splitCash')?.value)||0;
  const card=parseFloat(document.getElementById('splitCard')?.value)||0;
  const sum=cash+card;
  const diff=total-sum;
  const st=document.getElementById('splitStatus');
  if(!st) return;
  if(Math.abs(diff)<0.01){st.style.background='var(--ok-b)';st.style.color='var(--ok)';st.textContent='✓ Fully covered';}
  else if(diff>0){st.style.background='var(--warn-b)';st.style.color='var(--warn)';st.textContent=`R ${fmtR(diff)} still needed`;}
  else{st.style.background='var(--err-b)';st.style.color='var(--err)';st.textContent=`R ${fmtR(Math.abs(diff))} over the total`;}
}

function renderQuickCash(){
  const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
  const denoms=[50,100,200,500,1000];
  const r50=Math.ceil(total/50)*50,r100=Math.ceil(total/100)*100;
  const sugg=[...new Set([r50,r100,...denoms.filter(d=>d>=total)])].sort((a,b)=>a-b).slice(0,5);
  const qc=document.getElementById('qcash');
  if(qc) qc.innerHTML=sugg.map(d=>`<button class="qcash-btn" onclick="setTendered(${d})">R${d.toLocaleString()}</button>`).join('');
}

function setTendered(amt){const el=document.getElementById('cashIn');if(el){el.value=amt;calcCart();}}

function calcChange(){
  const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
  const rawVal=document.getElementById('cashIn')?.value;
  const tendered=rawVal?parseFloat(rawVal):0;
  const cb=document.getElementById('changeBox'),ca=document.getElementById('changeAmt');
  if(!cb||!ca) return;
  if(!tendered||tendered<=0){cb.style.display='none';ca.textContent='';return;}
  if(tendered<total){cb.style.display='block';cb.style.background='var(--err-b)';ca.style.color='var(--err)';ca.textContent='SHORT R '+(total-tendered).toFixed(2);}
  else{const ch=tendered-total;cb.style.display='block';cb.style.background=ch===0?'var(--ok-b)':'var(--warn-b)';ca.style.color=ch===0?'var(--ok)':'var(--warn)';ca.textContent=ch===0?'✓ Exact amount':'R '+fmtR(ch);}
}

function onCustSelect(){
  const id=parseInt(document.getElementById('custSel').value);
  selCust=S.customers.find(c=>c.id===id)||null;
  if(cart.length) setTimeout(repriceCart,0);
  const wp=document.getElementById('walkinPhone');
  const wb=document.getElementById('walkinBox');if(wb) wb.style.display=selCust?'none':'block';
  if(selCust&&wp){wp.value='';document.getElementById('walkinName').value='';document.getElementById('walkinHint').style.display='none';}
  const bi=document.getElementById('custBalanceInfo');
  if(bi){
    if(selCust&&selCust.type==='account'){
      const pct=selCust.credit>0?(selCust.balance/selCust.credit*100):0;
      const near=pct>=80;
      bi.style.display='block';
      bi.style.background=near?'var(--warn-b)':'var(--sand)';
      bi.style.color=near?'var(--warn)':'var(--gd)';
      bi.innerHTML=`<strong>Balance:</strong> R ${selCust.balance.toLocaleString('en-ZA',{minimumFractionDigits:2})} of R ${selCust.credit.toLocaleString('en-ZA',{minimumFractionDigits:2})} limit${near?' <i class=i-alert></i> Near/over limit':''}`;
    } else {
      bi.style.display='none';bi.innerHTML='';
    }
  }
}

function renderCustSel(){
  const sel=document.getElementById('custSel');const cur=sel.value;
  sel.innerHTML='<option value="">— Walk-in Customer —</option>'+
    S.customers.map(c=>`<option value="${c.id}">${c.name} (Bal: R${c.balance.toLocaleString()})</option>`).join('');
  sel.value=cur;
}

function processPayment(){
  if(!cart.length) return;
  if(!payMethod){toast('Choose a payment method first',true);return;}
  if(!curShift()){openShiftPrompt(()=>processPayment());return;}
  for(const i of cart){
    const p=S.products.find(x=>x.id===i.id);
    if(!p){toast(`${i.name} no longer exists in Inventory — remove it from the cart`,true);return;}
    if(!p.noStock&&i.qty>p.stk){toast(`${p.name}: only ${p.stk.toLocaleString()} ${p.unit} left in stock (cart has ${i.qty}). Adjust the quantity before charging.`,true);return;}
  }
  if(payMethod==='account'&&!selCust){toast('Select a customer for account payment',true);return;}
  let depositAmt=0,depositMethod='cash';
  if(payMethod==='account'){
    depositAmt=parseFloat(document.getElementById('depositAmt').value)||0;
    depositMethod=document.getElementById('depositMethod').value;
  }
  if(payMethod==='account'&&selCust&&selCust.credit>0){
    const sub2=cart.reduce((s,i)=>s+gP(i)*i.qty,0);
    const discOn2=document.getElementById('discChk').checked;
    const discType2=document.getElementById('discType').value;
    const rawD2=parseFloat(document.getElementById('discAmt').value)||0;
    const maxFixed2=sub2*S.settings.maxDisc/100;
    const discAmt2=discOn2?(discType2==='pct'?sub2*Math.min(S.settings.maxDisc,rawD2)/100:Math.min(rawD2,maxFixed2)):0;
    const afterD2=sub2-discAmt2;
    const del2=document.getElementById('delChk').checked?getDelFee('delZone','delCustFee'):0;
    const g2=afterD2*(1+S.settings.vatRate/100)+del2;
    const remaining2=Math.max(0,g2-depositAmt);
    if((selCust.balance+remaining2)>selCust.credit){toast(`Exceeds ${selCust.name}'s credit limit of R${selCust.credit.toLocaleString()}`,true);return;}
  }
  if(document.getElementById('delChk').checked){
    if(!zoneById(document.getElementById('delZone').value)){toast('Select a transport zone',true);return;}
    if(getDelFee('delZone','delCustFee')<=0){toast('Enter the transport price for this trip',true);return;}
    if(!document.getElementById('delAddr').value.trim()){toast('Enter the delivery location or landmark',true);return;}
  }
  if(payMethod==='cash'){
    const tendered=parseFloat(document.getElementById('cashIn')?.value||0);
    const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
    if(tendered<=0){toast('Enter the cash amount received from the customer',true);return;}
    if(tendered<total-0.01){toast('Cash received is less than total',true);return;}
  }
  if(payMethod==='eft'&&!document.getElementById('eftRefNo').value.trim()){toast('Enter EFT reference number',true);return;}
  if(payMethod==='account'&&depositAmt>0){
    const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
    if(depositAmt>total){toast('Deposit cannot be more than the total',true);return;}
  }
  let splitCash=0,splitCard=0;
  if(payMethod==='split'){
    splitCash=parseFloat(document.getElementById('splitCash').value)||0;
    splitCard=parseFloat(document.getElementById('splitCard').value)||0;
    const total=parseFloat(document.getElementById('cTotal')?.textContent?.replace('R ','').replace(/,/g,'')||0);
    if(Math.abs((splitCash+splitCard)-total)>0.01){toast('Split amounts must add up to the total',true);return;}
  }

  const sub=cart.reduce((s,i)=>s+gP(i)*i.qty,0);
  const discOn=document.getElementById('discChk').checked;
  const discType=document.getElementById('discType').value;
  const maxFixed=sub*S.settings.maxDisc/100;
  const rawD=parseFloat(document.getElementById('discAmt').value)||0;
  const discPct=discOn&&discType==='pct'?Math.min(S.settings.maxDisc,rawD):0;
  const discAmt=discOn?(discType==='pct'?sub*discPct/100:Math.min(rawD,maxFixed)):0;
  const afterD=sub-discAmt;
  const del=document.getElementById('delChk').checked?getDelFee('delZone','delCustFee'):0;
  const vat=afterD*(S.settings.vatRate/100);const grand=afterD+vat+del;
  const tendered=payMethod==='cash'?(parseFloat(document.getElementById('cashIn')?.value)||0):0;
  const change=tendered>0?Math.max(0,tendered-grand):0;
  const note=document.getElementById('saleNote').value;
  const eftRef=payMethod==='eft'?document.getElementById('eftRefNo').value:'';
  const discLabel=discOn?(discType==='pct'?`${discPct}%`:'fixed'):'';

  // Deduct stock
  cart.forEach(i=>{const p=S.products.find(x=>x.id===i.id);if(p&&!p.noStock) p.stk-=i.qty;});
  const remainingOwed=payMethod==='account'?Math.max(0,grand-depositAmt):0;
  if(selCust&&payMethod==='account'){selCust.balance+=remainingOwed;selCust.total+=grand;}

  const txId=newDocId('INV','nextTxId',S.transactions);
  lastTxId=txId;
  const custPhone=selCust?selCust.phone:(document.getElementById('walkinPhone')?.value.trim()||'');
  const walkName=selCust?null:(document.getElementById('walkinName')?.value.trim()||'Walk-in');
  S.transactions.unshift({id:txId,cust:selCust?.name||walkName,phone:custPhone,amount:grand,method:payMethod,splitCash,splitCard,depositAmt,depositMethod,remainingOwed,discType:discOn?discType:'none',discRaw:discOn?rawD:0,discAmt,vat,del,date:nowStamp(),items:cart.length,cart:cart.map(i=>({...i})),cashier:curUser?.name,note,eftRef,discApprovedBy:discAmt>0?discApprovedBy:null,delZoneName:del>0?zoneLabel(zoneById(document.getElementById('delZone').value)):'',trips:del>0?tripsFor('delZone'):0});
  if(discAmt>0) logAudit(`Discount R ${fmtR(discAmt)} (${discLabel}) approved on ${txId}`,discApprovedBy||'Admin');
  S.pendingSync=(S.pendingSync||0)+1;updateSyncUI();

  // Link to customer history
  if(selCust){if(!selCust.txHistory) selCust.txHistory=[];selCust.txHistory.unshift(txId);}

  // Capture walk-in phone number for marketing list
  if(!selCust){
    const phone=document.getElementById('walkinPhone')?.value.trim();
    const wname=document.getElementById('walkinName')?.value.trim();
    if(phone&&wname) captureWalkinContact(phone,grand,wname,txId);
  }

  // Auto-create delivery
  if(document.getElementById('delChk').checked){
    const zone=document.getElementById('delZone').options[document.getElementById('delZone').selectedIndex]?.text||'';
    const addr=document.getElementById('delAddr').value;
    const driver=document.getElementById('delDriver').value;
    const truck=document.getElementById('delTruck').value;
    const load=cart.map(i=>`${i.name} × ${i.qty.toLocaleString()} ${i.unit}`).join(', ');
    const delId=newDocId('DEL','nextDelId',S.deliveries);
    const nowIso=new Date().toISOString();
    const trips=tripsFor('delZone');
    const base={id:delId,cust:selCust?.name||walkName,phone:custPhone,load,addr,driver:'',truck:'',date:nowIso.split('T')[0],reqDate:document.getElementById('delReq').value||'',zone:zone,fee:del,depart:'',ret:'',status:'pending',times:{pending:nowIso},slip:false,notes:'',inv:txId};
    S.deliveries.unshift(...makeLoads(base,cart.map(i=>({name:i.name,unit:i.unit,qty:i.qty})),trips));
  }

  showReceipt(txId,sub,discAmt,discLabel,vat,del,grand,tendered,change,note,eftRef,splitCash,splitCard,depositAmt,remainingOwed);
  saleDone=true;
  saveState();updateNavBadge();
}

function showReceipt(id,sub,discAmt,discLabel,vat,del,grand,tendered,change,note,eftRef,splitCash,splitCard,depositAmt,remainingOwed){
  lastTxId=id;
  const lines=cart.map(i=>`<div class="rr"><span>${i.name.substring(0,22)} ×${i.qty}</span><span>R ${fmtR((gP(i)*i.qty))}</span></div>`).join('');
  document.getElementById('rcptBody').innerHTML=`
<div style="text-align:center;margin-bottom:10px">
  ${docHead()}
  <span style="font-size:11px;color:var(--g)">${invLabel()} — ${id}<br>${new Date().toLocaleString('en-ZA')}<br>Cashier: ${DOC_BY} · ${payMethod.toUpperCase()}${eftRef?' · Ref: '+eftRef:''}</span>
  ${selCust?`<br><span style="font-size:11px;font-weight:600">${selCust.name}</span>`:''}
</div>
<div class="rdv"></div>${lines}<div class="rdv"></div>
<div class="rr" style="font-size:12px;color:var(--gd)"><span>Subtotal</span><span>R ${fmtR(sub)}</span></div>
${discAmt>0?`<div class="rr" style="font-size:12px;color:var(--ok)"><span>Discount (${discLabel})</span><span>− R ${fmtR(discAmt)}</span></div>`:''}
${del>0?`<div class="rr" style="font-size:12px;color:var(--gd)"><span>Transport${tripsFor('delZone')>1?' ('+tripsFor('delZone')+' trips)':''}</span><span>R ${fmtR(del)}</span></div>`:''}
${S.settings.vatRate>0?`<div class="rr" style="font-size:12px;color:var(--gd)"><span>VAT (${S.settings.vatRate}%)</span><span>R ${fmtR(vat)}</span></div>`:''}
<div class="rdv"></div><div class="rr rtot"><span>TOTAL</span><span>R ${fmtR(grand)}</span></div>
${splitCash>0||splitCard>0?`<div class="rdv"></div><div class="rr" style="font-size:12px;color:var(--gd)"><span><i class=i-cash></i> Cash Portion</span><span>R ${fmtR(splitCash)}</span></div><div class="rr" style="font-size:12px;color:var(--gd)"><span><i class=i-card></i> Card Portion</span><span>R ${fmtR(splitCard)}</span></div>`:''}
${depositAmt>0?`<div class="rdv"></div><div class="rr" style="font-size:12px;color:var(--gd)"><span>Deposit Paid Now</span><span>R ${fmtR(depositAmt)}</span></div><div class="rr" style="font-size:13px;font-weight:800;color:${remainingOwed>0?'var(--err)':'var(--ok)'}"><span>Balance Remaining</span><span>R ${fmtR((remainingOwed||0))}</span></div>`:''}
${tendered>0?`<div class="rdv"></div><div class="rr" style="font-size:12px;color:var(--gd)"><span>Cash Received</span><span>R ${fmtR(tendered)}</span></div><div class="rr" style="font-size:13px;font-weight:800;color:var(--ok)"><span>Change</span><span>R ${fmtR(change)}</span></div>`:''}
${note?`<div class="rdv"></div><div style="font-size:11px;color:var(--g)">Note: ${note}</div>`:''}
${bankBlock()}<div class="rdv"></div><div style="text-align:center;font-size:11px;color:var(--g)">${S.settings.footer}</div><div style="text-align:center;font-size:9px;color:#999;margin-top:4px;letter-spacing:.5px">MFD POS · by KreativG Studio</div>`;
  openMo('rcptMo');
}

let saleDone=false;
function newSale(){closeMo('rcptMo');if(cart.length) clearCartNow();}

function refundTxById(txId,onDone){
  reqAdmin('Admin PIN required to process a refund',()=>{
    const tx=S.transactions.find(t=>t.id===txId);
    if(!tx){toast('Transaction not found',true);return;}
    confirm('Process Refund',`Refund ${tx.id} for R ${fmtR(tx.amount)}? Stock will be restored.`,()=>{
      if(tx.cart) tx.cart.forEach(i=>{const p=S.products.find(x=>x.id===i.id);if(p&&!p.noStock) p.stk+=i.qty;});
      const c=S.customers.find(x=>x.name===tx.cust);
      if(c&&tx.method==='account') c.balance=Math.max(0,c.balance-(tx.remainingOwed!==undefined?tx.remainingOwed:tx.amount));
      const retId=newDocId('RET','nextReturnId',S.sellReturns);
      S.sellReturns.unshift({
        id:retId,originalInvoice:tx.id,cust:tx.cust,phone:tx.phone||'',amount:tx.amount,
        method:tx.method,items:tx.items,cart:tx.cart?tx.cart.map(i=>({...i})):[],origDate:tx.date,splitCash:tx.splitCash||0,depositAmt:tx.depositAmt||0,depositMethod:tx.depositMethod||'',
        date:nowStamp(),cashier:curUser?.name,refundedBy:curUser?.name
      });
      S.transactions=S.transactions.filter(t=>t.id!==txId);
      saveState();updateNavBadge();
      if(onDone) onDone();
      renderSales();
      toast(`Refund processed — ${retId} logged`);
    });
  });
}

function initRefund(){
  refundTxById(lastTxId,()=>{closeMo('rcptMo');clearCartNow();});
}

function cartToQuote(){if(!cart.length){toast('Add products first',true);return;}qLines=cart.map(i=>({name:i.name,qty:i.qty,unit:i.unit,up:gP(i)}));openQuote(true);}

// ═══════════════════════════════════════
// ALL SALES
// ═══════════════════════════════════════
let salesPage=1;

function salesFilterChanged(){salesPage=1;renderSales();}

function renderSales(){
  const srch=document.getElementById('salesSrch')?.value.toLowerCase()||'';
  const statusF=document.getElementById('salesStatusF')?.value||'all';
  const pageSize=parseInt(document.getElementById('salesPageSize')?.value)||25;
  const full=S.transactions.filter(t=>{
    const matchSrch=t.id.toLowerCase().includes(srch)||t.cust.toLowerCase().includes(srch)||(t.phone||'').toLowerCase().includes(srch);
    const isDue=t.method==='account';
    const matchStatus=statusF==='all'||(statusF==='due'&&isDue)||(statusF==='paid'&&!isDue);
    return matchSrch&&matchStatus;
  });
  const totalPages=Math.max(1,Math.ceil(full.length/pageSize));
  if(salesPage>totalPages) salesPage=totalPages;
  if(salesPage<1) salesPage=1;
  const startIdx=(salesPage-1)*pageSize;
  const list=full.slice(startIdx,startIdx+pageSize);

  const tbl=document.getElementById('salesTbl');
  if(!full.length){
    tbl.innerHTML='<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--gl)">No sales match your search</td></tr>';
    document.getElementById('salesShowingLbl').textContent='Showing 0 of 0 entries';
    document.getElementById('salesPageLbl').textContent='Page 1 of 1';
    return;
  }
  tbl.innerHTML=list.map(t=>{
    const owed=t.method==='account'?(t.remainingOwed??t.amount):0;
    const ml={cash:'Cash',card:'Card',eft:'EFT',account:'Account',split:'Split'}[t.method]||t.method;
    const status=owed>0?`<span class="pill" style="background:var(--warn-b);color:var(--warn)">Owes R ${owed.toLocaleString('en-ZA',{minimumFractionDigits:2})}</span>`:'<span class="pill p-ok">Paid</span>';
    return `<tr>
      <td style="font-size:12px;white-space:nowrap">${t.date.slice(0,16)}</td>
      <td><strong>${t.id}</strong></td>
      <td>${t.cust}${t.phone?`<div class="ci-sub">${t.phone}</div>`:''}</td>
      <td>${ml}</td>
      <td><strong>R ${t.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong>${t.returnedAmt?`<div class="ci-sub" style="color:var(--err)">− R ${t.returnedAmt.toLocaleString('en-ZA',{minimumFractionDigits:2})} returned</div>`:''}</td>
      <td>${status}</td>
      <td>
        <div class="act-wrap">
          <button class="act-btn" onclick="toggleSaleMenu(event,'${t.id}')">Actions</button>
          <div class="act-menu" id="menu-${t.id}">
            <div class="act-item" onclick="viewSaleTx('${t.id}')"><i class=i-eye></i> View</div>
            <div class="act-item" onclick="printSaleTx('${t.id}')"><i class=i-printer></i> Print invoice</div>
            <div class="act-item" onclick="closeAllSaleMenus();downloadDocPdf('invoice','${t.id}')"><i class=i-download></i> Download PDF</div>
            <div class="act-item" onclick="closeAllSaleMenus();lastTxId='${t.id}';sendReceiptWhatsApp()"><i class=i-wa></i> Send on WhatsApp</div>
            <div class="act-sep"></div>
            <div class="act-item" onclick="openItemReturn('${t.id}')"><i class=i-undo></i> Return items</div>
            <div class="act-item" onclick="refundTxById('${t.id}')">⟲ Full refund</div>
            <div class="act-item danger" onclick="deleteSaleTx('${t.id}')"><i class=i-trash></i> Delete</div>
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Totals row — admin only, since it reveals overall business revenue
  const isAdmin=curUser?.role==='admin';
  const exportBtn=document.getElementById('exportSalesBtn');
  if(exportBtn) exportBtn.style.display=isAdmin?'inline-flex':'none';
  if(isAdmin){
    const paidCount=full.filter(t=>t.method!=='account').length;
    const cashCount=full.filter(t=>t.method==='cash').length;
    const totalAmt=full.reduce((s,t)=>s+t.amount,0);
    const totalPaid=full.reduce((s,t)=>s+(t.method!=='account'?t.amount:0),0);
    const totalDue=full.reduce((s,t)=>s+(t.method==='account'?t.amount:0),0);
    const owedTot=full.reduce((s,t)=>s+(t.method==='account'?(t.remainingOwed??t.amount):0),0);
    tbl.innerHTML+=`<tr style="background:var(--sand);font-weight:700;border-top:2px solid var(--sand-d)">
      <td colspan="4" style="padding:9px 13px;color:var(--clay-d)">TOTAL · ${full.length} sales</td>
      <td style="padding:9px 13px">R ${totalAmt.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
      <td colspan="2" style="padding:9px 13px;color:${owedTot>0?'var(--err)':'var(--ok)'}">${owedTot>0?'Owed R '+owedTot.toLocaleString('en-ZA',{minimumFractionDigits:2}):'All paid'}</td>
    </tr>`;
  }

  const showEnd=Math.min(startIdx+pageSize,full.length);
  document.getElementById('salesShowingLbl').textContent=`Showing ${startIdx+1} to ${showEnd} of ${full.length} entries`;
  document.getElementById('salesPageLbl').textContent=`Page ${salesPage} of ${totalPages}`;
}

function salesPageChange(dir){
  salesPage+=dir;
  if(salesPage<1) salesPage=1;
  renderSales();
}

function exportSalesCsv(){
  if(curUser?.role!=='admin'){toast('Admin only',true);return;}
  const srch=document.getElementById('salesSrch')?.value.toLowerCase()||'';
  const statusF=document.getElementById('salesStatusF')?.value||'all';
  const full=S.transactions.filter(t=>{
    const matchSrch=t.id.toLowerCase().includes(srch)||t.cust.toLowerCase().includes(srch)||(t.phone||'').toLowerCase().includes(srch);
    const isDue=t.method==='account';
    const matchStatus=statusF==='all'||(statusF==='due'&&isDue)||(statusF==='paid'&&!isDue);
    return matchSrch&&matchStatus;
  });
  if(!full.length){toast('No sales to export',true);return;}
  const headers=['Date','Invoice No.','Customer','Contact','Cashier','Payment Status','Payment Method','Total Amount','Paid','Due','Items'];
  const rows=full.map(t=>{
    const isDue=t.method==='account';
    return [t.date,t.id,t.cust,t.phone||'',t.cashier||'',isDue?'On Account':'Paid',t.method,t.amount.toFixed(2),(isDue?0:t.amount).toFixed(2),(isDue?t.amount:0).toFixed(2),t.items];
  });
  const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  offerFile(`sales-export-${new Date().toISOString().split('T')[0]}.csv`,'\uFEFF'+csv,'text/csv').then(ok=>{if(ok) toast(`Exported ${full.length} sale(s) to CSV`);});
}

// ═══════════════════════════════════════
// LIST SELL RETURN
// ═══════════════════════════════════════
let retPage=1;
function retFilterChanged(){retPage=1;renderSellReturns();}
function retPageChange(dir){retPage+=dir;if(retPage<1) retPage=1;renderSellReturns();}

function renderSellReturns(){
  const srch=document.getElementById('retSrch')?.value.toLowerCase()||'';
  const pageSize=parseInt(document.getElementById('retPageSize')?.value)||25;
  const full=S.sellReturns.filter(r=>
    r.id.toLowerCase().includes(srch)||
    r.originalInvoice.toLowerCase().includes(srch)||
    r.cust.toLowerCase().includes(srch)
  );
  const totalPages=Math.max(1,Math.ceil(full.length/pageSize));
  if(retPage>totalPages) retPage=totalPages;
  if(retPage<1) retPage=1;
  const startIdx=(retPage-1)*pageSize;
  const list=full.slice(startIdx,startIdx+pageSize);
  const tbl=document.getElementById('retTbl');
  if(!full.length){
    tbl.innerHTML='<tr><td colspan="9" style="padding:20px;text-align:center;color:var(--gl)">No sell returns recorded</td></tr>';
    document.getElementById('retShowingLbl').textContent='Showing 0 of 0 entries';
    document.getElementById('retPageLbl').textContent='Page 1 of 1';
    return;
  }
  const isAdmin=curUser?.role==='admin';
  const exportBtn=document.getElementById('exportRetBtn');
  if(exportBtn) exportBtn.style.display=isAdmin?'inline-flex':'none';
  tbl.innerHTML=list.map(r=>`<tr>
    <td><strong>${r.id}</strong></td>
    <td style="font-size:12px">${r.date}</td>
    <td>${r.originalInvoice}</td>
    <td>${r.cust}</td>
    <td style="font-size:12px;color:var(--g)">${r.phone||'—'}</td>
    <td style="text-transform:capitalize">${r.method}</td>
    <td style="color:var(--err)"><strong>R ${r.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td>
    <td>${r.items}</td>
    <td style="font-size:12px">${r.refundedBy||'—'}</td>
  </tr>`).join('')+(isAdmin?`<tr style="background:var(--sand);font-weight:700;border-top:2px solid var(--sand-d)">
    <td colspan="6" style="padding:9px 13px;color:var(--clay-d)">TOTAL REFUNDED (filtered)</td>
    <td style="padding:9px 13px;color:var(--err)">R ${full.reduce((s,r)=>s+r.amount,0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td colspan="2"></td>
  </tr>`:'');
  const showEnd=Math.min(startIdx+pageSize,full.length);
  document.getElementById('retShowingLbl').textContent=`Showing ${startIdx+1} to ${showEnd} of ${full.length} entries`;
  document.getElementById('retPageLbl').textContent=`Page ${retPage} of ${totalPages}`;
}

function exportRetCsv(){
  if(curUser?.role!=='admin'){toast('Admin only',true);return;}
  const srch=document.getElementById('retSrch')?.value.toLowerCase()||'';
  const full=S.sellReturns.filter(r=>
    r.id.toLowerCase().includes(srch)||r.originalInvoice.toLowerCase().includes(srch)||r.cust.toLowerCase().includes(srch)
  );
  if(!full.length){toast('No returns to export',true);return;}
  const headers=['Return #','Date','Original Invoice','Customer','Contact','Payment Method','Amount Refunded','Items','Refunded By'];
  const rows=full.map(r=>[r.id,r.date,r.originalInvoice,r.cust,r.phone||'',r.method,r.amount.toFixed(2),r.items,r.refundedBy||'']);
  downloadCsv(headers,rows,'sell-returns');
}

// ═══════════════════════════════════════
// LIST DISCOUNTS
// ═══════════════════════════════════════
let discPage=1;
function discFilterChanged(){discPage=1;renderDiscounts();}
function discPageChange(dir){discPage+=dir;if(discPage<1) discPage=1;renderDiscounts();}

function getDiscRows(){
  const src=document.getElementById('discSourceF')?.value||'all';
  const rows=[];
  if(src==='all'||src==='sale'){
    S.transactions.filter(t=>t.discAmt>0).forEach(t=>{
      rows.push({type:'Sale',ref:t.id,date:t.date,cust:t.cust,staff:t.cashier,discType:t.discType,discRaw:t.discRaw,discAmt:t.discAmt,total:t.amount});
    });
  }
  if(src==='all'||src==='quote'){
    S.quotes.filter(q=>q.discAmt>0).forEach(q=>{
      rows.push({type:'Quote',ref:q.id,date:q.date,cust:q.cust,staff:'—',discType:q.discType,discRaw:q.discRaw,discAmt:q.discAmt,total:q.amount});
    });
  }
  const srch=document.getElementById('discSrch')?.value.toLowerCase()||'';
  const filtered=rows.filter(r=>r.cust.toLowerCase().includes(srch)||(r.staff||'').toLowerCase().includes(srch));
  filtered.sort((a,b)=>new Date(b.date)-new Date(a.date));
  return filtered;
}

function renderDiscounts(){
  const full=getDiscRows();
  const pageSize=parseInt(document.getElementById('discPageSize')?.value)||25;
  const totalPages=Math.max(1,Math.ceil(full.length/pageSize));
  if(discPage>totalPages) discPage=totalPages;
  if(discPage<1) discPage=1;
  const startIdx=(discPage-1)*pageSize;
  const filtered=full.slice(startIdx,startIdx+pageSize);
  const tbl=document.getElementById('discTbl');
  if(!full.length){
    tbl.innerHTML='<tr><td colspan="8" style="padding:20px;text-align:center;color:var(--gl)">No discounts recorded</td></tr>';
    document.getElementById('discShowingLbl').textContent='Showing 0 of 0 entries';
    document.getElementById('discPageLbl').textContent='Page 1 of 1';
    return;
  }
  tbl.innerHTML=filtered.map(r=>{
    const label=r.discType==='pct'?`${r.discRaw}%`:'Fixed (R)';
    return `<tr>
      <td><span class="pill ${r.type==='Sale'?'p-ok':'p-sent'}">${r.type}</span></td>
      <td><strong>${r.ref}</strong></td>
      <td style="font-size:12px">${r.date}</td>
      <td>${r.cust}</td>
      <td style="font-size:12px">${r.staff}</td>
      <td>${label}</td>
      <td style="color:var(--ok)"><strong>− R ${r.discAmt.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td>
      <td>R ${r.total.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    </tr>`;
  }).join('')+`<tr style="background:var(--sand);font-weight:700;border-top:2px solid var(--sand-d)">
    <td colspan="6" style="padding:9px 13px;color:var(--clay-d)">TOTAL DISCOUNTED (filtered)</td>
    <td style="padding:9px 13px;color:var(--ok)">R ${full.reduce((s,r)=>s+r.discAmt,0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td></td>
  </tr>`;
  const showEnd=Math.min(startIdx+pageSize,full.length);
  document.getElementById('discShowingLbl').textContent=`Showing ${startIdx+1} to ${showEnd} of ${full.length} entries`;
  document.getElementById('discPageLbl').textContent=`Page ${discPage} of ${totalPages}`;
}

function exportDiscCsv(){
  if(curUser?.role!=='admin'){toast('Admin only',true);return;}
  const full=getDiscRows();
  if(!full.length){toast('No discounts to export',true);return;}
  const headers=['Type','Reference #','Date','Customer','Cashier/Staff','Discount Type','Discount Amount','Order Total'];
  const rows=full.map(r=>[r.type,r.ref,r.date,r.cust,r.staff,r.discType==='pct'?`${r.discRaw}%`:'Fixed (R)',r.discAmt.toFixed(2),r.total.toFixed(2)]);
  downloadCsv(headers,rows,'discounts');
}

function downloadCsv(headers,rows,filenamePrefix){
  const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  offerFile(`${filenamePrefix}-export-${new Date().toISOString().split('T')[0]}.csv`,'\uFEFF'+csv,'text/csv').then(ok=>{if(ok) toast(`Exported ${rows.length} record(s) to CSV`);});
}

function toggleSaleMenu(ev,id){
  ev.stopPropagation();
  const menu=document.getElementById('menu-'+id);
  const wasOpen=menu.classList.contains('open');
  closeAllSaleMenus();
  if(!wasOpen) menu.classList.add('open');
}

function closeAllSaleMenus(){
  document.querySelectorAll('.act-menu').forEach(m=>m.classList.remove('open'));
}

document.addEventListener('click',closeAllSaleMenus);

function viewSaleTx(id){
  closeAllSaleMenus();
  const t=S.transactions.find(x=>x.id===id);if(!t) return;
  lastTxId=id;
  const lines=(t.cart||[]).map(i=>{
    const price=i.bulk&&i.bp?i.bp:i.up;
    return `<div class="rr"><span>${i.name.substring(0,22)} ×${i.qty}</span><span>R ${fmtR((price*i.qty))}</span></div>`;
  }).join('')||'<div style="font-size:12px;color:var(--g)">Line item detail not available for this sale.</div>';
  document.getElementById('rcptBody').innerHTML=`
<div style="text-align:center;margin-bottom:10px">
  ${docHead()}
  <span style="font-size:11px;color:var(--g)">${invLabel()} — ${t.id}<br>${t.date}<br>Cashier: ${DOC_BY} · ${t.method.toUpperCase()}${t.eftRef?' · Ref: '+t.eftRef:''}</span>
  <br><span style="font-size:11px;font-weight:600">${t.cust}${t.phone?' · '+t.phone:''}</span>
</div>
<div class="rdv"></div>${lines}<div class="rdv"></div>
<div class="rr rtot"><span>TOTAL</span><span>R ${fmtR(t.amount)}</span></div>
${t.note?`<div class="rdv"></div><div style="font-size:11px;color:var(--g)">Note: ${t.note}</div>`:''}
${bankBlock()}<div class="rdv"></div><div style="text-align:center;font-size:11px;color:var(--g)">${S.settings.footer}</div><div style="text-align:center;font-size:9px;color:#999;margin-top:4px;letter-spacing:.5px">MFD POS · by KreativG Studio</div>`;
  openMo('rcptMo');
}

function printSaleTx(id){closeAllSaleMenus();printInvoiceA4(id);}

function deleteSaleTx(id){
  closeAllSaleMenus();
  reqAdmin('Admin PIN required to delete a sale record',()=>{
    confirm('Delete Sale Record',`Delete ${id} permanently? This only removes the record — it does NOT restore stock or reverse account balances. Use Refund for that.`,()=>{
      S.transactions=S.transactions.filter(t=>t.id!==id);
      saveState();renderSales();toast(`${id} deleted`);
    });
  });
}

// ═══════════════════════════════════════
// QUOTES
// ═══════════════════════════════════════
function qValidUntil(date,days){const d=new Date(date);d.setDate(d.getDate()+parseInt(days));return d.toISOString().split('T')[0];}

function checkExpiredQ(){
  const today=new Date().toISOString().split('T')[0];
  S.quotes.forEach(q=>{if(q.status==='sent'&&qValidUntil(q.date,q.validDays)<today) q.status='expired';});
}

function renderQuotes(){
  checkExpiredQ();
  const pillMap={draft:'p-draft',sent:'p-sent',accepted:'p-accepted',declined:'p-declined',expired:'p-expired'};
  document.getElementById('qTbl').innerHTML=S.quotes.map(q=>`<tr>
    <td><strong>${q.id}</strong></td>
    <td>${q.cust}</td>
    <td>${q.date}</td>
    <td>${qValidUntil(q.date,q.validDays)}</td>
    <td><strong>R ${q.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td>
    <td><span class="pill ${pillMap[q.status]||'p-draft'}">${q.status.charAt(0).toUpperCase()+q.status.slice(1)}</span>${quoteNeedsFollow(q)?'<span class="qf-pill">Follow up</span>':''}${q.followUps&&q.followUps.length?`<div class="ci-sub">Followed up ${dTime(q.followUps[0].ts)}</div>`:''}</td>
    <td>
      <span class="al" onclick="prevQ('${q.id}')">View</span>
      <span class="al" onclick="printQ('${q.id}')" title="Print"><i class=i-printer></i></span>
      <span class="al" onclick="downloadDocPdf('quote','${q.id}')" title="Download PDF"><i class=i-download></i> PDF</span>
      ${!q.converted?`<span class="al" onclick="convQ('${q.id}')">→ Sale</span>`:'<span style="font-size:11px;color:var(--g)">Converted</span>'}
      ${q.status==='sent'&&!q.converted?`<span class="al" onclick="followUpQuote('${q.id}')" style="color:var(--clay)"><i class=i-wa></i> Follow up</span>`:''}
      ${q.status==='sent'?`<span class="al" onclick="markQ('${q.id}','accepted')" style="color:var(--ok)">Accept</span>`:''}
      ${q.status==='draft'?`<span class="al" onclick="editQ('${q.id}')">Edit</span>`:''}
    </td>
  </tr>`).join('');
}

function openQuote(fromCart=false){
  if(!fromCart) qLines=[{name:'',qty:1,unit:'each',up:0}];
  document.getElementById('qMoTitle').textContent='New Quotation';
  ['qCust','qContact','qAddr','qNotes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('qVal').value=S.settings.qValidity;
  document.getElementById('qDelChk').checked=false;
  document.getElementById('qDelZone').style.display='none';
  document.getElementById('qDiscType').value='none';
  document.getElementById('qDiscAmt').value='0';
  qDiscApprovedBy=null;
  document.getElementById('qDelCustFee').value='';
  document.getElementById('qReq').value='';
  document.getElementById('qDelTrips').value=1;
  document.getElementById('qCustDl').innerHTML=S.customers.map(c=>`<option value="${c.name}">`).join('');
  renderZoneOptions();
  activeQId=null;renderQLines();calcQ();openMo('qMo');
}

function editQ(id){
  const q=S.quotes.find(x=>x.id===id);if(!q) return;
  activeQId=id;
  document.getElementById('qMoTitle').textContent=`Edit Quote ${id}`;
  document.getElementById('qCust').value=q.cust;
  document.getElementById('qContact').value=q.contact;
  document.getElementById('qAddr').value=q.addr;
  document.getElementById('qNotes').value=q.notes;
  document.getElementById('qReq').value=q.reqDate||'';
  document.getElementById('qVal').value=q.validDays;
  document.getElementById('qDiscType').value=q.discType||'none';
  document.getElementById('qDiscAmt').value=q.discRaw||0;
  qDiscApprovedBy=q.discType&&q.discType!=='none'?(q.discApprovedBy||'Admin'):null;
  renderZoneOptions();
  document.getElementById('qDelCustFee').value='';
  document.getElementById('qDelChk').checked=q.delivery>0;
  document.getElementById('qDelTrips').value=q.trips||1;
  if(q.delivery>0) setZoneForFee('qDelZone','qDelCustFee',q.delivery,q.delZoneName,q.trips);
  qLines=q.lines.map(l=>({...l}));
  renderQLines();calcQ();openMo('qMo');
}

function renderQLines(){
  document.getElementById('qLinesTbl').innerHTML=qLines.map((l,i)=>`<tr>
    <td style="text-align:center;color:var(--g);font-size:12px">${i+1}</td>
    <td><input class="qli" type="text" value="${l.name}" list="qProdDl" placeholder="Product" oninput="updQL(${i},'name',this.value)"><datalist id="qProdDl">${S.products.map(p=>`<option value="${p.name}">`).join('')}</datalist></td>
    <td><input class="qli" type="number" value="${l.qty}" min="1" style="width:65px;text-align:center" oninput="updQL(${i},'qty',this.value)"></td>
    <td><select class="qli" style="width:85px" onchange="updQL(${i},'unit',this.value)">${['each','load','ton','bag','m²','per 1000'].map(u=>`<option ${l.unit===u?'selected':''}>${u}</option>`).join('')}</select></td>
    <td><input class="qli" type="number" value="${l.up}" min="0" step="0.01" style="width:85px;text-align:right" oninput="updQL(${i},'up',this.value)"></td>
    <td style="text-align:right;font-weight:700;color:var(--clay-d)">R ${fmtR((l.qty*l.up))}</td>
    <td><button onclick="rmQL(${i})" style="background:none;border:none;color:var(--err);cursor:pointer;font-size:14px">✕</button></td>
  </tr>`).join('');
}

function updQL(i,f,v){
  if(f==='name'){const p=S.products.find(x=>x.name===v);if(p){qLines[i].up=(quoteCustBuilder()&&p.trade>0?p.trade:p.up);qLines[i].unit=p.unit;}}
  qLines[i][f]=f==='qty'||f==='up'?parseFloat(v)||0:v;
  renderQLines();calcQ();
}
function addQL(){qLines.push({name:'',qty:1,unit:'each',up:0});renderQLines();calcQ();}
function rmQL(i){qLines.splice(i,1);renderQLines();calcQ();}

function calcQ(){
  const on=document.getElementById('qDelChk').checked;
  const dz=document.getElementById('qDelZone');
  dz.style.display=on?'inline-block':'none';
  const sub=qLines.reduce((s,l)=>s+l.qty*l.up,0);
  const itemCount=qLines.reduce((s,l)=>s+(parseFloat(l.qty)||0),0);
  document.getElementById('qItemCount').textContent=itemCount.toLocaleString();
  document.getElementById('qLineTotal').textContent=`R ${fmtR(sub)}`;

  const discType=document.getElementById('qDiscType').value;
  const rawD=parseFloat(document.getElementById('qDiscAmt').value)||0;
  const maxFixed=sub*S.settings.maxDisc/100;
  let discAmt=0;
  if(discType==='pct'){const capped=Math.min(S.settings.maxDisc,rawD);discAmt=sub*capped/100;}
  else if(discType==='fixed'){discAmt=Math.min(rawD,maxFixed);}
  const discRow=document.getElementById('qDiscRow');
  discRow.style.display=discType!=='none'&&discAmt>0?'flex':'none';
  document.getElementById('qDiscVal').textContent=`− R ${fmtR(discAmt)}`;

  const afterD=sub-discAmt;
  syncCustFee('qDelZone','qDelCustFee',on);
  const del=on?getDelFee('qDelZone','qDelCustFee'):0;
  const vat=afterD*(S.settings.vatRate/100);const total=afterD+vat+del;
  document.getElementById('qSub').textContent=`R ${fmtR(sub)}`;
  document.getElementById('qDel').textContent=`R ${fmtR(del)}`;
  document.getElementById('qVat').textContent=`R ${fmtR(vat)}`;
  document.getElementById('qVatRow').style.display=S.settings.vatRate>0?'flex':'none';
  document.getElementById('qVatLbl').textContent=`VAT (${S.settings.vatRate}%)`;
  document.getElementById('qTotal').textContent=`R ${fmtR(total)}`;
}

function saveQ(status){
  const cust=document.getElementById('qCust').value.trim();
  if(!cust){toast('Customer name required',true);return;}
  const lines=qLines.filter(l=>l.name&&l.qty>0&&l.up>0);
  if(!lines.length){toast('Add at least one line item',true);return;}
  const sub=lines.reduce((s,l)=>s+l.qty*l.up,0);
  const discType=document.getElementById('qDiscType').value;
  const discRaw=parseFloat(document.getElementById('qDiscAmt').value)||0;
  const maxFixed=sub*S.settings.maxDisc/100;
  let discAmt=0;
  if(discType==='pct'){discAmt=sub*Math.min(S.settings.maxDisc,discRaw)/100;}
  else if(discType==='fixed'){discAmt=Math.min(discRaw,maxFixed);}
  const del=document.getElementById('qDelChk').checked?getDelFee('qDelZone','qDelCustFee'):0;
  const amount=(sub-discAmt)*(1+S.settings.vatRate/100)+del;

  if(activeQId){
    const idx=S.quotes.findIndex(x=>x.id===activeQId);
    if(idx>=0){S.quotes[idx]={...S.quotes[idx],cust,contact:document.getElementById('qContact').value,addr:document.getElementById('qAddr').value,date:new Date().toISOString().split('T')[0],validDays:parseInt(document.getElementById('qVal').value),lines,delivery:del,delZoneName:del>0?zoneLabel(zoneById(document.getElementById('qDelZone').value)):'',trips:del>0?tripsFor('qDelZone'):0,discType,discRaw,discAmt,discApprovedBy:discAmt>0?qDiscApprovedBy:null,reqDate:document.getElementById('qReq').value,notes:document.getElementById('qNotes').value,status,amount};}
  } else {
    const id=newDocId('QUO','nextQId',S.quotes);
    S.quotes.unshift({id,cust,contact:document.getElementById('qContact').value,addr:document.getElementById('qAddr').value,date:new Date().toISOString().split('T')[0],validDays:parseInt(document.getElementById('qVal').value),lines,delivery:del,delZoneName:del>0?zoneLabel(zoneById(document.getElementById('qDelZone').value)):'',trips:del>0?tripsFor('qDelZone'):0,discType,discRaw,discAmt,discApprovedBy:discAmt>0?qDiscApprovedBy:null,reqDate:document.getElementById('qReq').value,notes:document.getElementById('qNotes').value,status,amount,converted:false,by:curUser?.name||''});
  }
  closeMo('qMo');renderQuotes();saveState();
  if(status==='sent'){activeQId=activeQId||S.quotes[0].id;const q=S.quotes.find(x=>x.id===activeQId);if(q&&!q.sentAt){q.sentAt=new Date().toISOString();saveState();}sendQuoteWhatsApp();return;}
  toast('Quote saved as draft');
}

function saveAndPrint(){
  const cust=document.getElementById('qCust').value.trim();
  if(!cust){toast('Customer name required',true);return;}
  const lines=qLines.filter(l=>l.name&&l.qty>0&&l.up>0);
  if(!lines.length){toast('Add at least one line item',true);return;}
  saveQ('draft');
  setTimeout(()=>{const q=S.quotes[0];if(q){activeQId=q.id;printQuoteA4(q.id);}},100);
}

function markQ(id,status){const q=S.quotes.find(x=>x.id===id);if(q){q.status=status;if(status==='sent') q.sentAt=new Date().toISOString();renderQuotes();saveState();toast(`Quote ${status}`);}}

function prevQ(id){
  const q=S.quotes.find(x=>x.id===id);if(!q) return;
  activeQId=id;
  const sub=q.lines.reduce((s,l)=>s+l.qty*l.up,0);
  const discAmt=q.discAmt||0;
  const afterD=sub-discAmt;
  const vat=afterD*(S.settings.vatRate/100);const total=afterD+vat+(q.delivery||0);
  const lines=q.lines.map(l=>`<div class="rr"><span>${l.name} × ${l.qty.toLocaleString()} ${l.unit}</span><span>R ${fmtR((l.qty*l.up))}</span></div>`).join('');
  const discLabel=q.discType==='pct'?`${q.discRaw}%`:q.discType==='fixed'?'fixed':'';
  document.getElementById('qPrevBody').innerHTML=`
<div style="text-align:center;margin-bottom:10px">
  ${docHead()}
  <strong style="font-size:13px">QUOTATION</strong><br>
  <span style="font-size:11px;color:var(--g)">${q.id} · Issued: ${q.date} · Valid: ${qValidUntil(q.date,q.validDays)}${q.reqDate?' · Required: '+q.reqDate:''}</span>
</div>
<div class="rdv"></div>
<div style="font-size:11px;margin-bottom:9px;color:var(--g)"><strong style="color:var(--black);font-size:13px">${q.cust}</strong><br>${q.contact?q.contact+'<br>':''}${q.addr||''}</div>
<div class="rdv"></div>${lines}<div class="rdv"></div>
<div class="rr" style="font-size:12px;color:var(--gd)"><span>Subtotal</span><span>R ${fmtR(sub)}</span></div>
${discAmt>0?`<div class="rr" style="font-size:12px;color:var(--ok)"><span>Discount (${discLabel})</span><span>− R ${fmtR(discAmt)}</span></div>`:''}
${q.delivery?`<div class="rr" style="font-size:12px;color:var(--gd)"><span>Transport${q.delZoneName?' ('+q.delZoneName+(q.trips>1?', '+q.trips+' trips':'')+')':''}</span><span>R ${fmtR(q.delivery)}</span></div>`:''}
${S.settings.vatRate>0?`<div class="rr" style="font-size:12px;color:var(--gd)"><span>VAT (${S.settings.vatRate}%)</span><span>R ${fmtR(vat)}</span></div>`:''}
<div class="rdv"></div><div class="rr rtot"><span>TOTAL</span><span>R ${fmtR(total)}</span></div>
<div class="rdv"></div>
<div style="font-size:11px;color:var(--g)">${q.notes||''}<br>This quotation is valid for ${q.validDays} days from issue date. Prepared by: ${DOC_BY}. Not a tax invoice.</div>${bankBlock()}`;
  openMo('qPrevMo');
}

function printQ(id){activeQId=id;printQuoteA4(id);}

function convQ(id){
  if(!id) id=activeQId;
  const q=S.quotes.find(x=>x.id===id);if(!q) return;
  if(q.converted){toast('This quote was already converted to a sale',true);return;}
  closeMo('qPrevMo');
  cart=q.lines.map(l=>{
    const p=S.products.find(x=>x.name===l.name);
    const safeQty=p&&!p.noStock?Math.min(l.qty,p.stk):l.qty;
    if(p&&!p.noStock&&l.qty>p.stk) toast(`${l.name}: only ${p.stk} in stock — qty adjusted`,true);
    return{id:p?p.id:Date.now(),name:l.name,qty:safeQty,up:l.up,bp:l.up,bm:0,bulk:false,unit:l.unit};
  });
  if(q.delivery>0){document.getElementById('delChk').checked=true;renderZoneOptions();document.getElementById('delTrips').value=q.trips||1;setZoneForFee('delZone','delCustFee',q.delivery,q.delZoneName,q.trips);togDel();if(q.addr) document.getElementById('delAddr').value=q.addr;document.getElementById('delReq').value=q.reqDate||'';}
  if(q.discAmt>0&&q.discType&&q.discType!=='none'){
    discApprovedBy=q.discApprovedBy||null;
    document.getElementById('discChk').checked=true;
    document.getElementById('discType').value=q.discType;
    document.getElementById('discAmt').value=q.discRaw;
    document.getElementById('moreToggle').classList.add('open');
    document.getElementById('morePanel').classList.add('open');
    togDisc();
  }
  showSc('pos');renderCart();toast(`Quote ${q.id} loaded into sale`);
}

function qToSale(){convQ(activeQId);}

// ═══════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════
function renderInv(){
  const srch=document.getElementById('invSrch')?.value.toLowerCase()||'';
  const cf=document.getElementById('invCatF')?.value||'all';
  const list0=S.products.filter(p=>(cf==='all'||p.cat===cf)&&(p.name+' '+(p.code||'')).toLowerCase().includes(srch));
  // listed under one heading each: a product with sizes (Pillar, Water) with its sizes under it,
  // and all the sands and all the bricks together
  const CATL={sand:"Sand",brick:"Bricks",block:"Bricks",cement:"Cement",concrete:"Pillars",water:"Water",stone:"Building materials"};
  const grpOf=p=>p.group||(['sand','brick','block'].includes(p.cat)?CATL[p.cat]:'');
  const list=[];const done=new Set();
  list0.forEach(p=>{const g=grpOf(p);if(!g){list.push(p);return;}if(done.has(g)) return;done.add(g);list.push(...list0.filter(x=>grpOf(x)===g));});
  const total=list.reduce((s,p)=>s+(p.stk*p.up),0);
  let lastGrp='';
  document.getElementById('invTbl').innerHTML=list.map(p=>{
    let head='';const g=grpOf(p);
    if(g&&g!==lastGrp){const n=list.filter(x=>grpOf(x)===g).length;head=`<tr class="inv-grp"><td colspan="11"><strong>${esc(g)}</strong> <span style="font-weight:400;color:var(--g)">— ${n} ${p.group?`size${n===1?'':'s'}`:`type${n===1?'':'s'}`}</span></td></tr>`;}
    lastGrp=g;
    const isOut=!p.noStock&&p.stk===0,isLow=!isOut&&!p.noStock&&p.stk<=p.ls;
    const st=p.noStock?'<span class="pill p-ok">Always available</span>':isOut?'<span class="pill p-out">Out</span>':isLow?'<span class="pill p-low">Low</span>':'<span class="pill p-ok">OK</span>';
    const margin=p.cost?((p.up-p.cost)/p.up*100):null;
    const marginTxt=margin!==null?`${margin.toFixed(0)}%`:'—';
    const marginColor=margin===null?'var(--g)':margin<15?'var(--err)':margin<30?'var(--warn)':'var(--ok)';
    return head+`<tr class="${g?'inv-sub':''}">
      <td><strong>${esc(p.group&&p.size?p.size:p.name)}</strong>${p.code?`<div class="pc-code">${esc(p.code)}</div>`:''}</td>
      <td>${CATL[p.cat]||p.cat}</td>
      <td>${p.unit}</td>
      <td>R ${fmtR(p.up)}</td>
      <td>${p.cost?`R ${fmtR(p.cost)}`:'—'}</td>
      <td><strong style="color:${marginColor}">${marginTxt}</strong></td>
      <td style="font-size:12px;color:var(--g)">${p.supplier||'—'}</td>
      <td>${fmtQty(p.stk)}</td>
      <td><strong style="color:var(--clay-d)">R ${(p.stk*p.up).toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td>
      <td>${st}</td>
      <td>
        <span class="al" onclick="openEditProd(${p.id})">Edit</span>
        <span class="al" onclick="openAdjust(${p.id})">Adjust</span>${p.stk<=p.ls?`<span class="al" style="color:var(--clay)" onclick="reorderProduct(${p.id})">Order</span>`:''}
        <span class="al red" onclick="confirmDelProd(${p.id})">Delete</span>
      </td>
    </tr>`;
  }).join('')+`<tr style="background:var(--sand);font-weight:700;border-top:2px solid var(--sand-d)">
    <td colspan="8" style="padding:9px 13px;color:var(--clay-d)">TOTAL STOCK VALUE (shown)</td>
    <td style="padding:9px 13px;font-size:14px;color:var(--clay-d)">R ${total.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td colspan="2"></td>
  </tr>`;
}

// ═══════════════════════════════════════
// PURCHASES
// ═══════════════════════════════════════
function renderPurchases(){
  const tbl=document.getElementById('purchTbl');
  if(!S.purchases.length){tbl.innerHTML='<tr><td colspan="11" style="padding:20px;text-align:center;color:var(--gl)">No purchases recorded yet</td></tr>';return;}
  tbl.innerHTML=S.purchases.map(po=>{
    const paidFull=po.due<=0;
    return `<tr>
      <td><strong>${po.id}</strong></td>
      <td style="font-size:12px">${po.date}</td>
      <td>${po.supplier}</td>
      <td>${po.product}</td>
      <td>${po.qty.toLocaleString()} ${po.unit}</td>
      <td>R ${fmtR(po.costPerUnit)}</td>
      <td><strong>R ${po.total.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td>
      <td style="color:var(--ok)">R ${po.paid.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
      <td style="color:${po.due>0?'var(--err)':'var(--g)'}">R ${po.due.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
      <td>${paidFull?'<span class="pill p-ok">Paid</span>':'<span class="pill p-low" style="background:var(--warn-b);color:var(--warn)">Due</span>'}</td>
      <td>${po.due>0?`<span class="al" onclick="settlePurchase('${po.id}')">Mark Paid</span>`:''}<span class="al" onclick="printPO('${po.id}')">Print</span><span class="al red" onclick="deletePurchase('${po.id}')">Delete</span></td>
    </tr>`;
  }).join('')+`<tr style="background:var(--sand);font-weight:700;border-top:2px solid var(--sand-d)">
    <td colspan="6" style="padding:9px 13px;color:var(--clay-d)">TOTALS</td>
    <td style="padding:9px 13px;color:var(--clay-d)">R ${S.purchases.reduce((s,p)=>s+p.total,0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td style="padding:9px 13px;color:var(--ok)">R ${S.purchases.reduce((s,p)=>s+p.paid,0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td style="padding:9px 13px;color:var(--err)">R ${S.purchases.reduce((s,p)=>s+p.due,0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
    <td colspan="2"></td>
  </tr>`;
}

function openPurchase(){
  document.getElementById('poProductDl').innerHTML=S.products.map(p=>`<option value="${p.name}">`).join('');
  document.getElementById('poSupplierDl').innerHTML=S.suppliers.map(s=>`<option value="${s.name}">`).join('');
  ['poProduct','poSupplier','poQty','poCost','poNotes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('poDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('poPaid').value=0;
  calcPo();
  openMo('purchMo');
}

function onPoProductPick(){
  const name=document.getElementById('poProduct').value;
  const p=S.products.find(x=>x.name===name);
  if(p){
    document.getElementById('poCost').value=p.cost||'';
    document.getElementById('poSupplier').value=p.supplier||'';
    calcPo();
  }
}

function calcPo(){
  const qty=parseFloat(document.getElementById('poQty').value)||0;
  const cost=parseFloat(document.getElementById('poCost').value)||0;
  const paid=parseFloat(document.getElementById('poPaid').value)||0;
  const total=qty*cost;
  const due=Math.max(0,total-paid);
  document.getElementById('poTotal').value=`R ${fmtR(total)}`;
  document.getElementById('poDue').value=`R ${fmtR(due)}`;
}

function savePurchase(){
  const name=document.getElementById('poProduct').value.trim();
  const p=S.products.find(x=>x.name===name);
  if(!p){toast('Select a valid product from the list',true);return;}
  const supplier=document.getElementById('poSupplier').value.trim();
  if(!supplier){toast('Supplier name required',true);return;}
  const qty=parseFloat(document.getElementById('poQty').value)||0;
  const cost=parseFloat(document.getElementById('poCost').value)||0;
  if(qty<=0||cost<=0){toast('Enter a valid quantity and cost',true);return;}
  const paid=parseFloat(document.getElementById('poPaid').value)||0;
  const total=qty*cost;
  const due=Math.max(0,total-paid);
  const id=newDocId('PO','nextPurchId',S.purchases);
  S.purchases.unshift({id,supplier,product:p.name,productId:p.id,qty,unit:p.unit,costPerUnit:cost,total,paid,due,date:document.getElementById('poDate').value,notes:document.getElementById('poNotes').value});
  // Receive stock and update cost price + supplier on the product
  p.stk+=qty;p.cost=cost;p.supplier=supplier;
  // Keep supplier directory in sync
  if(!S.suppliers.find(s=>s.name===supplier)){S.suppliers.push({id:newNumId('nextSupplierId',S.suppliers),name:supplier,phone:'',email:'',addr:'',notes:''});}
  closeMo('purchMo');renderPurchases();renderInv();renderProds();saveState();updateNavBadge();
  toast(`Purchase recorded — ${qty.toLocaleString()} ${p.unit} added to stock`);
}

function settlePurchase(id){
  const po=S.purchases.find(x=>x.id===id);if(!po) return;
  confirm('Mark as Paid',`Mark ${id} as fully paid? This clears the R ${fmtR(po.due)} due to ${po.supplier}.`,()=>{
    po.paid=po.total;po.due=0;renderPurchases();saveState();toast('Purchase marked as paid');
  },false);
}

function printPO(id){
  activePOId=id;
  const po=S.purchases.find(x=>x.id===id);if(!po) return;
  const sup=S.suppliers.find(s=>s.name===po.supplier);
  document.getElementById('poNoteBody').innerHTML=`
<div style="text-align:center;margin-bottom:12px">
  <strong style="font-size:16px">${S.settings.compName}</strong><br>
  ${S.settings.addr?`<span style="font-size:12px;color:var(--g)">${S.settings.addr}</span><br>`:''}
  ${S.settings.phone?`<span style="font-size:12px;color:var(--g)">${S.settings.phone}</span><br>`:''}
  ${S.settings.vat?`<span style="font-size:12px;color:var(--g)">VAT No: ${S.settings.vat}</span><br>`:''}
  <strong style="font-size:14px;display:inline-block;margin-top:8px">PURCHASE ORDER</strong><br>
  <span style="font-size:12px;color:var(--g)">${po.id} · ${po.date}</span>
</div>
<div class="rdv"></div>
<div style="font-size:13px;line-height:1.8">
  <div><strong>Supplier:</strong> ${po.supplier}</div>
  ${sup?.phone?`<div><strong>Phone:</strong> ${sup.phone}</div>`:''}
  ${sup?.email?`<div><strong>Email:</strong> ${sup.email}</div>`:''}
  ${sup?.addr?`<div><strong>Address:</strong> ${sup.addr}</div>`:''}
</div>
<div class="rdv"></div>
<table style="width:100%;font-size:13px;border-collapse:collapse">
  <thead><tr>
    <th style="text-align:left;padding:5px 0;border-bottom:1px solid var(--g)">Product</th>
    <th style="text-align:right;padding:5px 0;border-bottom:1px solid var(--g)">Qty</th>
    <th style="text-align:right;padding:5px 0;border-bottom:1px solid var(--g)">Cost/Unit</th>
    <th style="text-align:right;padding:5px 0;border-bottom:1px solid var(--g)">Total</th>
  </tr></thead>
  <tbody><tr>
    <td style="padding:7px 0">${po.product}</td>
    <td style="text-align:right;padding:7px 0">${po.qty.toLocaleString()} ${po.unit}</td>
    <td style="text-align:right;padding:7px 0">R ${fmtR(po.costPerUnit)}</td>
    <td style="text-align:right;padding:7px 0"><strong>R ${fmtR(po.total)}</strong></td>
  </tr></tbody>
</table>
<div class="rdv"></div>
<div class="rr" style="font-size:13px"><span>Amount Paid</span><span style="color:var(--ok)">R ${fmtR(po.paid)}</span></div>
<div class="rr" style="font-size:13px"><span>Balance Due</span><span style="color:${po.due>0?'var(--err)':'var(--g)'}">R ${fmtR(po.due)}</span></div>
<div class="rdv"></div><div class="rr rtot"><span>TOTAL</span><span>R ${fmtR(po.total)}</span></div>
${po.notes?`<div class="rdv"></div><div style="font-size:12px;color:var(--g)">Note: ${po.notes}</div>`:''}
<div class="rdv"></div>
<div style="margin-top:20px;display:flex;justify-content:space-between;gap:20px;font-size:12px">
  <div style="flex:1"><div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Authorised By</div></div>
  <div style="flex:1"><div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Received By</div></div>
</div>`;
  openMo('poNoteMo');
}

function deletePurchase(id){
  reqAdmin('Admin PIN required to delete a purchase record',()=>{
    confirm('Delete Purchase',`Delete ${id}? This does not remove the stock it added.`,()=>{
      S.purchases=S.purchases.filter(x=>x.id!==id);renderPurchases();saveState();toast('Purchase deleted');
    });
  });
}

// ═══════════════════════════════════════
// HOME DASHBOARD (admin)
// ═══════════════════════════════════════
let homeFilterRange='today';
let homeCustomFrom='',homeCustomTo='';

function toggleHomeFilterMenu(ev){
  ev.stopPropagation();
  const menu=document.getElementById('homeFilterMenu');
  const wasOpen=menu.classList.contains('open');
  closeAllSaleMenus();
  if(!wasOpen) menu.classList.add('open');
}

function getHomeRangeBounds(){
  const now=new Date();
  const startOfDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  const endOfDay=d=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
  let from,to,label;
  switch(homeFilterRange){
    case 'today': from=startOfDay(now);to=endOfDay(now);label='Today';break;
    case 'yesterday':{const y=new Date(now);y.setDate(y.getDate()-1);from=startOfDay(y);to=endOfDay(y);label='Yesterday';break;}
    case '7d':{const s=new Date(now);s.setDate(s.getDate()-6);from=startOfDay(s);to=endOfDay(now);label='Last 7 Days';break;}
    case '30d':{const s=new Date(now);s.setDate(s.getDate()-29);from=startOfDay(s);to=endOfDay(now);label='Last 30 Days';break;}
    case 'thismonth': from=new Date(now.getFullYear(),now.getMonth(),1);to=endOfDay(now);label='This Month';break;
    case 'lastmonth':{const s=new Date(now.getFullYear(),now.getMonth()-1,1);const e=new Date(now.getFullYear(),now.getMonth(),0);from=startOfDay(s);to=endOfDay(e);label='Last Month';break;}
    case 'thisyear': from=new Date(now.getFullYear(),0,1);to=endOfDay(now);label='This Year';break;
    case 'lastyear':{const s=new Date(now.getFullYear()-1,0,1);const e=new Date(now.getFullYear()-1,11,31);from=startOfDay(s);to=endOfDay(e);label='Last Year';break;}
    case 'custom':
      from=homeCustomFrom?startOfDay(new Date(homeCustomFrom)):startOfDay(now);
      to=homeCustomTo?endOfDay(new Date(homeCustomTo)):endOfDay(now);
      label=homeCustomFrom&&homeCustomTo?`${homeCustomFrom} → ${homeCustomTo}`:'Custom Range';
      break;
    default: from=startOfDay(now);to=endOfDay(now);label='Today';
  }
  return {from,to,label};
}

function setHomeFilter(range){
  homeFilterRange=range;
  closeAllSaleMenus();
  renderHome();
}

function openCustomRange(){
  closeAllSaleMenus();
  document.getElementById('rangeFrom').value=homeCustomFrom||new Date().toISOString().split('T')[0];
  document.getElementById('rangeTo').value=homeCustomTo||new Date().toISOString().split('T')[0];
  openMo('rangeMo');
}

function applyCustomRange(){
  const from=document.getElementById('rangeFrom').value;
  const to=document.getElementById('rangeTo').value;
  if(!from||!to){toast('Select both dates',true);return;}
  if(from>to){toast('"From" date must be before "To" date',true);return;}
  homeCustomFrom=from;homeCustomTo=to;homeFilterRange='custom';
  closeMo('rangeMo');renderHome();
}

function renderHome(){
  try{renderHomeDeliveries();}catch(e){}
  try{const n=quotesToFollow().length;const el=document.getElementById('homeWeekly');if(el&&n){el.insertAdjacentHTML('beforeend',`<div class="wk-banner" onclick="showSc('quotes')"><i class=i-message></i> ${n} quote${n>1?'s':''} waiting for a reply. <b>Follow up ›</b></div>`);}}catch(e){}
  try{weeklyBanner();}catch(e){}
  document.getElementById('homeUserName').textContent=curUser?.name.split(' ')[0]||'';
  document.getElementById('homeDateLbl').textContent=new Date().toLocaleDateString('en-ZA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const {from,to,label}=getHomeRangeBounds();
  document.getElementById('homeFilterLbl').textContent=label;

  const txInRange=S.transactions.filter(t=>{const d=txD(t.date);return d>=from&&d<=to;});
  const poInRange=S.purchases.filter(p=>{const d=new Date(p.date+'T12:00:00');return d>=from&&d<=to;});

  const periodSales=txInRange.reduce((s,t)=>s+t.amount,0);
  const periodPurch=poInRange.reduce((s,p)=>s+p.total,0);
  const purchDue=S.purchases.reduce((s,p)=>s+p.due,0);
  const custDue=S.customers.reduce((s,c)=>s+(c.balance||0),0);
  const lowStock=S.products.filter(p=>!p.noStock&&p.stk<=p.ls).length;

  document.getElementById('homeCards').innerHTML=[
    {l:`Sales (${label})`,v:`R ${periodSales.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:`${txInRange.length} invoices`},
    {l:`Purchases (${label})`,v:`R ${periodPurch.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:`${poInRange.length} purchase orders`},
    {l:'Net (period)',v:`R ${(periodSales-periodPurch).toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:'Sales minus purchases'},
    {l:'Purchase Due',v:`R ${purchDue.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:'Owed to suppliers — current'},
    {l:'Customer Balances Due',v:`R ${custDue.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:(()=>{const od=S.customers.filter(c=>c.balance>0).map(custAgeing).filter(a=>a.d30+a.d60+a.d90>0);return od.length?`<i class=i-alert></i> ${od.length} overdue · tap to view`:'Owed by account customers — tap to view';})(),go:'owed'},
    {l:'Low / Out of Stock',v:lowStock,s:`of ${S.products.length} products — current`},
  ].map(c=>`<div class="rc"${c.go?` style="cursor:pointer" onclick="showSc('${c.go}')"`:''}><div class="rc-lbl">${c.l}</div><div class="rc-val">${c.v}</div><div class="rc-sub">${c.s}</div></div>`).join('');

  document.getElementById('homeRecentSales').innerHTML=txInRange.slice(0,6).map(t=>
    `<div class="si"><div><div style="font-size:12px;font-weight:600">${t.id} — ${t.cust}</div><div style="font-size:11px;color:var(--g)">${t.date} · ${t.method}</div></div><div class="si-amt">R ${t.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>`
  ).join('')||`<div style="font-size:12px;color:var(--g);padding:8px 0">No sales in this period</div>`;

  document.getElementById('homeRecentPurchases').innerHTML=poInRange.slice(0,6).map(p=>
    `<div class="si"><div><div style="font-size:12px;font-weight:600">${p.id} — ${p.supplier}</div><div style="font-size:11px;color:var(--g)">${p.date} · ${p.product}</div></div><div class="si-amt">R ${p.total.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>`
  ).join('')||`<div style="font-size:12px;color:var(--g);padding:8px 0">No purchases in this period</div>`;

  const lows=S.products.filter(p=>!p.noStock&&p.stk<=p.ls);
  document.getElementById('homeStockAlerts').innerHTML=lows.length?lows.map(p=>
    `<div class="si"><div style="font-size:12px;font-weight:600">${p.name}</div><div style="display:flex;align-items:center;gap:10px"><div style="font-size:12px;color:${p.stk===0?'var(--err)':'var(--warn)'}">${p.stk===0?'Out of stock':`Only ${p.stk.toLocaleString()} left`}</div><button class="btn-s" style="padding:4px 10px;font-size:12px" onclick="reorderProduct(${p.id})"><i class=i-cart></i> Order ${suggestQty(p)}</button></div></div>`
  ).join(''):'<div style="font-size:12px;color:var(--g);padding:8px 0">All stock levels healthy</div>';

  renderHomeSales30Chart();
  renderHomeSalesChart();

  // Sales Payment Due (account customers with a balance)
  const salesDue=S.customers.filter(c=>c.balance>0).sort((a,b)=>b.balance-a.balance);
  document.getElementById('homeSalesDue').innerHTML=salesDue.length?salesDue.map(c=>
    `<tr><td>${c.name}</td><td style="color:var(--err)"><strong>R ${c.balance.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td><td><span class="al" onclick="showSc('customers');openRecordPay(${c.id})">Record Payment</span></td></tr>`
  ).join(''):'<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--gl)">No outstanding customer balances</td></tr>';

  // Purchase Payment Due (unpaid purchase orders)
  const purchDueList=S.purchases.filter(p=>p.due>0).sort((a,b)=>b.due-a.due);
  document.getElementById('homePurchDue').innerHTML=purchDueList.length?purchDueList.map(p=>
    `<tr><td>${p.supplier}</td><td>${p.id}</td><td style="color:var(--err)"><strong>R ${p.due.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong></td><td><span class="al" onclick="showSc('purchases');settlePurchase('${p.id}')">Mark Paid</span></td></tr>`
  ).join(''):'<tr><td colspan="4" style="padding:14px;text-align:center;color:var(--gl)">No outstanding supplier balances</td></tr>';
}

function renderHomeSales30Chart(){
  const el=document.getElementById('homeSales30Chart');
  if(!el) return;
  const days=30;
  const now=new Date();
  const labels=[];
  const totals=new Array(days).fill(0);
  const dayKeys=[];
  for(let i=days-1;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    dayKeys.push(d.toISOString().split('T')[0]);
    labels.push(d.toLocaleDateString('en-ZA',{day:'numeric',month:'short'}));
  }
  S.transactions.forEach(t=>{
    const d=txD(t.date);
    const key=d.toISOString().split('T')[0];
    const idx=dayKeys.indexOf(key);
    if(idx>=0) totals[idx]+=t.amount;
  });
  const max=Math.max(...totals,1);
  const w=760,h=190,padL=54,padB=44,padT=10,padR=14;
  const plotW=w-padL-padR,plotH=h-padT-padB;
  const n=days-1;
  const pts=totals.map((v,i)=>{
    const x=padL+(i/n)*plotW;
    const y=padT+plotH-(v/max)*plotH;
    return [x,y];
  });
  const linePts=pts.map(p=>p.join(',')).join(' ');
  const areaPts=`${padL},${padT+plotH} ${linePts} ${padL+plotW},${padT+plotH}`;
  const gridLines=[0,0.25,0.5,0.75,1].map(f=>{
    const y=padT+plotH-f*plotH;
    const val=Math.round(max*f);
    return `<line x1="${padL}" y1="${y}" x2="${padL+plotW}" y2="${y}" stroke="var(--sand-d)" stroke-width="1"/><text x="${padL-8}" y="${y+4}" font-size="10" fill="var(--g)" text-anchor="end">${val>=1000?(val/1000).toFixed(1)+'k':val}</text>`;
  }).join('');
  const dayLabels=labels.map((lb,i)=>{
    if(i%3!==0&&i!==n) return '';
    const x=padL+(i/n)*plotW;
    return `<text x="${x}" y="${h-padB+14}" font-size="9" fill="var(--g)" text-anchor="end" transform="rotate(-40 ${x} ${h-padB+14})">${lb}</text>`;
  }).join('');
  const dots=pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="var(--clay)" stroke="var(--white)" stroke-width="1"><title>${labels[i]}: R ${fmtR(totals[i])}</title></circle>`).join('');
  el.innerHTML=`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;max-height:220px" preserveAspectRatio="xMidYMid meet">
    ${gridLines}
    <polygon points="${areaPts}" fill="var(--clay-l)" opacity="0.12"/>
    <polyline points="${linePts}" fill="none" stroke="var(--clay)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${dayLabels}
  </svg>`;
}

function renderHomeSalesChart(){
  const el=document.getElementById('homeSalesChart');
  if(!el) return;
  const year=new Date().getFullYear();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const totals=new Array(12).fill(0);
  S.transactions.forEach(t=>{
    const d=txD(t.date);
    if(d.getFullYear()===year) totals[d.getMonth()]+=t.amount;
  });
  const max=Math.max(...totals,1);
  const w=760,h=190,padL=54,padB=24,padT=10,padR=14;
  const plotW=w-padL-padR,plotH=h-padT-padB;
  const pts=totals.map((v,i)=>{
    const x=padL+(i/(11))*plotW;
    const y=padT+plotH-(v/max)*plotH;
    return [x,y];
  });
  const linePts=pts.map(p=>p.join(',')).join(' ');
  const areaPts=`${padL},${padT+plotH} ${linePts} ${padL+plotW},${padT+plotH}`;
  const gridLines=[0,0.25,0.5,0.75,1].map(f=>{
    const y=padT+plotH-f*plotH;
    const val=Math.round(max*f);
    return `<line x1="${padL}" y1="${y}" x2="${padL+plotW}" y2="${y}" stroke="var(--sand-d)" stroke-width="1"/><text x="${padL-8}" y="${y+4}" font-size="10" fill="var(--g)" text-anchor="end">${val>=1000?(val/1000).toFixed(1)+'k':val}</text>`;
  }).join('');
  const monthLabels=months.map((m,i)=>{
    const x=padL+(i/11)*plotW;
    return `<text x="${x}" y="${h-6}" font-size="10" fill="var(--g)" text-anchor="middle">${m}</text>`;
  }).join('');
  const dots=pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--clay)" stroke="var(--white)" stroke-width="1.5"><title>${months[i]} ${year}: R ${fmtR(totals[i])}</title></circle>`).join('');
  el.innerHTML=`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;max-height:220px" preserveAspectRatio="xMidYMid meet">
    ${gridLines}
    <polygon points="${areaPts}" fill="var(--clay-l)" opacity="0.12"/>
    <polyline points="${linePts}" fill="none" stroke="var(--clay)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${monthLabels}
  </svg>`;
}

function openProd(){editProdId=null;document.getElementById('pTrade').value='';document.getElementById('pStk').disabled=false;document.getElementById('pStkLbl').textContent='Opening Stock';document.getElementById('prodMoTitle').textContent='Add Product';['pName','pCode','pUp','pCost','pStk','pSupplier','pBp','pBm','pGroup','pSize','pPalQty','pPalPrice'].forEach(id=>document.getElementById(id).value='');document.getElementById('pNoStk').checked=false;document.getElementById('pLs').value=S.settings.lowStock;document.getElementById('pCat').value='sand';document.getElementById('pUnit').value='load';document.getElementById('prodDelBtn').style.display='none';openMo('prodMo');}

function openEditProd(id){
  const p=S.products.find(x=>x.id===id);if(!p) return;editProdId=id;
  document.getElementById('prodMoTitle').textContent='Edit Product';
  document.getElementById('pName').value=p.name;el('pCode').value=p.code||'';document.getElementById('pCat').value=p.cat;
  document.getElementById('pUnit').value=p.unit;document.getElementById('pUp').value=p.up;
  document.getElementById('pCost').value=p.cost||'';document.getElementById('pSupplier').value=p.supplier||'';document.getElementById('pTrade').value=p.trade||'';
  document.getElementById('pStk').value=p.stk;document.getElementById('pStk').disabled=false;document.getElementById('pStkLbl').textContent='Stock on hand';document.getElementById('pBp').value=p.bp||'';
  document.getElementById('pBm').value=p.bm||'';document.getElementById('pLs').value=p.ls||5;
  el('pGroup').value=p.group||'';el('pSize').value=p.size||'';el('pPalQty').value=p.pallet?.qty||'';el('pPalPrice').value=p.pallet?.price||'';el('pNoStk').checked=!!p.noStock;
  document.getElementById('prodDelBtn').style.display='inline-block';openMo('prodMo');
}

function saveProd(){
  const name=document.getElementById('pName').value.trim();const up=parseFloat(document.getElementById('pUp').value);
  if(!name||isNaN(up)){toast('Name and price are required',true);return;}
  const data={name,code:el('pCode').value.trim().toUpperCase(),cat:document.getElementById('pCat').value,unit:document.getElementById('pUnit').value.trim()||'each',up,cost:parseFloat(document.getElementById('pCost').value)||null,supplier:document.getElementById('pSupplier').value.trim()||'',trade:parseFloat(document.getElementById('pTrade').value)||null,stk:parseFloat(document.getElementById('pStk').value)||0,bp:parseFloat(document.getElementById('pBp').value)||null,bm:parseInt(document.getElementById('pBm').value)||null,ls:parseInt(document.getElementById('pLs').value)||5,ico:catIco(document.getElementById('pCat').value)};
  {const g=el('pGroup').value.trim(),sz=el('pSize').value.trim(),pq=parseFloat(el('pPalQty').value)||0,pp=parseFloat(el('pPalPrice').value)||0;
    data.group=g||'';data.size=g?sz:'';data.noStock=el('pNoStk').checked;
    data.pallet=pq>0?{qty:pq,price:pp||null}:null;
    // the pallet price is the bulk price from a full pallet up
    if(pq>0&&pp>0){data.bp=Math.round(pp/pq*10000)/10000;data.bm=pq;}
    if(g&&sz&&!/[–-]/.test(name)) data.name=`${g} – ${sz}`;}
  if(editProdId){
    const idx=S.products.findIndex(x=>x.id===editProdId),p=S.products[idx],newStk=data.stk;delete data.stk;
    const apply=()=>{S.products[idx]={...S.products[idx],...data};closeMo('prodMo');renderInv();renderProds();saveState();updateNavBadge();toast('Product updated');};
    const raw=document.getElementById('pStk').value.trim();
    if(raw===''||Math.round(newStk*100)/100===Math.round(p.stk*100)/100){apply();return;}
    if(newStk<0){toast('Stock cannot be below 0',true);return;}
    // a typed stock change is approved and kept in the stock history like an Adjust
    reqAdmin('Admin PIN required to change stock',()=>{const before=p.stk;p.stk=Math.round(newStk*100)/100;logAdj(p,before,p.stk,newStk>before?'Stock received':'Recount down','Changed in Edit product',adminName(),'adjust');apply();});
    return;
  }
  S.products.push({id:newNumId('nextProdId',S.products),...data});
  closeMo('prodMo');renderInv();renderProds();saveState();updateNavBadge();
  toast('Product added');
}

function confirmDelProd(id){
  const p=S.products.find(x=>x.id===id);if(!p) return;
  confirm('Delete Product',`Delete "${p.name}"? This cannot be undone.`,()=>{
    S.products=S.products.filter(x=>x.id!==id);
    renderInv();renderProds();saveState();updateNavBadge();toast('Product deleted');
  });
}

function deleteProd(){if(editProdId) confirmDelProd(editProdId);closeMo('prodMo');}

function doRestock(id){
  const p=S.products.find(x=>x.id===id);if(!p) return;
  askForm(`Add stock — ${p.name}`,[{id:'qty',label:`Quantity to add (${p.unit})`,type:'number'}],v=>{
    const qty=parseFloat(v.qty);if(!(qty>0)){toast('Enter a quantity',true);return false;}
    const before=p.stk;p.stk=Math.round((p.stk+qty)*100)/100;logAdj(p,before,p.stk,'Stock received','',curUser?.name||'','adjust');
    renderInv();renderProds();saveState();updateNavBadge();toast(`Added ${qty.toLocaleString()} ${p.unit} to stock`);
  },'Add stock');
}

// ═══════════════════════════════════════
// STOCK TAKE & ADJUSTMENTS
// ═══════════════════════════════════════
const ADJ_REASONS={
  add:['Stock received','Found / recount up','Customer return (no refund)','Other'],
  remove:['Breakage','Weather / washed away','Theft / missing','Spillage','Own use','Recount down','Other']};
const TAKE_REASONS=['Recount / correction','Breakage','Weather / washed away','Theft / missing','Spillage','Found extra','Other'];
function fmtQty(n){return (Math.round(n*100)/100).toLocaleString('en-ZA');}
function logAdj(p,before,after,reason,note,approvedBy,source){
  S.stockAdj=S.stockAdj||[];
  const diff=Math.round((after-before)*100)/100;
  if(!S.nextAdjId) S.nextAdjId=1;
  const id=newDocId('ADJ','nextAdjId',S.stockAdj);
  S.stockAdj.unshift({id,date:nowStamp(),pid:p.id,product:p.name,unit:p.unit,before,after,diff,reason,note:note||'',
    by:curUser?.name||'',approvedBy:approvedBy||'',source:source||'adjust',value:diff*(p.cost||0)});
  logAudit(`Stock ${diff>0?'+':''}${fmtQty(diff)} ${p.unit} ${p.name} (${reason})${note?' — '+note:''}`,approvedBy||'');
  return id;
}

// ── single-product adjust ──
function openAdjust(id){
  const p=S.products.find(x=>x.id===id);if(!p) return;
  window._adjPid=id;
  document.getElementById('adjTitle').textContent=`Adjust Stock — ${p.name}`;
  document.getElementById('adjNow').textContent=`Current stock: ${fmtQty(p.stk)} ${p.unit}`;
  document.getElementById('adjType').value='add';adjTypeChanged();
  document.getElementById('adjQty').value='';document.getElementById('adjNote').value='';
  adjPreview();openMo('adjMo');
}
function adjTypeChanged(){
  const t=document.getElementById('adjType').value;
  document.getElementById('adjReason').innerHTML=ADJ_REASONS[t].map(r=>`<option>${r}</option>`).join('');
  adjPreview();
}
function adjPreview(){
  const p=S.products.find(x=>x.id===window._adjPid);if(!p) return;
  const t=document.getElementById('adjType').value;const q=parseFloat(document.getElementById('adjQty').value)||0;
  const after=t==='add'?p.stk+q:p.stk-q;
  const el=document.getElementById('adjAfter');
  el.innerHTML=q>0?`New stock: <strong>${fmtQty(after)} ${p.unit}</strong>${p.cost?` · value ${t==='add'?'+':'−'} R ${fmtR((q*p.cost))}`:''}`:'';
  el.style.color=after<0?'var(--err)':'var(--gd)';
}
function saveAdjust(){
  const p=S.products.find(x=>x.id===window._adjPid);if(!p) return;
  const t=document.getElementById('adjType').value;const q=parseFloat(document.getElementById('adjQty').value);
  const reason=document.getElementById('adjReason').value;const note=document.getElementById('adjNote').value.trim();
  if(!(q>0)){toast('Enter a quantity',true);return;}
  if(t==='remove'&&q>p.stk){toast(`Only ${fmtQty(p.stk)} ${p.unit} in stock`,true);return;}
  if(reason==='Other'&&!note){toast('Add a note for "Other"',true);return;}
  reqAdmin('Admin PIN required to adjust stock',()=>{
    const before=p.stk;p.stk=Math.round((t==='add'?p.stk+q:p.stk-q)*100)/100;
    logAdj(p,before,p.stk,reason,note,adminName(),'adjust');
    saveState();closeMo('adjMo');renderInv();renderProds();updateNavBadge();
    toast(`${p.name}: ${fmtQty(before)} → ${fmtQty(p.stk)} ${p.unit}`);
  });
}

// ── full stock take (blind) ──
let takeRevealed=false,takeCounts={};
function openStockTake(){takeRevealed=false;takeCounts={};renderStockTake();openMo('takeMo');}
function renderStockTake(){
  const body=document.getElementById('takeBody');
  const rows=S.products.map(p=>{
    const c=takeCounts[p.id];const has=c!==undefined&&c!=='';
    const diff=has?Math.round((parseFloat(c)-p.stk)*100)/100:0;
    const dCol=!has?'var(--gl)':diff===0?'var(--ok)':diff<0?'var(--err)':'var(--warn)';
    return `<tr>
      <td data-label="Product"><strong>${p.name}</strong><div style="font-size:11px;color:var(--g)">${p.unit}</div></td>
      <td data-label="Counted"><input type="number" min="0" step="any" value="${has?c:''}" placeholder="count" ${takeRevealed?'disabled':''}
        oninput="takeCounts[${p.id}]=this.value" style="width:100px;border:1px solid var(--sand-d);border-radius:6px;padding:6px 8px;outline:none;text-align:right"></td>
      ${takeRevealed?`
      <td data-label="System">${fmtQty(p.stk)}</td>
      <td data-label="Difference" style="font-weight:700;color:${dCol}">${!has?'not counted':diff===0?'✓':(diff>0?'+':'')+fmtQty(diff)}</td>
      <td data-label="Reason">${has&&diff!==0?`<select id="tr-${p.id}" style="border:1px solid var(--sand-d);border-radius:6px;padding:5px;max-width:170px">${TAKE_REASONS.map(r=>`<option ${diff>0&&r==='Found extra'?'selected':''}>${r}</option>`).join('')}</select>`:''}</td>`:''}
    </tr>`;}).join('');
  const changed=takeRevealed?S.products.filter(p=>{const c=takeCounts[p.id];return c!==undefined&&c!==''&&Math.abs(parseFloat(c)-p.stk)>0.001;}):[];
  const lossVal=changed.reduce((s,p)=>s+(parseFloat(takeCounts[p.id])-p.stk)*(p.cost||0),0);
  body.innerHTML=`
    <p style="font-size:12px;color:var(--g);margin-bottom:10px">${takeRevealed?'Check the differences and choose a reason for each one. Products left blank are not changed.':'Count what is physically in the yard. System stock is hidden until you finish. Leave a product blank to skip it.'}</p>
    <div class="tbl-w" style="max-height:52vh;overflow:auto"><table style="width:100%;font-size:13px;border-collapse:collapse">
      <thead><tr><th style="text-align:left;padding:6px">Product</th><th style="text-align:left;padding:6px">Counted</th>${takeRevealed?'<th style="padding:6px">System</th><th style="padding:6px">Difference</th><th style="padding:6px">Reason</th>':''}</tr></thead>
      <tbody>${rows}</tbody></table></div>
    ${takeRevealed?`<div style="margin-top:10px;font-size:13px;font-weight:700;color:${lossVal<0?'var(--err)':lossVal>0?'var(--warn)':'var(--ok)'}">${changed.length} product(s) to adjust · value ${lossVal<0?'lost':'gained'}: R ${fmtR(Math.abs(lossVal))}</div>
      <div class="fg" style="margin-top:8px"><label>Note (optional)</label><input type="text" id="takeNote" placeholder="e.g. Month-end count"></div>`:''}`;
  document.getElementById('takeFtr').innerHTML=takeRevealed
    ?`<button class="btn-s" onclick="takeRevealed=false;renderStockTake()">◀ Back to counting</button><button class="btn" onclick="applyStockTake()">Apply (admin PIN)</button>`
    :`<button class="btn-s" onclick="closeMo('takeMo')">Cancel</button><button class="btn" onclick="revealStockTake()">✔ Done counting — compare</button>`;
}
function revealStockTake(){
  document.querySelectorAll('#takeBody input[type=number]').forEach(()=>{});
  const any=Object.values(takeCounts).some(v=>v!==''&&v!==undefined);
  if(!any){toast('Enter at least one count',true);return;}
  if(Object.values(takeCounts).some(v=>v!==''&&(isNaN(parseFloat(v))||parseFloat(v)<0))){toast('Counts must be 0 or more',true);return;}
  takeRevealed=true;renderStockTake();
}
function applyStockTake(){
  const changed=S.products.filter(p=>{const c=takeCounts[p.id];return c!==undefined&&c!==''&&Math.abs(parseFloat(c)-p.stk)>0.001;});
  const note=document.getElementById('takeNote')?.value.trim()||'';
  const reasons={};changed.forEach(p=>reasons[p.id]=document.getElementById('tr-'+p.id)?.value||'Recount / correction');
  if(changed.some(p=>reasons[p.id]==='Other')&&!note){toast('Add a note when a reason is "Other"',true);return;}
  reqAdmin('Admin PIN required to apply the stock take',()=>{
    const ap=adminName();
    changed.forEach(p=>{const before=p.stk;p.stk=Math.round(parseFloat(takeCounts[p.id])*100)/100;logAdj(p,before,p.stk,reasons[p.id],note||'Stock take',ap,'stocktake');});
    const counted=Object.values(takeCounts).filter(v=>v!==''&&v!==undefined).length;
    logAudit(`Stock take: ${counted} counted, ${changed.length} adjusted`,ap);
    saveState();closeMo('takeMo');renderInv();renderProds();updateNavBadge();
    toast(changed.length?`Stock take applied — ${changed.length} product(s) adjusted`:'Stock take done — everything matched');
  });
}

// ── history ──
function openAdjHistory(){renderAdjHistory();openMo('adjHistMo');}
function renderAdjHistory(){
  const days=parseInt(document.getElementById('adjHistRange')?.value||'30');
  const cutoff=new Date(Date.now()-days*864e5);
  const list=(S.stockAdj||[]).filter(a=>days===0||txD(a.date)>=cutoff);
  const loss=list.filter(a=>a.diff<0&&!/recount|correction/i.test(a.reason)).reduce((s,a)=>s+a.value,0);
  const byReason={};list.filter(a=>a.diff<0).forEach(a=>{byReason[a.reason]=(byReason[a.reason]||0)+a.value;});
  document.getElementById('adjHistSum').innerHTML=`<strong style="color:var(--err)">Stock lost (breakage, weather, theft etc.): R ${fmtR(Math.abs(loss))}</strong>${Object.keys(byReason).length?' · '+Object.entries(byReason).map(([r,v])=>`${r} R ${fmtR(Math.abs(v))}`).join(' · '):''}`;
  document.getElementById('adjHistTbl').innerHTML=list.length?list.map(a=>`<tr>
    <td data-label="Date" style="padding:6px;font-size:11px;color:var(--g)">${a.date}<br>${a.id}</td>
    <td data-label="Product" style="padding:6px"><strong>${a.product}</strong></td>
    <td data-label="Stock" style="padding:6px;text-align:right">${fmtQty(a.before)} → ${fmtQty(a.after)}</td>
    <td data-label="Change" style="padding:6px;text-align:right;font-weight:700;color:${a.diff<0?'var(--err)':'var(--ok)'}">${a.diff>0?'+':''}${fmtQty(a.diff)} ${a.unit||''}</td>
    <td data-label="Value" style="padding:6px;text-align:right">${a.value?(a.value<0?'−':'+')+' R '+Math.abs(a.value).toFixed(2):'—'}</td>
    <td data-label="Reason" style="padding:6px">${a.reason}${a.note?`<div style="font-size:11px;color:var(--g)">${a.note}</div>`:''}</td>
    <td data-label="By" style="padding:6px;font-size:11px;color:var(--g)">${a.by}${a.approvedBy?'<br>✔ '+a.approvedBy:''}</td>
  </tr>`).join(''):'<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--gl)">No stock adjustments in this period</td></tr>';
}
function exportAdjCsv(){
  downloadCsv(['id','date','product','unit','before','after','change','value','reason','note','by','approved_by'],
    (S.stockAdj||[]).map(a=>[a.id,a.date,a.product,a.unit,a.before,a.after,a.diff,a.value.toFixed(2),a.reason,a.note,a.by,a.approvedBy]),'stock-adjustments');
}

// ═══════════════════════════════════════
// MULTI-LOAD DELIVERIES
// ═══════════════════════════════════════
function tripsFor(selId){const el=document.getElementById(selId==='qDelZone'?'qDelTrips':'delTrips');return Math.max(1,Math.min(20,parseInt(el?.value)||1));}
function r2(n){return Math.round(n*100)/100;}
function splitQty(q,n){
  if(Number.isInteger(q)){const b=Math.floor(q/n),rem=q-b*n;return Array.from({length:n},(_,i)=>b+(i<rem?1:0));}
  const b=r2(q/n);const arr=Array(n).fill(b);arr[n-1]=r2(q-b*(n-1));return arr;
}
function unitLbl(u){return u==='per 1000'?'thousand':u;}
function itemsText(items){return items.filter(i=>i.qty>0).map(i=>`${i.name} × ${Number(i.qty).toLocaleString()} ${unitLbl(i.unit)}`).join(', ');}
function makeLoads(base,items,n){
  // returns n delivery records sharing base.id as group
  const now=new Date().toISOString();
  const per=items.map(it=>splitQty(it.qty,n));
  return Array.from({length:n},(_,k)=>{
    const li=items.map((it,x)=>({name:it.name,unit:it.unit,qty:per[x][k]})).filter(i=>i.qty>0);
    return {...base,id:n>1?`${base.id}/${k+1}`:base.id,group:base.id,loadNo:k+1,loadCount:n,items:li,load:itemsText(li)||base.load,
      status:'pending',times:{pending:now},slip:false};
  });
}
function groupOf(d){return S.deliveries.filter(x=>(x.group||x.id)===(d.group||d.id));}
function loadBadge(d){
  if(!(d.loadCount>1)) return '';
  const g=groupOf(d);const done=g.filter(x=>x.status==='delivered').length;
  return `<div class="kc-det" style="font-weight:700;color:var(--clay)"><i class=i-truck></i> Load ${d.loadNo} of ${d.loadCount} <span style="font-weight:500;color:var(--g)">· ${done} of ${g.length} delivered</span></div>`;
}
// ── split modal ──
let splitId=null;
function openSplit(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  if(d.status!=='pending'){toast('Only pending loads can be split',true);return;}
  splitId=id;
  document.getElementById('splitTitle').textContent=`Split ${d.id} — ${d.cust}`;
  document.getElementById('splitN').value=2;
  renderSplitGrid();openMo('splitMo');
}
function renderSplitGrid(){
  const d=S.deliveries.find(x=>x.id===splitId);if(!d) return;
  const n=Math.max(2,Math.min(10,parseInt(document.getElementById('splitN').value)||2));
  const box=document.getElementById('splitGrid');
  if(!d.items||!d.items.length){
    box.innerHTML=`<p style="font-size:12.5px;color:var(--g)">This delivery has no item list (${d.load}). It will be copied into ${n} loads, each marked "load x of ${n}". Edit the description on each card if needed.</p>`;return;
  }
  const cols=Array.from({length:n},(_,k)=>k);
  box.innerHTML=`<div class="tbl-w" style="overflow:auto"><table style="width:100%;font-size:12.5px;border-collapse:collapse">
    <thead><tr><th style="text-align:left;padding:6px">Product</th><th style="padding:6px">Total</th>${cols.map(k=>`<th style="padding:6px">Load ${k+1}</th>`).join('')}<th style="padding:6px">Left</th></tr></thead>
    <tbody>${d.items.map((it,x)=>{const per=splitQty(it.qty,n);return `<tr>
      <td style="padding:6px"><strong>${it.name}</strong><div style="font-size:11px;color:var(--g)">${it.unit}</div></td>
      <td style="padding:6px;text-align:center">${Number(it.qty).toLocaleString()}</td>
      ${cols.map(k=>`<td style="padding:4px"><input type="number" min="0" step="any" id="sp-${x}-${k}" value="${per[k]}" oninput="splitCheck()" style="width:74px;border:1px solid var(--sand-d);border-radius:5px;padding:5px;text-align:right"></td>`).join('')}
      <td style="padding:6px;text-align:center;font-weight:700" id="spl-${x}">0</td></tr>`;}).join('')}</tbody></table></div>
    <div id="splitMsg" style="font-size:12px;margin-top:6px"></div>`;
  splitCheck();
}
function splitCheck(){
  const d=S.deliveries.find(x=>x.id===splitId);if(!d||!d.items) return true;
  const n=Math.max(2,Math.min(10,parseInt(document.getElementById('splitN').value)||2));let ok=true;
  d.items.forEach((it,x)=>{let s=0;for(let k=0;k<n;k++) s+=parseFloat(document.getElementById(`sp-${x}-${k}`)?.value)||0;
    const left=r2(it.qty-s);const c=document.getElementById('spl-'+x);if(c){c.textContent=left;c.style.color=Math.abs(left)<0.001?'var(--ok)':'var(--err)';}
    if(Math.abs(left)>=0.001) ok=false;});
  const m=document.getElementById('splitMsg');if(m){m.textContent=ok?'✓ Every product is fully allocated':'Each product must be fully allocated across the loads';m.style.color=ok?'var(--ok)':'var(--err)';}
  return ok;
}
function applySplit(){
  const d=S.deliveries.find(x=>x.id===splitId);if(!d) return;
  const n=Math.max(2,Math.min(10,parseInt(document.getElementById('splitN').value)||2));
  if(d.items&&d.items.length&&!splitCheck()){toast('Allocate every product fully before splitting',true);return;}
  const now=new Date().toISOString();
  const pieces=Array.from({length:n},(_,k)=>{
    let li=null,txt=d.load;
    if(d.items&&d.items.length){li=d.items.map((it,x)=>({name:it.name,unit:it.unit,qty:parseFloat(document.getElementById(`sp-${x}-${k}`).value)||0})).filter(i=>i.qty>0);txt=itemsText(li);}
    else txt=`${d.load} — load ${k+1} of ${n}`;
    return {...d,items:li,load:txt,status:'pending',times:{pending:(d.times&&d.times.pending)||now},slip:false};
  }).filter(p=>!p.items||p.items.length);
  if(pieces.length<2){toast('At least two loads need products',true);return;}
  // replace d with pieces, then renumber whole group
  const gid=d.group||d.id;
  const idx=S.deliveries.indexOf(d);S.deliveries.splice(idx,1,...pieces);
  const grp=S.deliveries.filter(x=>(x.group||x.id)===gid||x===d);
  const members=S.deliveries.filter(x=>(x.group||x.id)===gid||pieces.includes(x));
  const ordered=[...members].sort((a,b)=>(a.loadNo||1)-(b.loadNo||1)||pieces.indexOf(a)-pieces.indexOf(b));
  ordered.forEach((x,i)=>{x.group=gid;x.loadNo=i+1;x.loadCount=ordered.length;x.id=`${gid}/${i+1}`;});
  logAudit(`${gid} split into ${ordered.length} loads`,curUser?.name||'');
  saveState();closeMo('splitMo');renderKanban();renderHomeDeliveries&&renderHomeDeliveries();
  toast(`${gid} is now ${ordered.length} loads`);
}

// ═══════════════════════════════════════
// MONEY OWED — ACCOUNT AGEING & WHATSAPP REMINDERS
// ═══════════════════════════════════════
const AGE_BUCKETS=[{k:'cur',l:'Current',max:30},{k:'d30',l:'31–60 days',max:60},{k:'d60',l:'61–90 days',max:90},{k:'d90',l:'90+ days',max:1e9}];
function daysSince(dateStr){const d=txD(dateStr);return Math.max(0,Math.floor((Date.now()-d.getTime())/864e5));}
function custAgeing(c){
  // Outstanding balance is made up of the most recent account invoices (payments settle the oldest first)
  let left=Math.round((c.balance||0)*100)/100;
  const r={c,total:left,cur:0,d30:0,d60:0,d90:0,oldestDays:0,invoices:[]};
  if(left<=0) return r;
  const txs=S.transactions.filter(t=>t.method==='account'&&t.cust===c.name&&(t.remainingOwed??t.amount)>0).sort((a,b)=>txD(b.date)-txD(a.date));
  for(const t of txs){
    if(left<=0) break;
    const owed=Math.min(left,t.remainingOwed??t.amount);left=Math.round((left-owed)*100)/100;
    r.invoices.push({id:t.id,date:t.date,owed,days:daysSince(t.date)});
  }
  if(left>0) r.invoices.push({id:'Opening balance',date:c.since||'',owed:left,days:c.since?daysSince(c.since):0});
  r.invoices.forEach(inv=>{const b=AGE_BUCKETS.find(b=>inv.days<=b.max);r[b.k]+=inv.owed;r.oldestDays=Math.max(r.oldestDays,inv.days);});
  return r;
}
function ageLevel(a){return a.d90>0||a.d60>0?'final':a.d30>0?'firm':'friendly';}
function lastReminder(c){const l=(c.reminders||[])[0];return l?l:null;}
function renderOwed(){
  const only=document.getElementById('owedFilter')?.value||'all';
  let rows=S.customers.filter(c=>(c.balance||0)>0).map(custAgeing);
  if(only==='overdue') rows=rows.filter(a=>a.d30+a.d60+a.d90>0);
  rows.sort((a,b)=>b.oldestDays-a.oldestDays||b.total-a.total);
  const T=k=>rows.reduce((s,a)=>s+a[k],0);
  const f=v=>v>0?'R '+v.toLocaleString('en-ZA',{minimumFractionDigits:2}):'—';
  document.getElementById('owedCards').innerHTML=[
    {l:'Total owed',v:f(T('total'))||'R 0.00',c:'var(--clay-d)'},{l:'Current (0–30 days)',v:f(T('cur')),c:'var(--ok)'},
    {l:'31–60 days',v:f(T('d30')),c:'var(--warn)'},{l:'61–90 days',v:f(T('d60')),c:'var(--err)'},{l:'90+ days',v:f(T('d90')),c:'var(--err)'}]
    .map(x=>`<div class="rc"><div class="rc-lbl">${x.l}</div><div class="rc-val" style="color:${x.c};font-size:18px">${x.v}</div></div>`).join('');
  document.getElementById('owedTbl').innerHTML=rows.length?rows.map(a=>{
    const c=a.c,lr=lastReminder(c),lvl=ageLevel(a);
    const tag=lvl==='final'?'<span class="pill" style="background:#f8d7d3;color:var(--err)">Overdue 60+</span>':lvl==='firm'?'<span class="pill p-warn">Overdue</span>':'<span class="pill p-ok">Current</span>';
    return `<tr>
      <td data-label="Customer"><strong>${c.name}</strong><div style="font-size:11px;color:var(--g)">${c.phone||'no phone'} · ${tag}</div></td>
      <td data-label="Owed" style="font-weight:700">${f(a.total)}</td>
      <td data-label="Current">${f(a.cur)}</td>
      <td data-label="31–60" style="color:var(--warn)">${f(a.d30)}</td>
      <td data-label="61–90" style="color:var(--err)">${f(a.d60)}</td>
      <td data-label="90+" style="color:var(--err);font-weight:700">${f(a.d90)}</td>
      <td data-label="Oldest">${a.oldestDays} days</td>
      <td data-label="Last reminder" style="font-size:11px;color:var(--g)">${lr?dTime(lr.ts)+'<br>'+lr.level:'Never'}</td>
      <td data-label="Actions" style="white-space:nowrap">
        <button class="btn-s" style="padding:5px 9px;font-size:12px" onclick="openRemind(${c.id})" ${c.phone?'':'disabled title="No phone number"'}><i class=i-wa></i> Remind</button>
        <span class="al" onclick="openStmt(${c.id})">Statement</span>
        <span class="al" onclick="openRecordPay(${c.id})">Pay</span>
      </td></tr>`;}).join(''):'<tr><td colspan="9" style="padding:24px;text-align:center;color:var(--gl)">Nobody owes money right now </td></tr>';
}
function reminderText(c,a,level){
  const s=S.settings,amt='R '+a.total.toLocaleString('en-ZA',{minimumFractionDigits:2});
  const invs=a.invoices.filter(i=>i.id!=='Opening balance').map(i=>i.id).join(', ');
  const bank=s.bank?`\n\nEFT: ${s.bank}\nReference: ${c.name}`:'';
  const pay=`You can pay at the yard (cash or card) or by EFT.${bank}`;
  if(level==='final') return `Good day ${c.name},\n\nThis is a final reminder from ${s.compName}. Your account has an overdue balance of *${amt}*, part of it older than 60 days${invs?` (invoices ${invs})`:''}.\n\nPlease settle the balance within 7 days, or call us on ${s.phone} to arrange payment, so that we can keep supplying you on account.\n\n${pay}\n\nThank you,\n${s.compName}`;
  if(level==='firm') return `Good day ${c.name},\n\nThis is a reminder from ${s.compName} that your account balance of *${amt}* is now overdue${invs?` (invoices ${invs})`:''}.\n\nWe would appreciate payment this week. If you have already paid, please send us the proof of payment.\n\n${pay}\n\nThank you,\n${s.compName}`;
  return `Good day ${c.name},\n\nThank you for buying from ${s.compName}. A friendly reminder that your account balance is *${amt}*${invs?` (invoices ${invs})`:''}.\n\n${pay}\n\nThank you for your support!\n${s.compName}`;
}
let remindCustId=null;
function openRemind(id){
  const c=S.customers.find(x=>x.id===id);if(!c) return;
  if(!c.phone){toast('Add a phone number for this customer first',true);return;}
  remindCustId=id;const a=custAgeing(c);
  document.getElementById('remTitle').textContent=`Payment reminder — ${c.name}`;
  document.getElementById('remLevel').value=ageLevel(a);
  document.getElementById('remInfo').innerHTML=`Owes <strong>R ${a.total.toLocaleString('en-ZA',{minimumFractionDigits:2})}</strong> · oldest ${a.oldestDays} days · ${c.phone}`;
  remPreview();openMo('remindMo');
}
function remPreview(){const c=S.customers.find(x=>x.id===remindCustId);if(!c) return;document.getElementById('remText').value=reminderText(c,custAgeing(c),document.getElementById('remLevel').value);}
function sendRemind(){
  const c=S.customers.find(x=>x.id===remindCustId);if(!c) return;
  const a=custAgeing(c);const level=document.getElementById('remLevel').value;
  const lbl={friendly:'Friendly',firm:'Overdue',final:'Final'}[level];
  window.open(waLink(c.phone,document.getElementById('remText').value),'_blank');
  c.reminders=c.reminders||[];c.reminders.unshift({ts:new Date().toISOString(),level:lbl,amount:a.total,by:curUser?.name||''});
  logAudit(`WhatsApp ${lbl.toLowerCase()} reminder to ${c.name} for R ${fmtR(a.total)}`,curUser?.name||'');
  saveState();closeMo('remindMo');renderOwed();toast('Reminder opened in WhatsApp');
}

// ═══════════════════════════════════════
// PRINT ENGINE — 80mm slips and A4 documents
// ═══════════════════════════════════════
const KG_LOGO='data:image/png;base64,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',KG_LOGO_D='data:image/png;base64,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';
const APP_VERSION='1.0';
function setPage(fmt){
  let st=document.getElementById('pgSize');
  if(!st){st=document.createElement('style');st.id='pgSize';document.head.appendChild(st);}
  window._pgFmt=fmt==='80mm'?'80mm':'a4';
  // margin 0 stops the browser printing its own header and footer (page title, date, web address)
  // on invoices; the white border is put back as padding that repeats on every page
  st.textContent=fmt==='80mm'?'@media print{@page{size:80mm auto;margin:0}}':'@media print{@page{size:A4 portrait;margin:0}html,body{margin:0!important}#printArea,.app,.ov.on{padding:11mm 12mm!important;box-sizing:border-box;-webkit-box-decoration-break:clone;box-decoration-break:clone}}';
}
// a saved PDF is named after the business, not the app
{const t0=document.title;window.addEventListener('beforeprint',()=>{document.title=(S&&S.settings&&S.settings.compName)||'M.F.D Bricks and Sand Supply';});window.addEventListener('afterprint',()=>{document.title=t0;});}
function printHTML(html,fmt){
  const pa=document.getElementById('printArea');pa.innerHTML=html;
  setPage(fmt||'a4');document.body.classList.add('pa-print');
  const job=(window._printJob=(window._printJob||0)+1);
  const done=()=>{if(window._printJob===job) document.body.classList.remove('pa-print');window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  if(window.mfdDesktop&&window.mfdDesktop.print){setTimeout(()=>{window.mfdDesktop.print(window._pgFmt).finally(done);},120);return;}
  setTimeout(()=>{window.print();setTimeout(done,1500);},120);
}
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const RZ=v=>'R '+(Number(v)||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
function a4Head(title,meta){
  const c=S.settings;
  return `<div class="pd-head"><div class="pd-co"><div class="pd-logo">${mfdLogo('print')}</div>
  <div class="pd-small">${esc(c.addr||'')}</div><div class="pd-small">${c.phone?'Call '+esc(c.phone):''}${c.whatsapp?' · WhatsApp '+esc(c.whatsapp):''}</div>
  ${c.email?`<div class="pd-small">${esc(c.email)}</div>`:''}${c.vat?`<div class="pd-small">VAT No: ${esc(c.vat)}</div>`:''}</div>
  <div class="pd-meta"><div class="pd-title">${title}</div>${meta.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>`;
}
function a4Party(label,lines){return `<div class="pd-party"><div class="pd-lbl">${label}</div>${lines.filter(Boolean).map((l,i)=>i?`<div>${esc(l)}</div>`:`<div class="pd-pname">${esc(l)}</div>`).join('')}</div>`;}
function a4Items(rows){
  return `<table class="pd-tbl"><thead><tr><th>Description</th><th class="r">Qty</th><th>Unit</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody>${
    rows.map(r=>`<tr><td>${esc(r.name)}</td><td class="r">${Number(r.qty).toLocaleString('en-ZA')}</td><td>${esc(r.unit||'')}</td><td class="r">${RZ(r.up)}</td><td class="r">${RZ(r.qty*r.up)}</td></tr>`).join('')}</tbody></table>`;
}
function a4Totals(rows){return `<table class="pd-tot">${rows.filter(Boolean).map(([k,v,b])=>`<tr class="${b?'b':''}"><td>${k}</td><td class="r">${v}</td></tr>`).join('')}</table>`;}
function a4Bank(){const b=S.settings.bank;return b?`<div class="pd-box"><div class="pd-lbl">EFT payments</div>${esc(b)}</div>`:'';}
function a4Foot(note){return `${note?`<div class="pd-note">${note}</div>`:''}<div class="pd-foot">${esc(S.settings.footer||'')}<div class="pd-kg"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio · kreativgstudio.co.za</div></div>`;}
function txSub(t){return (t.cart||[]).reduce((s,i)=>s+gP(i)*i.qty,0);}
function printInvoiceA4(id){const h=invoiceDocHtml(id);if(!h){toast('Sale not found',true);return;}printHTML(h,'a4');}
function invoiceDocHtml(id){
  const t=S.transactions.find(x=>x.id===id);if(!t) return '';
  const c=S.customers.find(x=>x.name===t.cust);
  const sub=txSub(t);
  const items=(t.cart||[]).map(i=>({name:i.name,qty:i.qty,unit:i.unit,up:gP(i)}));
  const methodLbl={cash:'Cash',card:'Card',eft:'EFT',account:'Account',split:'Split (cash + card)'}[t.method]||t.method;
  const pay=[];
  if(t.method==='account'){pay.push(['Deposit paid',RZ(t.depositAmt||0)]);pay.push(['Balance on account',RZ(t.remainingOwed??t.amount),1]);}
  else if(t.method==='split'){pay.push(['Paid cash',RZ(t.splitCash)]);pay.push(['Paid card',RZ(t.splitCard)]);}
  else pay.push([`Paid (${methodLbl})`,RZ(t.amount)]);
  const html=`<div class="pd">${a4Head(invLabel(),[['Invoice no','#'+t.id],['Date',t.date],['Served by',DOC_BY]])}
  <div class="pd-parties">${a4Party('Bill to',[t.cust||'Walk-in',c?.addr||'',t.phone||c?.phone||''])}${a4Party('Payment',[methodLbl,t.eftRef?'EFT ref: '+t.eftRef:'',t.note||''])}</div>
  ${a4Items(items)}
  <div class="pd-sum">${a4Totals([['Subtotal',RZ(sub)],t.discAmt>0?['Discount','− '+RZ(t.discAmt)]:null,t.del>0?[`Transport${t.delZoneName?' ('+esc(t.delZoneName)+(t.trips>1?', '+t.trips+' trips':'')+')':''}`,RZ(t.del)]:null,S.settings.vatRate>0?[`VAT (${S.settings.vatRate}%)`,RZ(t.vat)]:null,['TOTAL',RZ(t.amount),1],...pay,t.returnedAmt?['Returned / refunded','− '+RZ(t.returnedAmt)]:null])}</div>
  ${a4Bank()}${a4Foot('Thank you for your business. Goods remain the property of '+esc(S.settings.compName)+' until paid in full.')}</div>`;
  return html;
}
function printQuoteA4(id){const h=quoteDocHtml(id);if(h) printHTML(h,'a4');}
function quoteDocHtml(id){
  const q=S.quotes.find(x=>x.id===id);if(!q) return '';
  const sub=q.lines.reduce((s,l)=>s+l.qty*l.up,0),disc=q.discAmt||0,vat=(sub-disc)*(S.settings.vatRate/100),total=sub-disc+vat+(q.delivery||0);
  const html=`<div class="pd">${a4Head('QUOTATION',[['Quote no','#'+q.id],['Date',q.date],['Valid until',qValidUntil(q.date,q.validDays)],q.reqDate?['Date required',q.reqDate]:null].filter(Boolean))}
  <div class="pd-parties">${a4Party('Prepared for',[q.cust,q.contact||'',q.addr||''])}${a4Party('Prepared by',[S.settings.compName||DOC_BY,S.settings.phone?'Call '+S.settings.phone:''])}</div>
  ${a4Items(q.lines)}
  <div class="pd-sum">${a4Totals([['Subtotal',RZ(sub)],disc>0?['Discount','− '+RZ(disc)]:null,q.delivery?[`Transport${q.delZoneName?' ('+esc(q.delZoneName)+(q.trips>1?', '+q.trips+' trips':'')+')':''}`,RZ(q.delivery)]:null,S.settings.vatRate>0?[`VAT (${S.settings.vatRate}%)`,RZ(vat)]:null,['TOTAL',RZ(total),1]])}</div>
  ${q.notes?`<div class="pd-box"><div class="pd-lbl">Notes</div>${esc(q.notes)}</div>`:''}
  ${a4Bank()}${a4Foot(`This quotation is valid for ${q.validDays} days from the date of issue. Prices include transport where shown. To accept, sign below or reply to confirm.`)}
  <div class="pd-sign"><div>Accepted by (name and signature)</div><div>Date</div></div></div>`;
  return html;
}
function delCopy(d,label){
  const items=d.items&&d.items.length?d.items:null;
  return `<div class="pd-half">${a4Head('DELIVERY NOTE',[['Delivery no','#'+d.id],['Date',d.date||''],d.inv?['Invoice',d.inv]:null,d.reqDate?['Required',d.reqDate]:null,d.driver?['Driver',d.driver]:null,d.truck?['Truck',d.truck]:null].filter(Boolean))}
  <div class="pd-copy">${label}${d.loadCount>1?` · LOAD ${d.loadNo} OF ${d.loadCount}`:''}</div>
  <div class="pd-parties">${a4Party('Deliver to',[d.cust,d.phone||'',d.addr||''])}${a4Party('Notes',[d.notes||'Please receive in good order and condition the goods below.'])}</div>
  ${items?`<table class="pd-tbl"><thead><tr><th>Goods</th><th class="r">Qty</th><th>Unit</th></tr></thead><tbody>${items.map(i=>`<tr><td>${esc(i.name)}</td><td class="r">${Number(i.qty).toLocaleString('en-ZA')}</td><td>${esc(unitLbl?unitLbl(i.unit):i.unit)}</td></tr>`).join('')}</tbody></table>`:`<div class="pd-box">${esc(d.load)}</div>`}
  <div class="pd-sign3"><div>Received in good order by (name)</div><div>Signature</div><div>Date and time</div></div>
  <div class="pd-kg small"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio</div></div>`;
}
// printed: customer copy + MFD copy for the driver to have signed; PDF for the customer: one copy
function printDeliveryA4(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  printHTML(`<div class="pd pd-del">${delCopy(d,'CUSTOMER COPY')}<div class="pd-cut">✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>${delCopy(d,'MFD COPY — SIGN AND RETURN')}</div>`,'a4');
}
function deliveryDocHtml(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return '';
  return `<div class="pd pd-del">${delCopy(d,'CUSTOMER COPY')}</div>`;
}

// ═══════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════
function weekBounds(kind){
  const now=new Date();const d=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const dow=(d.getDay()+6)%7; // Monday=0
  let start,end;
  if(kind==='last'){start=new Date(d);start.setDate(d.getDate()-dow-7);end=new Date(start);end.setDate(start.getDate()+7);}
  else if(kind==='7'){end=new Date(d);end.setDate(d.getDate()+1);start=new Date(end);start.setDate(end.getDate()-7);}
  else{start=new Date(d);start.setDate(d.getDate()-dow);end=new Date(start);end.setDate(start.getDate()+7);}
  return {start,end};
}
const fmtD=d=>d.toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'});
function computeWeekly(kind){
  const {start,end}=weekBounds(kind);const inR=x=>{const t=txD(x);return t>=start&&t<end;};
  const txs=S.transactions.filter(t=>inR(t.date));
  const r={start,end,count:txs.length,total:0,cash:0,card:0,eft:0,accountNew:0,deposits:0,transport:0,discounts:0,items:{},acctPaid:0,refunds:0,refundCount:0};
  txs.forEach(t=>{
    r.total+=t.amount;r.transport+=t.del||0;r.discounts+=t.discAmt||0;
    if(t.method==='cash') r.cash+=t.amount;else if(t.method==='card') r.card+=t.amount;else if(t.method==='eft') r.eft+=t.amount;
    else if(t.method==='split'){r.cash+=t.splitCash||0;r.card+=t.splitCard||0;}
    else if(t.method==='account'){const dp=t.depositAmt||0;r.deposits+=dp;r.accountNew+=(t.remainingOwed??(t.amount-dp));if(t.depositMethod==='card') r.card+=dp;else if(t.depositMethod==='eft') r.eft+=dp;else r.cash+=dp;}
    (t.cart||[]).forEach(i=>{const k=i.name;r.items[k]=r.items[k]||{qty:0,rev:0,unit:i.unit};r.items[k].qty+=i.qty;r.items[k].rev+=gP(i)*i.qty;});
  });
  S.customers.forEach(c=>(c.payments||[]).forEach(p=>{if(p.ts&&new Date(p.ts)>=start&&new Date(p.ts)<end) r.acctPaid+=p.amount;}));
  (S.sellReturns||[]).forEach(x=>{if(inR(x.date)){r.refunds+=x.amount||0;r.refundCount++;}});
  r.top=Object.entries(r.items).sort((a,b)=>b[1].rev-a[1].rev).slice(0,5);
  const dl=S.deliveries;
  r.delDone=dl.filter(d=>d.status==='delivered'&&d.times?.delivered&&new Date(d.times.delivered)>=start&&new Date(d.times.delivered)<end).length;
  r.delOpen=dl.filter(d=>d.status!=='delivered').length;
  r.delOverdue=dl.filter(d=>delDueState(d)==='overdue').length;
  r.noSlip=dl.filter(d=>d.status==='delivered'&&!d.slip).length;
  r.low=S.products.filter(p=>!p.noStock&&p.stk<=p.ls);
  const ag=S.customers.filter(c=>(c.balance||0)>0).map(custAgeing);
  r.owed=ag.reduce((s,a)=>s+a.total,0);r.overdue=ag.reduce((s,a)=>s+a.d30+a.d60+a.d90,0);r.owedTop=ag.sort((a,b)=>b.total-a.total).slice(0,3);
  const cu=(S.cashupHistory||[]).filter(h=>inR(h.date));
  r.cashups=cu.length;r.cashVar=cu.reduce((s,h)=>s+(h.variance||0),0);r.cardVar=cu.reduce((s,h)=>s+(h.cardVariance||0),0);r.payOuts=cu.reduce((s,h)=>s+(h.payOut||0),0);
  r.stockLoss=(S.stockAdj||[]).filter(a=>inR(a.date)&&a.diff<0&&!/recount|correction/i.test(a.reason)).reduce((s,a)=>s+a.value,0);
  r.quotes=S.quotes.filter(q=>{const d=new Date(q.date);return d>=start&&d<end;});
  return r;
}
function weeklyHTML(r){
  const row=(k,v,cls)=>`<tr class="${cls||''}"><td>${k}</td><td class="r">${v}</td></tr>`;
  const vr=x=>Math.abs(x)<0.01?'Balanced':(x<0?'Short '+RZ(-x):'Over '+RZ(x));
  return `<div class="wk">
  <div class="wk-grid">
    <div class="wk-card"><span>Sales</span><b>${RZ(r.total)}</b><small>${r.count} invoice(s)</small></div>
    <div class="wk-card"><span>Money in</span><b>${RZ(r.cash+r.card+r.eft+r.acctPaid)}</b><small>incl. account payments</small></div>
    <div class="wk-card"><span>Owed to MFD</span><b>${RZ(r.owed)}</b><small>${RZ(r.overdue)} overdue</small></div>
    <div class="wk-card"><span>Deliveries done</span><b>${r.delDone}</b><small>${r.delOpen} open · ${r.delOverdue} overdue</small></div>
  </div>
  <h4>Payments received</h4><table class="wk-t">${row('Cash',RZ(r.cash))}${row('Card',RZ(r.card))}${row('EFT',RZ(r.eft))}${row('Account payments received',RZ(r.acctPaid))}${row('New sales on account (still owed)',RZ(r.accountNew))}</table>
  <h4>Top products</h4><table class="wk-t">${r.top.length?r.top.map(([n,v])=>row(`${esc(n)} — ${Number(v.qty).toLocaleString('en-ZA')} ${esc(unitLbl?unitLbl(v.unit):v.unit)}`,RZ(v.rev))).join(''):row('No sales this week','—')}</table>
  <h4>Other figures</h4><table class="wk-t">${row('Transport charged',RZ(r.transport))}${row('Discounts given',RZ(r.discounts))}${row(`Refunds (${r.refundCount})`,RZ(r.refunds))}${row('Quotes issued',r.quotes.length+' · '+RZ(r.quotes.reduce((s,q)=>s+q.amount,0)))}${row('Stock lost (breakage, weather, theft)',RZ(Math.abs(r.stockLoss)))}${row(`Cash-ups (${r.cashups})`,`Cash: ${vr(r.cashVar)} · Card: ${vr(r.cardVar)}`)}${row('Cash pay-outs',RZ(r.payOuts))}</table>
  <h4>Needs attention</h4><table class="wk-t">${row('Low or out-of-stock products',r.low.length?r.low.map(p=>`${esc(p.name)} (${fmtQty?fmtQty(p.stk):p.stk})`).join(', '):'None')}${row('Overdue deliveries',r.delOverdue)}${row('Signed slips not back',r.noSlip)}${row('Biggest balances owed',r.owedTop.length?r.owedTop.map(a=>`${esc(a.c.name)} ${RZ(a.total)}`).join(', '):'None')}</table>
  </div>`;
}
function weeklyText(r){
  const vr=x=>Math.abs(x)<0.01?'Balanced':(x<0?'Short '+RZ(-x):'Over '+RZ(x));
  return `${S.settings.compName} — Weekly Report\n${fmtD(r.start)} to ${fmtD(new Date(r.end-864e5))}\n\nSALES: ${RZ(r.total)} (${r.count} invoices)\nCash ${RZ(r.cash)} · Card ${RZ(r.card)} · EFT ${RZ(r.eft)}\nAccount payments received: ${RZ(r.acctPaid)}\nNew sales on account: ${RZ(r.accountNew)}\n\nTOP PRODUCTS:\n${r.top.map(([n,v],i)=>`${i+1}. ${n} — ${Number(v.qty).toLocaleString('en-ZA')} ${unitLbl?unitLbl(v.unit):v.unit} — ${RZ(v.rev)}`).join('\n')||'No sales'}\n\nDELIVERIES: ${r.delDone} delivered · ${r.delOpen} open · ${r.delOverdue} overdue · ${r.noSlip} slips not back\nOWED TO MFD: ${RZ(r.owed)} (${RZ(r.overdue)} overdue)\nCASH-UPS: ${r.cashups} · Cash ${vr(r.cashVar)} · Card ${vr(r.cardVar)} · Pay-outs ${RZ(r.payOuts)}\nDISCOUNTS: ${RZ(r.discounts)} · REFUNDS: ${RZ(r.refunds)}\nSTOCK LOST: ${RZ(Math.abs(r.stockLoss))}\nLOW STOCK: ${r.low.map(p=>p.name).join(', ')||'None'}\n\n— MFD POS by KreativG Studio`;
}
let _wk=null;
function openWeekly(){document.getElementById('wkRange').value=[0,1].includes(new Date().getDay())?'last':'this';renderWeekly();openMo('weekMo');}
function renderWeekly(){
  _wk=computeWeekly(document.getElementById('wkRange').value);
  document.getElementById('wkDates').textContent=`${fmtD(_wk.start)} – ${fmtD(new Date(_wk.end-864e5))}`;
  document.getElementById('wkBody').innerHTML=weeklyHTML(_wk);
}
function weekKey(){const {start}=weekBounds('this');return start.toISOString().slice(0,10);}
function markWeeklySent(how){S.lastWeekly={key:weekKey(),ts:new Date().toISOString(),how};saveState();logAudit(`Weekly report sent (${how})`,curUser?.name||'');}
function printWeekly(){if(!_wk) return;printHTML(`<div class="pd">${a4Head('WEEKLY REPORT',[['Period',`${fmtD(_wk.start)} – ${fmtD(new Date(_wk.end-864e5))}`],['Prepared',nowStamp()]])}${weeklyHTML(_wk)}${a4Foot('')}</div>`,'a4');}
function emailWeekly(){
  if(!_wk) return;const to=S.settings.ownerEmail||'';
  if(!to){toast('Add the owner email in Settings first',true);return;}
  const subj=`${S.settings.compName} — Weekly Report ${fmtD(_wk.start)} to ${fmtD(new Date(_wk.end-864e5))}`;
  window.location.href=`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(weeklyText(_wk))}`;
  markWeeklySent('email');
}
function waWeekly(){if(!_wk) return;const n=S.settings.ownerWa||S.settings.whatsapp;if(!n){toast('Add the owner WhatsApp in Settings',true);return;}window.open(waLink(n,weeklyText(_wk)),'_blank');markWeeklySent('WhatsApp');}
function copyWeekly(){if(!_wk) return;navigator.clipboard?.writeText(weeklyText(_wk)).then(()=>toast('Report copied')).catch(()=>toast('Copy not available here',true));}
function weeklyBanner(){
  const el=document.getElementById('homeWeekly');if(!el) return;
  const monday=new Date().getDay()===1;const sent=S.lastWeekly&&S.lastWeekly.key===weekKey();
  el.innerHTML=(new Date().getDay()<=1||new Date().getDay()===0)&&!sent&&curUser?.role==='admin'?`<div class="wk-banner" onclick="openWeekly()"><i class=i-mail></i> ${monday?'It\'s Monday — ':''}last week's report is ready. <b>Open and send ›</b></div>`:'';
}

// ═══════════════════════════════════════
// SIDEBAR NAVIGATION (desktop) + QUICK TILL CONTROLS
// ═══════════════════════════════════════
const IC={
  yard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h4.5"/>',
 home:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
 till:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>',
 sales:'<path d="M4 2h16v20l-4-2-4 2-4-2-4 2zM8 7h8M8 11h8M8 15h5"/>',
 quotes:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 returns:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
 delivery:'<path d="M1 4h13v12H1zM14 8h4l4 4v4h-8"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
 customers:'<circle cx="9" cy="8" r="4"/><path d="M1 21v-1a7 7 0 0 1 14 0v1M17 4a4 4 0 0 1 0 8M23 21v-1a7 7 0 0 0-4-6.3"/>',
 owed:'<path d="M2 7h20v12H2zM2 11h20M6 15h4"/>',
 cashup:'<path d="M3 6h15a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 6l12-3v3"/><circle cx="16" cy="13" r="1.4"/>',
 stock:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
 purchases:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
 suppliers:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>',
 reports:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
 discounts:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
const SB_ITEMS=[
 {sc:'home',l:'Home',ic:'home',admin:true},
 {sc:'pos',l:'Till',ic:'till'},
 {sc:'quotes',l:'Quotes',ic:'quotes'},
 {sc:'delivery',l:'Deliveries',ic:'delivery'},
 {sc:'customers',l:'Customers',ic:'customers',admin:true},
 {sc:'cashup',l:'Cash-Up',ic:'cashup'},
 {sc:'yard',l:'Yard Reports',ic:'yard'},
 {sc:'inventory',l:'Stock',ic:'stock',admin:true},
 {sep:1},
 {sc:'sales',l:'Sales',ic:'sales'},
 {sc:'owed',l:'Money Owed',ic:'owed',admin:true},
 {sc:'purchases',l:'Purchases',ic:'purchases',admin:true},
 {sc:'reports',l:'Reports',ic:'reports',admin:true},
 {sc:'settings',l:'Settings',ic:'settings',admin:true}];
function buildSidebar(){
  const sb=document.getElementById('sideNav');if(!sb) return;
  const isAdmin=curUser?.role==='admin';
  sb.innerHTML=`<div class="sb-brand mfd"><div class="sb-full">${mfdLogo('gold')}<span>Point of Sale</span></div><div class="sb-mini">${mfdLogo('gold',{compact:1})}</div></div>
  <nav class="sb-nav">${SB_ITEMS.filter(i=>!i.admin||isAdmin).map(i=>i.sep?`<div class="sb-sep"></div>`:`<button class="sb-item" data-sc="${i.sc}" title="${i.l}" onclick="showSc('${i.sc}')">${svg(i.ic)}<span>${i.l}</span><em class="sb-badge" id="sbb-${i.sc}"></em></button>`).join('')}</nav>
  <div class="sb-foot"><div class="sb-net" id="sbNet" hidden></div><div class="sb-cloud" id="sbCloud" style="display:none"></div><div class="sb-shift" id="sbShift"></div>
    <div class="sb-user"><div><b>${curUser?.name||''}</b><span>${(curUser?.role||'').toUpperCase()}</span></div><button class="sb-lock" title="Log out" onclick="logoutPrompt()">${svg('lock')}<span>Log out</span></button></div>
    <div class="sb-credit"><img src="data:image/png;base64,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" alt="">MFD POS · by KreativG Studio</div></div>`;
  updateSbFoot();updateNetUI();
  try{updateCloudBadge();}catch(e){}
}
function updateSbFoot(){
  const el=document.getElementById('sbShift');if(!el) return;
  const sh=typeof curShift==='function'?curShift():null;
  el.innerHTML=`<i class="${sh?'on':''}"></i>${sh?'Shift open':'Shift closed'}`;
  const m=document.getElementById('mtopShift');if(m) m.innerHTML=`<i class="${sh?'on':''}"></i>${sh?'Open':'Closed'}`;
  const pend=(S.deliveries||[]).filter(d=>d.status!=='delivered').length;
  const b=document.getElementById('sbb-delivery');if(b){b.textContent=pend||'';b.style.display=pend?'':'none';}
}
const SB_TITLES={home:'Home',pos:'Till',quotes:'Quotes',delivery:'Deliveries',customers:'Customers',cashup:'Cash-Up',inventory:'Stock',sales:'Sales',sellreturns:'Returns',owed:'Money Owed',purchases:'Purchases',suppliers:'Suppliers',reports:'Reports',discounts:'Discounts',settings:'Settings',yard:'Yard Reports'};
const SC_GROUP={sellreturns:'sales',suppliers:'purchases',discounts:'reports'};
const SC_TABS={sales:[['sales','Sales'],['sellreturns','Returns']],purchases:[['purchases','Purchases'],['suppliers','Suppliers']],reports:[['reports','Reports'],['discounts','Discounts']]};
function renderScTabs(name){
  const g=SC_GROUP[name]||name;const tabs=SC_TABS[g];if(!tabs) return;
  if(curUser?.role!=='admin'&&g!=='sales') return;
  const sc=document.getElementById('sc-'+name);const hdr=sc?.querySelector('.sc-hdr');if(!hdr) return;
  let el=hdr.querySelector('.sc-tabs');if(!el){el=document.createElement('div');el.className='sc-tabs';hdr.insertBefore(el,hdr.firstChild);}
  el.innerHTML=tabs.map(([id,l])=>`<button class="${id===name?'on':''}" onclick="showSc('${id}')">${l}</button>`).join('');
}
function sbActive(name){renderScTabs(name);name=SC_GROUP[name]||name;document.body.classList.remove('sb-open');const t=document.getElementById('mtopTitle');if(t) t.textContent=SB_TITLES[name]||'Bricks & Sand';document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on',b.dataset.sc===name));updateSbFoot();}
// ── quick till controls ──
function mountQuick(){const h=document.getElementById('qDelHost'),d=document.getElementById('delDets'),f=document.getElementById('delCustFee');if(h&&d&&d.parentNode!==h){if(f){f.style.width='100%';h.appendChild(f);}h.appendChild(d);}}
document.addEventListener('DOMContentLoaded',mountQuick);setTimeout(mountQuick,0);
function renderQuick(){
  mountQuick();
  const t=document.getElementById('qTransport'),d=document.getElementById('qDisc');if(!t||!d) return;
  t.innerHTML=`<button data-z="" onclick="pickZone('')">Collect</button>`+S.zones.map(z=>`<button data-z="${z.id}" onclick="pickZone('${z.id}')">${z.name.replace(/\s*\(.*\)/,'').trim()}${/\(/.test(z.name)?' '+z.name.match(/\((.*)\)/)[1]:''}</button>`).join('');
  const max=Math.max(0,Math.floor(S.settings.maxDisc||0));
  d.innerHTML=Array.from({length:max+1},(_,n)=>`<button data-d="${n}" onclick="pickDisc(${n})">${n}%</button>`).join('');
  syncQuick();
}
function syncQuick(){
  const on=document.getElementById('delChk')?.checked,zv=document.getElementById('delZone')?.value;
  document.querySelectorAll('#qTransport button').forEach(b=>b.classList.toggle('on',on?b.dataset.z===String(zv):b.dataset.z===''));
  const dOn=document.getElementById('discChk')?.checked&&document.getElementById('discType')?.value==='pct';
  const dv=dOn?String(parseFloat(document.getElementById('discAmt').value)||0):'0';
  document.querySelectorAll('#qDisc button').forEach(b=>b.classList.toggle('on',b.dataset.d===dv));
}
function pickZone(id){
  const chk=document.getElementById('delChk');
  if(!id){chk.checked=false;}else{chk.checked=true;renderZoneOptions();document.getElementById('delZone').value=id;}
  togDel();syncQuick();
}
function pickDisc(n){
  const chk=document.getElementById('discChk');
  if(n<=0){chk.checked=false;discApprovedBy=null;togDiscShow();syncQuick();return;}
  const apply=()=>{chk.checked=true;document.getElementById('discType').value='pct';togDiscShow();document.getElementById('discAmt').value=n;calcCart();syncQuick();};
  if(discApprovedBy) apply();
  else reqAdmin(`Admin PIN required to approve a ${n}% discount`,()=>{discApprovedBy=adminName();apply();});
}

// ═══════════════════════════════════════
// MATERIAL CALCULATOR (bricks, cement, sand)
// ═══════════════════════════════════════
let calcTarget='sale';
function bricksPerM2(p){const n=(p?.name||'').toLowerCase();if(/block/.test(n)) return 12.5;if(/maxi/.test(n)) return 33;if(/pave/.test(n)) return 0;return 50;}
function openMatCalc(target){
  calcTarget=target||'sale';
  const bricks=S.products.filter(p=>p.cat==='brick'&&!/pave/i.test(p.name));
  const cem=S.products.filter(p=>p.cat==='cement');const sand=S.products.filter(p=>p.cat==='sand');
  const opt=(arr,pick)=>arr.map(p=>`<option value="${p.id}" ${pick(p)?'selected':''}>${esc(p.name)}</option>`).join('');
  document.getElementById('mcBrick').innerHTML=opt(bricks,p=>/stock/i.test(p.name));
  document.getElementById('mcCem').innerHTML=opt(cem,()=>true);
  document.getElementById('mcSand').innerHTML=opt(sand,p=>/bou/i.test(p.name));
  document.getElementById('mcBpm').value=bricksPerM2(S.products.find(p=>p.id==document.getElementById('mcBrick').value));
  document.getElementById('mcAdd').textContent=calcTarget==='quote'?'Add to quote':'Add to sale';
  mcCalc();openMo('matCalcMo');
}
function mcBrickChanged(){document.getElementById('mcBpm').value=bricksPerM2(S.products.find(p=>p.id==document.getElementById('mcBrick').value));mcCalc();}
let _mc=null;
function mcCalc(){
  const v=id=>parseFloat(document.getElementById(id).value)||0;
  const area=Math.max(0,(v('mcLen')*v('mcHt'))-v('mcOpen'));const skins=parseInt(document.getElementById('mcSkin').value)||1;
  const waste=1+v('mcWaste')/100;
  const bricks=Math.ceil(area*skins*v('mcBpm')*waste);
  const cemBags=Math.ceil(area*skins*v('mcCemM2')*waste);
  const sandM3=cemBags*v('mcSandBag');const loads=v('mcLoad')>0?Math.ceil((sandM3/v('mcLoad'))*2)/2:0;
  const bp=S.products.find(p=>p.id==document.getElementById('mcBrick').value);
  const per1000=bp&&/1000/.test(bp.unit);const bQty=per1000?Math.ceil(bricks/100)/10:bricks;
  _mc={area,bricks,bQty,cemBags,sandM3,loads,bp,cp:S.products.find(p=>p.id==document.getElementById('mcCem').value),sp:S.products.find(p=>p.id==document.getElementById('mcSand').value)};
  const cost=(bp?bp.up*bQty:0)+(_mc.cp?_mc.cp.up*cemBags:0)+(_mc.sp?_mc.sp.up*loads:0);
  document.getElementById('mcOut').innerHTML=area>0?`
    <div class="mc-res"><span>Wall area</span><b>${area.toFixed(2)} m²${skins>1?' × '+skins+' skins':''}</b></div>
    <div class="mc-res"><span>${esc(bp?.name||'Bricks')}</span><b>${bricks.toLocaleString('en-ZA')} bricks${per1000?` = ${bQty} thousand`:''}</b></div>
    <div class="mc-res"><span>${esc(_mc.cp?.name||'Cement')}</span><b>${cemBags} bags</b></div>
    <div class="mc-res"><span>${esc(_mc.sp?.name||'Sand')}</span><b>${sandM3.toFixed(2)} m³ ≈ ${loads} load${loads===1?'':'s'}</b></div>
    <div class="mc-res tot"><span>Estimated cost</span><b>${RZ(cost)}</b></div>`:'<div style="color:var(--gl);font-size:13px">Enter the wall length and height.</div>';
}
function mcAdd(){
  if(!_mc||_mc.area<=0){toast('Enter the wall size first',true);return;}
  const items=[[_mc.bp,_mc.bQty],[_mc.cp,_mc.cemBags],[_mc.sp,_mc.loads]].filter(([p,q])=>p&&q>0);
  if(calcTarget==='quote'){
    qLines=qLines.filter(l=>l.name);
    items.forEach(([p,q])=>{const ex=qLines.find(l=>l.name===p.name);if(ex) ex.qty=Math.round((ex.qty+q)*100)/100;else qLines.push({name:p.name,qty:q,unit:p.unit,up:p.up});});
    renderQLines();calcQ();
  } else {
    items.forEach(([p,q])=>{if(p.stk<q){toast(`Only ${fmtQty(p.stk)} ${p.unit} of ${p.name} in stock`,true);}const ex=cart.find(i=>i.id===p.id);if(!ex){addCart(p.id);}const it=cart.find(i=>i.id===p.id);if(it) setQty(p.id,ex?ex.qty+q:q);});
  }
  closeMo('matCalcMo');toast('Materials added');
}

// ═══════════════════════════════════════
// ITEM-LEVEL RETURNS
// ═══════════════════════════════════════
let retTxId=null;
function retLeft(t,i){const done=(t.returned||{})[i.id]||0;return Math.round((i.qty-done)*100)/100;}
function openItemReturn(txId){
  const t=S.transactions.find(x=>x.id===txId);if(!t){toast('Sale not found',true);return;}
  closeAllSaleMenus&&closeAllSaleMenus();closeMo('returnMo');
  retTxId=txId;
  const sub=txSub(t);const ratio=sub>0?Math.max(0,1-(t.discAmt||0)/sub):1;
  document.getElementById('riTitle').textContent=`Return items — ${t.id} · ${t.cust}`;
  document.getElementById('riBody').innerHTML=`<table class="ri-t"><thead><tr><th>Item</th><th>Sold</th><th>Can return</th><th>Return</th><th class="r">Refund</th></tr></thead><tbody>${
    (t.cart||[]).map((i,k)=>{const left=retLeft(t,i);const pr=gP(i)*ratio;return `<tr><td><b>${esc(i.name)}</b><div class="ci-sub">${RZ(pr)} / ${esc(i.unit)}${ratio<1?' (after discount)':''}</div></td><td>${fmtQty(i.qty)}</td><td>${fmtQty(left)}</td>
    <td><input type="number" min="0" max="${left}" step="any" id="ri-${k}" value="0" ${left<=0?'disabled':''} oninput="riCalc()" class="qv-in"></td><td class="r" id="ria-${k}">R 0.00</td></tr>`;}).join('')}</tbody></table>
    <div class="fr" style="margin-top:12px"><div class="fg"><label>Refund method</label><select id="riMethod" onchange="riCalc()">${t.method==='account'?'<option value="account">Credit the account</option>':''}<option value="cash" ${t.method==='cash'||t.method==='split'?'selected':''}>Cash</option><option value="card" ${t.method==='card'?'selected':''}>Card (reverse on FNB machine)</option><option value="eft" ${t.method==='eft'?'selected':''}>EFT</option>${t.method!=='account'&&S.customers.some(c=>c.name===t.cust)?'<option value="account">Credit the account</option>':''}</select></div>
    <div class="fg"><label>Reason</label><select id="riReason"><option>Customer changed mind</option><option>Damaged / broken</option><option>Wrong item supplied</option><option>Over-ordered</option><option>Other</option></select></div></div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:8px"><input type="checkbox" id="riRestock" checked> Put returned items back into stock</label>
    <div class="ri-tot">Refund total <b id="riTot">R 0.00</b></div>
    <div class="ci-sub" style="margin-top:4px">Transport is not refunded.</div>`;
  openMo('itemRetMo');
}
function riVals(){const t=S.transactions.find(x=>x.id===retTxId);const sub=txSub(t);const ratio=sub>0?Math.max(0,1-(t.discAmt||0)/sub):1;
  return (t.cart||[]).map((i,k)=>{let q=parseFloat(document.getElementById('ri-'+k)?.value)||0;const left=retLeft(t,i);if(q>left) q=left;if(q<0) q=0;return {item:i,qty:q,amt:Math.round(gP(i)*ratio*q*100)/100};});}
function riCalc(){const v=riVals();v.forEach((x,k)=>{const el=document.getElementById('ria-'+k);if(el) el.textContent=RZ(x.amt);});document.getElementById('riTot').textContent=RZ(v.reduce((s,x)=>s+x.amt,0));}
function saveItemReturn(){
  const t=S.transactions.find(x=>x.id===retTxId);if(!t) return;
  const v=riVals().filter(x=>x.qty>0);if(!v.length){toast('Enter a quantity to return',true);return;}
  const amt=Math.round(v.reduce((s,x)=>s+x.amt,0)*100)/100;const method=document.getElementById('riMethod').value;
  const reason=document.getElementById('riReason').value;const restock=document.getElementById('riRestock').checked;
  reqAdmin(`Admin PIN required to refund ${RZ(amt)}`,()=>{
    t.returned=t.returned||{};
    v.forEach(x=>{t.returned[x.item.id]=Math.round(((t.returned[x.item.id]||0)+x.qty)*100)/100;if(restock){const p=S.products.find(p=>p.id===x.item.id);if(p&&!p.noStock) p.stk=Math.round((p.stk+x.qty)*100)/100;}});
    t.returnedAmt=Math.round(((t.returnedAmt||0)+amt)*100)/100;
    if(method==='account'){const c=S.customers.find(c=>c.name===t.cust);if(c) c.balance=Math.max(0,Math.round((c.balance-amt)*100)/100);if(t.method==='account'&&t.remainingOwed!==undefined) t.remainingOwed=Math.max(0,t.remainingOwed-amt);}
    const id=newDocId('RET','nextReturnId',S.sellReturns);
    S.sellReturns.unshift({id,originalInvoice:t.id,cust:t.cust,phone:t.phone||'',amount:amt,method,partial:true,reason,restocked:restock,
      items:v.length,cart:v.map(x=>({...x.item,qty:x.qty})),origDate:t.date,date:nowStamp(),cashier:curUser?.name,refundedBy:adminName()});
    logAudit(`Item return ${id} on ${t.id}: ${v.map(x=>fmtQty(x.qty)+' '+x.item.name).join(', ')} — ${RZ(amt)} (${method}) · ${reason}`,adminName());
    saveState();closeMo('itemRetMo');renderSales&&renderSales();updateNavBadge&&updateNavBadge();
    toast(`${id}: refund ${RZ(amt)} (${method})`);
  });
}

// ═══════════════════════════════════════
// QUOTE FOLLOW-UPS
// ═══════════════════════════════════════
function quoteNeedsFollow(q){
  if(q.status!=='sent'||q.converted) return false;
  const until=qValidUntil(q.date,q.validDays);if(until&&new Date(until)<new Date(new Date().toDateString())) return false;
  const last=(q.followUps&&q.followUps[0]?.ts)||q.sentAt||q.date;
  return daysSince(last)>=(S.settings.qFollowDays||3);
}
function followMsg(q,link){
  const s=S.settings,sent=q.sentAt||q.date;
  return `Good day ${q.cust},

This is *${s.compName}* following up on *quotation ${q.id}*, sent on ${longDate(sent)}.

💰 *Total:* ${RZ(q.amount)}
⏳ *Valid until:* ${longDate(qValidUntil(q.date,q.validDays))}

${waPdfLine(link,'quotation')}

Can we go ahead and book it for you? Simply reply *YES*, or call us on ${s.phone}. We are happy to adjust quantities or arrange delivery.

${waSign()}`;
}
function followUpQuote(id){
  const q=S.quotes.find(x=>x.id===id);if(!q) return;
  waSendPdf({phone:q.contact,label:'quote follow-up',docId:q.id,html:quoteDocHtml(q.id),message:link=>followMsg(q,link)});
  q.followUps=q.followUps||[];q.followUps.unshift({ts:new Date().toISOString(),by:curUser?.name||''});
  logAudit(`Quote ${q.id} followed up on WhatsApp`,curUser?.name||'');saveState();renderQuotes();
}
function quotesToFollow(){return S.quotes.filter(quoteNeedsFollow);}

// ═══════════════════════════════════════
// YARD REPORTS — morning / afternoon / status / final daily report to the boss
// Absentees, what each bay is doing, machines and problems; the final report also
// carries the day's production (added to stock, cement taken off), the client
// payments and the deliveries, taken straight from the system.
// ═══════════════════════════════════════
const YARD_TYPES={morning:'Morning Daily Report',afternoon:'Afternoon Inspection Report',update:'Current Status Update',final:'Final Daily Report'};
const YARD_ACTS=[['mixing','Mixing sand and cement'],['producing','Producing bricks'],['watering','Watering bricks'],['packing','Packing bricks'],['wrapping','Wrapping on pallets']];
const YARD_MACH={working:'Machines working',issue:'A machine is not working properly',repair:'Machine under repair',stopped:'No machine operating'};
let yardEditId=null;
const yardBays=()=>(S.settings.yardBays&&S.settings.yardBays.length?S.settings.yardBays:['Bay 1','Bay 2']);
const brickProducts=()=>S.products.filter(p=>p.cat==='brick'||/brick|block|pave/i.test(p.name));
const cementProduct=()=>S.products.find(p=>p.cat==='cement')||S.products.find(p=>/cement/i.test(p.name));
const fmtYmd=s=>fmtD(new Date(String(s||'').slice(0,10)+'T12:00:00'));   // '2026-10-21' → 21 Oct 2026
const yDate=v=>{const d=txD(v);return d.getTime()?d.toISOString().slice(0,10):String(v||'').slice(0,10);};
// "per 1000" products are counted in bricks on the report; other units as they are sold
const prodToStock=(p,n)=>p&&/1000/.test(p.unit)?Math.round(n)/1000:n;
const prodUnitLbl=p=>p?(/1000/.test(p.unit)||(p.cat==='brick'&&p.unit==='each')?'bricks':p.unit):'bricks';

const YARD_SHORT={morning:'Morning',afternoon:'Afternoon',update:'Status update',final:'Final'};
let yardFilterVal='all',yardRange='all';
function setYardFilter(v){yardFilterVal=v;renderYard();}
// date filter: quick ranges, or From / To chosen by hand
const ymd=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
function setYardRange(r){
  yardRange=r;
  if(r!=='custom'){
    const t=new Date(),f=el('yFrom'),to=el('yTo');
    const monday=new Date(t.getFullYear(),t.getMonth(),t.getDate()-((t.getDay()+6)%7));
    const from={today:ymd(t),yesterday:ymd(new Date(t.getTime()-864e5)),week:ymd(monday),month:ymd(new Date(t.getFullYear(),t.getMonth(),1)),all:''}[r];
    if(f) f.value=from||'';if(to) to.value=r==='yesterday'?from:r==='all'?'':ymd(t);
  }
  renderYard();
}
const yTime=r=>r.time?new Date(r.time).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'}):'';
const yBricks=r=>(r.bays||[]).reduce((t,b)=>t+(+b.produced||0),0);
const yFuel=r=>(r.fuel||[]).reduce((t,f)=>t+(+f.amount||0),0);
function yardFiltered(){
  const from=el('yFrom')?.value||'',to=el('yTo')?.value||'',q=(el('ySearch')?.value||'').trim().toLowerCase();
  return (S.yardReports||[]).filter(r=>(yardFilterVal==='all'||r.type===yardFilterVal)&&(!from||r.date>=from)&&(!to||r.date<=to)
      &&(!q||[r.by,r.id,r.issues,r.notes,r.shortages,(r.absent||[]).join(' '),(r.leave||[]).join(' '),...(r.bays||[]).map(b=>b.name+' '+(b.note||'')),
        ...(r.fuel||[]).map(f=>Object.values(f).join(' ')),...(r.money||[]).map(m=>Object.values(m).join(' ')),...(r.complaints||[]).map(c=>Object.values(c).join(' '))].join(' ').toLowerCase().includes(q)))
    .sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
}
function renderYard(){
  const host=el('yardList');if(!host) return;
  const all=S.yardReports||[],today=ymd(new Date()),last7=ymd(new Date(Date.now()-6*864e5));
  el('yardQuick').innerHTML=Object.keys(YARD_TYPES).map(t=>{
    const d=all.filter(r=>r.date===today&&r.type===t).sort((a,b)=>(b.time||'').localeCompare(a.time||''))[0];
    return `<button class="yq t-${t}" onclick="openYard(null,'${t}')"><b>${YARD_SHORT[t]}</b><span>${YARD_TYPES[t]}</span>${d?`<span class="done">✓ Done ${yTime(d)}</span>`:'<span>Not done yet · tap to start</span>'}</button>`;
  }).join('');
  const fin=all.filter(r=>r.type==='final'&&r.date>=last7);
  const made=fin.reduce((s,r)=>s+yBricks(r),0),cem=fin.reduce((s,r)=>s+(r.bays||[]).reduce((t,b)=>t+(+b.cement||0),0),0);
  const todays=all.filter(r=>r.date===today),absent=todays.length?Math.max(...todays.map(r=>(r.absent||[]).length)):0;
  const fuel=all.filter(r=>r.date>=last7).reduce((s,r)=>s+yFuel(r),0);
  el('yardKpis').innerHTML=`<div class="yard-kpi"><span>Absent today</span><b>${absent}</b><small>${todays.length?`from ${todays.length} report${todays.length>1?'s':''} today`:'no report yet today'}</small></div>
    <div class="yard-kpi"><span>Bricks made · 7 days</span><b>${made.toLocaleString('en-ZA')}</b><small>from final reports</small></div>
    <div class="yard-kpi"><span>Cement used · 7 days</span><b>${cem.toLocaleString('en-ZA')}</b><small>bags</small></div>
    <div class="yard-kpi"><span>Diesel & fuel · 7 days</span><b>${RZ(fuel).replace('R ','R')}</b><small>from all reports</small></div>`;
  el('yardFilterBtns').innerHTML=[['all','All'],...Object.entries(YARD_SHORT)].map(([k,l])=>`<button class="${yardFilterVal===k?'on':''}" onclick="setYardFilter('${k}')">${l}</button>`).join('');
  el('yardRangeBtns').innerHTML=[['today','Today'],['week','This week'],['month','This month'],['all','All dates']].map(([k,l])=>`<button class="${yardRange===k?'on':''}" onclick="setYardRange('${k}')">${l}</button>`).join('')
    +`<button onclick="yardWeekSummary()" title="One summary of the reports shown, for the boss"><i class=i-file></i> Summary of these</button>`;
  const list=yardFiltered();
  el('yardCount').textContent=all.length?`Showing ${list.length} of ${all.length} report${all.length===1?'':'s'} · tap a report to open it`:'';
  if(!list.length){host.innerHTML=`<div class="yard-empty">${all.length?'No reports match these filters.':'No yard reports yet. Tap one of the tiles above to write the first one.'}</div>`;return;}
  // a short list: date, time of day, bricks — one report opens at a time
  host.innerHTML=`<div class="yr-list">${list.map(r=>{const b=yBricks(r),flags=[(r.absent||[]).length?`${r.absent.length} absent`:'',(r.complaints||[]).length?`${r.complaints.length} complaint${r.complaints.length>1?'s':''}`:'',(r.bays||[]).some(x=>x.machine&&x.machine!=='working')?'machine problem':''].filter(Boolean);
    return `<button class="yr-row t-${r.type}" onclick="openYardView('${r.id}')">
      <span class="yr-badge">${YARD_SHORT[r.type]||r.type}</span>
      <span class="yr-when"><b>${esc(fmtYmd(r.date))}</b><small>${yTime(r)}</small></span>
      <span class="yr-bricks">${b?`<b>${b.toLocaleString('en-ZA')}</b><small>bricks</small>`:'<small>—</small>'}</span>
      <span class="yr-flags">${flags.map(f=>`<i>${esc(f)}</i>`).join('')}${r.sentAt?'<i class="ok">✓ sent</i>':''}</span>
      <span class="yr-go">›</span></button>`;}).join('')}</div>`;
}
function openYardView(id){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return;
  el('askTitle').textContent=`${YARD_TYPES[r.type]||'Report'} — ${fmtYmd(r.date)}`;el('askOkBtn').textContent='Close';
  // each part of the report (production, diesel, money…) is its own document with its own PDF
  const secs=yardSections(r);
  el('askBody').innerHTML=`<div class="yard-hint" style="margin-bottom:8px">${secs.length} separate report${secs.length===1?'':'s'} — each has its own PDF, print and WhatsApp.</div>
    ${secs.map(x=>`<div class="yr-sec">
      <div class="yr-acts yr-sec-acts"><b>${esc(x.doc)}</b>
        <span class="al" onclick="sendYardSec('${r.id}','${x.key}')" style="color:var(--clay)"><i class=i-wa></i> Send to the boss</span>
        <span class="al" onclick="yardSecPdf('${r.id}','${x.key}')"><i class=i-download></i> PDF</span>
        <span class="al" onclick="printHTML(yardSecDocHtml('${r.id}','${x.key}'),'a4')"><i class=i-printer></i> Print</span></div>
      <div class="yr-view">${yardSecDocHtml(r.id,x.key)}</div></div>`).join('')}
    <div class="yr-acts">
      <span class="al" onclick="closeMo('askMo');openYard('${r.id}')">Edit</span>
      ${curUser?.role==='admin'?`<span class="al red" onclick="closeMo('askMo');delYard('${r.id}')">Delete</span>`:''}
      <span style="flex:1"></span>
      <span class="al" style="font-size:12px;color:var(--g)" title="All the parts in one document" onclick="downloadYardPdf('${r.id}')">Whole report in one PDF</span>
    </div>`;
  askCb=()=>true;openMo('askMo');el('askMo').querySelector('.mo').classList.add('wide');
}
function yardChips(r){
  const c=[],made=yBricks(r);
  if((r.absent||[]).length) c.push(['warn',`${r.absent.length} absent: ${r.absent.join(', ')}`]);else if(!r.imported) c.push(['good','All workers present']);
  if(made) c.push(['good',`${made.toLocaleString('en-ZA')} bricks`]);
  const fuel=yFuel(r);if(fuel) c.push(['',`Fuel ${RZ(fuel)}`]);
  (r.bays||[]).filter(b=>b.machine&&b.machine!=='working').forEach(b=>c.push(['bad',`${b.name}: ${YARD_MACH[b.machine]?.toLowerCase()}`]));
  if(r.issues) c.push(['warn',r.issues.length>90?r.issues.slice(0,88)+'…':r.issues]);
  return c;
}
function yardSummary(r){return yardChips(r).map(x=>x[1]).join(' · ');}

// esc() for text inside an attribute: quotes too, so typed text (5" pipe, "Thabo") never breaks the form
const escA=v=>esc(v).replace(/"/g,'&quot;');
// small editable tables inside the report (fuel, money, complaints)
function yRows(key,cols,rows){
  const row=v=>`<div class="yrow">${cols.map(([k,l,t])=>`<input data-k="${k}" type="${t||'text'}" ${t==='number'?'step="any" min="0" inputmode="decimal"':''} placeholder="${esc(l)}" aria-label="${esc(l)}" value="${escA(v?.[k]??'')}">`).join('')}<button type="button" class="yrow-x" title="Remove" onclick="this.parentElement.remove()">✕</button></div>`;
  return `<div class="yrows" id="yr_${key}" data-cols="${escA(JSON.stringify(cols))}">${(rows&&rows.length?rows:[null]).map(row).join('')}</div>
    <button type="button" class="btn-s yrow-add" onclick="yAddRow('${key}')">+ Add line</button>`;
}
function yAddRow(key){
  const box=el('yr_'+key),cols=JSON.parse(box.dataset.cols);
  box.insertAdjacentHTML('beforeend',`<div class="yrow">${cols.map(([k,l,t])=>`<input data-k="${k}" type="${t||'text'}" ${t==='number'?'step="any" min="0" inputmode="decimal"':''} placeholder="${esc(l)}" aria-label="${esc(l)}">`).join('')}<button type="button" class="yrow-x" title="Remove" onclick="this.parentElement.remove()">✕</button></div>`);
}
function yReadRows(key){
  const box=el('yr_'+key);if(!box) return [];
  const cols=JSON.parse(box.dataset.cols);
  return [...box.querySelectorAll('.yrow')].map(r=>{const o={};r.querySelectorAll('input').forEach(i=>{const t=cols.find(c=>c[0]===i.dataset.k)?.[2];o[i.dataset.k]=t==='number'?(i.value===''?'':+i.value):i.value.trim();});return o;})
    .filter(o=>Object.values(o).some(v=>v!==''&&v!==0));
}
const Y_FUEL=[['driver','Driver'],['amount','Amount (R)','number'],['litres','Litres','number'],['invoice','Invoice no.']];
const Y_MONEY=[['who','Received by'],['amount','Amount (R)','number'],['spent','Spent on'],['change','Change returned (R)','number']];
const Y_COMPL=[['name','Customer'],['contact','Contact'],['complaint','Complaint'],['action','Action needed']];

function openYard(id,type){
  const r=id?(S.yardReports||[]).find(x=>x.id===id):null;yardEditId=r?r.id:null;
  const h=new Date().getHours();
  const v=r?JSON.parse(JSON.stringify(r)):{type:type||(h<12?'morning':h<16?'afternoon':'final'),date:ymd(new Date()),absent:[],leave:[],issues:'',notes:'',shortages:'',fuel:[],money:[],complaints:[],
    bays:yardBays().map(n=>({name:n,machine:'working',acts:['mixing','producing','watering','packing'],note:'',pid:(brickProducts()[0]||{}).id||'',produced:'',cement:'',sand:''}))};
  el('yardMoTitle').textContent=r?`Edit ${YARD_TYPES[r.type]||'report'}`:'New yard report';
  const bricks=brickProducts();
  el('yardBody').innerHTML=`
    <input type="hidden" id="yType" value="${esc(v.type)}">
    <div class="yseg" id="ySeg">${Object.keys(YARD_TYPES).map(k=>`<button type="button" class="t-${k}" data-t="${k}" onclick="el('yType').value='${k}';yardTypeChanged()">${YARD_SHORT[k]}</button>`).join('')}</div>
    <div class="fr">
      <div class="fg"><label>Date</label><input type="date" id="yDate" value="${esc(v.date)}" onchange="yardTypeChanged()"></div>
      <div class="fg"><label>To</label><input type="text" id="yTo2" value="${escA(v.to||S.settings.bossName||'Mr Mufamadi')}"></div>
    </div>
    <div class="yard-sec">1 · Bricks production per bay</div>
    ${v.bays.map((b,i)=>{const p=S.products.find(x=>x.id==b.pid);return `<div class="yard-bay" data-bay="${i}">
      <h4><span>${esc(b.name)}</span><select class="y-mach" aria-label="Machines in ${esc(b.name)}">${Object.entries(YARD_MACH).map(([k,l])=>`<option value="${k}" ${b.machine===k?'selected':''}>${l}</option>`).join('')}</select></h4>
      <div class="yard-acts">${YARD_ACTS.map(([k,l])=>`<label><input type="checkbox" class="y-act" value="${k}" ${(b.acts||[]).includes(k)?'checked':''}> ${l}</label>`).join('')}</div>
      <div class="yard-prodg4 y-prod">
        <div class="fg"><label>Product made</label><select class="y-pid" onchange="yardUnitHint(this)">${bricks.map(x=>`<option value="${x.id}" ${x.id==b.pid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
        <div class="fg"><label class="y-qlbl">Bricks made</label><input type="number" min="0" step="any" inputmode="numeric" class="y-qty" value="${esc(b.produced)}" oninput="yardUnitHint(this)"><div class="yard-hint y-hint"></div></div>
        <div class="fg"><label>Cement used (bags)</label><input type="number" min="0" step="1" inputmode="numeric" class="y-cem" value="${esc(b.cement)}"></div>
        <div class="fg"><label>Sand used (loads)</label><input type="number" min="0" step="any" inputmode="decimal" class="y-sand" value="${esc(b.sand??'')}"></div>
      </div>
      <div class="fg"><label>Status / notes</label><input type="text" class="y-note" value="${escA(b.note||'')}" placeholder="e.g. Bricks watered, the rest before knocking off"></div>
    </div>`;}).join('')}
    <div class="yard-sec">2 · Diesel and fuel spent</div>${yRows('fuel',Y_FUEL,v.fuel)}
    <div class="yard-sec">3 · Money handled</div>${yRows('money',Y_MONEY,v.money)}
    <div class="yard-sec">4 · Shortages of materials</div>
    <div class="fg"><textarea id="yShort" rows="2" placeholder="e.g. Cement running low — 12 bags left">${esc(v.shortages||'')}</textarea></div>
    <div class="yard-sec">5 · Absent staff and leave</div>
    <div class="fr">
      <div class="fg"><label>Absent (separate names with commas)</label><input type="text" id="yAbsent" value="${escA((v.absent||[]).join(', '))}" placeholder="e.g. Khuliso Ndou, Remember"></div>
      <div class="fg"><label>On leave</label><input type="text" id="yLeave" value="${escA((v.leave||[]).join(', '))}" placeholder="e.g. Vukosi (until 30 Oct)"></div>
    </div>
    <div class="yard-sec">6 · Customer complaints</div>${yRows('compl',Y_COMPL,v.complaints)}
    <div class="yard-sec">Other</div>
    <div class="fg"><label>Problems (water, machines…)</label><textarea id="yIssues" rows="2" placeholder="e.g. Water shortage: the supply is shared with the builders">${esc(v.issues||'')}</textarea></div>
    <div class="fg"><label>Other notes</label><textarea id="yNotes" rows="2">${esc(v.notes||'')}</textarea></div>
    <div id="yAuto"></div>`;
  yardTypeChanged();document.querySelectorAll('#yardBody .y-qty').forEach(i=>yardUnitHint(i));
  openMo('yardMo');
}
function yardUnitHint(elm){
  const bay=elm.closest('.yard-bay');const p=S.products.find(x=>x.id==bay.querySelector('.y-pid').value);
  bay.querySelector('.y-qlbl').textContent=`Bricks made (${prodUnitLbl(p)})`;
  const n=parseFloat(bay.querySelector('.y-qty').value)||0,fin=el('yType')?.value==='final';
  bay.querySelector('.y-hint').textContent=p&&n?(fin?`Adds ${fmtQty(prodToStock(p,n))} ${prodUnitLbl(p)==='bricks'&&!/1000/.test(p.unit)?'bricks':p.unit} to ${p.name} stock`:'Stock is updated from the Final report'):'';
}
function yardTypeChanged(){
  const fin=el('yType').value==='final',date=el('yDate').value;
  document.querySelectorAll('#ySeg button').forEach(b=>b.classList.toggle('on',b.dataset.t===el('yType').value));
  document.querySelectorAll('#yardBody .y-qty').forEach(i=>yardUnitHint(i));
  const a=el('yAuto');if(!a) return;
  if(!fin){a.innerHTML='<div class="yard-hint" style="color:var(--g)">Stock is only updated from the Final daily report, so production is never counted twice.</div>';return;}
  const s=yardSnapshot(date);
  a.innerHTML=`<div class="yard-auto"><b>Added to the report from the system for ${esc(fmtYmd(date))}:</b><br>
    ${s.payments.length?s.payments.map(p=>`Payment: ${esc(p.cust)} paid ${RZ(p.today)} · balance now ${RZ(p.remaining)}`).join('<br>'):'No client payments recorded on this date.'}<br>
    ${s.deliveries.length?s.deliveries.map(d=>`Delivery: ${esc(d.cust)} — ${d.loads} load${d.loads===1?'':'s'} (${esc(d.what)})`).join('<br>'):'No deliveries recorded on this date.'}
    <div class="yard-hint">Saving the final report adds the bricks made to stock and takes the cement used off ${esc(cementProduct()?.name||'cement')} stock.</div></div>`;
}
// payments and deliveries of that day, frozen into the report when it is saved
function yardSnapshot(date){
  const payments=[];
  (S.customers||[]).forEach(c=>{
    const ps=(c.payments||[]).filter(p=>p&&p.amount>0);
    const today=ps.filter(p=>yDate(p.ts||p.date)===date).reduce((s,p)=>s+p.amount,0);if(!today) return;
    const before=ps.filter(p=>yDate(p.ts||p.date)<date).reduce((s,p)=>s+p.amount,0);
    payments.push({cust:c.name,today,before,totalPaid:today+before,remaining:c.balance||0,previous:(c.balance||0)+today+before});
  });
  const by={};
  (S.deliveries||[]).filter(d=>yDate(d.reqDate||d.date)===date).forEach(d=>{
    const m=/(\d+(?:\.\d+)?)\s*loads?\b/i.exec(d.load||'');const n=m?+m[1]:1;
    const k=d.cust;(by[k]=by[k]||{cust:k,loads:0,what:[]}).loads+=n;by[k].what.push(String(d.load||'').replace(/\s*×?\s*\d+(\.\d+)?\s*loads?\b/i,'').trim()||'load');
  });
  const deliveries=Object.values(by).map(x=>({...x,what:[...new Set(x.what)].join(', ')}));
  const sandLoads=Object.values(by).reduce((s,x)=>s+(/sand/i.test(x.what)?x.loads:0),0);
  return {payments,deliveries,sandLoads};
}
function readYardForm(){
  const names=id=>(el(id)?.value||'').split(/[,;\n]/).map(s=>s.trim()).filter(Boolean);
  const v={type:el('yType').value,date:el('yDate').value,to:(el('yTo2')?.value||'').trim(),absent:names('yAbsent'),leave:names('yLeave'),
    issues:el('yIssues').value.trim(),notes:el('yNotes').value.trim(),shortages:(el('yShort')?.value||'').trim(),
    fuel:yReadRows('fuel'),money:yReadRows('money'),complaints:yReadRows('compl'),bays:[]};
  document.querySelectorAll('#yardBody .yard-bay').forEach((bx,i)=>{
    v.bays.push({name:yardBays()[i]||('Bay '+(i+1)),machine:bx.querySelector('.y-mach').value,acts:[...bx.querySelectorAll('.y-act:checked')].map(c=>c.value),
      note:bx.querySelector('.y-note').value.trim(),pid:+bx.querySelector('.y-pid')?.value||'',produced:parseFloat(bx.querySelector('.y-qty').value)||0,
      cement:parseInt(bx.querySelector('.y-cem').value)||0,sand:parseFloat(bx.querySelector('.y-sand')?.value)||0});
  });
  return v;
}
// stock follows the final report: only the difference from what this report already applied
function applyYardStock(r){
  if(r.type!=='final'||r.imported){r.stockApplied=r.stockApplied||{};return;}
  const want={};
  r.bays.forEach(b=>{const p=S.products.find(x=>x.id==b.pid);if(p&&b.produced>0) want[p.id]=(want[p.id]||0)+prodToStock(p,b.produced);});
  const cem=cementProduct(),bags=r.bays.reduce((s,b)=>s+(b.cement||0),0);if(cem&&bags) want[cem.id]=(want[cem.id]||0)-bags;
  const had=r.stockApplied||{},ids=new Set([...Object.keys(want),...Object.keys(had)]);
  ids.forEach(id=>{
    const diff=Math.round(((want[id]||0)-(had[id]||0))*1000)/1000;if(!diff) return;
    const p=S.products.find(x=>String(x.id)===String(id));if(!p) return;
    const before=p.stk;p.stk=Math.round((p.stk+diff)*1000)/1000;
    logAdj(p,before,p.stk,diff>0?'Production':'Used in production',`${YARD_TYPES.final} ${r.date} (${r.id})`,curUser?.name||'','production');
  });
  r.stockApplied=want;
}
function saveYard(send){
  const v=readYardForm();
  if(!v.date){toast('Choose the date',true);return;}
  S.yardReports=S.yardReports||[];
  let r=yardEditId?S.yardReports.find(x=>x.id===yardEditId):null;
  if(r) Object.assign(r,v,{edited:new Date().toISOString(),editedBy:curUser?.name||''});
  else{r={id:newDocId('RPT','nextRptId',S.yardReports),...v,time:new Date().toISOString(),by:curUser?.name||''};S.yardReports.unshift(r);}
  if(r.type==='final') r.snap=yardSnapshot(r.date);else delete r.snap;
  applyYardStock(r);
  logAudit(`${YARD_TYPES[r.type]} ${r.date} saved (${r.id})`,curUser?.name||'');
  saveState();closeMo('yardMo');renderYard();try{renderInv();renderProds();updateNavBadge();}catch(e){}
  toast(r.type==='final'?'Final report saved — stock updated':'Report saved');
  if(send) sendYard(r.id);
}
function delYard(id){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return;
  confirm('Delete report',`Delete ${YARD_TYPES[r.type]} of ${fmtYmd(r.date)}?${r.type==='final'&&!r.imported?' The stock it added (and the cement it used) is taken back.':''}`,()=>reqAdmin('Admin PIN required to delete a report',()=>{
    if(r.type==='final'&&!r.imported){r.bays=r.bays.map(b=>({...b,produced:0,cement:0}));applyYardStock(r);}
    S.yardReports=S.yardReports.filter(x=>x.id!==id);logAudit(`Yard report ${id} deleted`,curUser?.name||'');saveState();renderYard();try{renderInv();renderProds();}catch(e){}toast('Report deleted');
  }));
}

// ── the report on the MFD letterhead (print and PDF) ──
function yardRowsHtml(rows,cols){
  return `<table class="pd-tbl" style="margin-top:4px"><thead><tr>${cols.map(c=>`<th${c[2]==='number'?' class="r"':''}>${esc(c[1])}</th>`).join('')}</tr></thead><tbody>${rows.map(x=>`<tr>${cols.map(c=>`<td${c[2]==='number'?' class="r"':''}>${c[2]==='number'&&x[c[0]]!==''&&/R\)/.test(c[1])?RZ(x[c[0]]):esc(x[c[0]]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
// the parts of a report; each is also printed and sent on its own (h: heading in the whole report,
// doc: title of its own document)
const YARD_SEC_DOC={production:'DAILY BRICKS PRODUCTION UPDATE',fuel:'DIESEL EXPENSE REPORT',money:'MONEY HANDLING UPDATE',shortages:'SHORTAGES OF MATERIALS',
  absent:'ABSENTEEISM UPDATE',complaints:'CUSTOMER COMPLAINTS',payments:'CLIENT PAYMENTS',deliveries:'DELIVERY SUMMARY',problems:'PROBLEMS',notes:'NOTES'};
function yardSections(r){
  const out=[];const add=(key,h,html)=>{if(html) out.push({key,h,doc:YARD_SEC_DOC[key],html});};
  const bayHtml=b=>{const p=S.products.find(x=>x.id==b.pid);const acts=YARD_ACTS.filter(([k])=>(b.acts||[]).includes(k)).map(([,l])=>l);
    return `<div style="margin-bottom:8px"><b>${esc(b.name)}</b>
      ${b.produced?`<div class="pd-line"><span>${esc(p?p.name:'Bricks')} made</span><b>${Number(b.produced).toLocaleString('en-ZA')} ${esc(prodUnitLbl(p))}</b></div>`:''}
      ${b.cement?`<div class="pd-line"><span>Cement used</span><b>${b.cement} bags</b></div>`:''}
      ${b.sand?`<div class="pd-line"><span>Sand used</span><b>${b.sand} load${b.sand==1?'':'s'}</b></div>`:''}
      ${acts.length?`<div>Activities: ${esc(acts.join(', '))}</div>`:''}
      <div>Machines: ${esc(YARD_MACH[b.machine]||'—')}</div>${b.note?`<div>Status: ${esc(b.note)}</div>`:''}</div>`;};
  const made=yBricks(r),cem=(r.bays||[]).reduce((t,b)=>t+(+b.cement||0),0);
  add('production','BRICKS PRODUCTION PER BAY',(r.bays||[]).length?(r.bays||[]).map(bayHtml).join('')+(made?`<div><b>Total bricks made: ${(r.bays||[]).filter(b=>b.produced).map(b=>`${esc(b.name)} (${Number(b.produced).toLocaleString('en-ZA')})`).join(' + ')} = ${made.toLocaleString('en-ZA')}${cem?` · Total cement: ${cem} bags`:''}</b></div>`:''):'');
  if((r.fuel||[]).length) add('fuel','DIESEL AND FUEL SPENT',yardRowsHtml(r.fuel,Y_FUEL)+`<div><b>Total: ${RZ(yFuel(r))}${(r.fuel||[]).some(f=>f.litres)?` · ${(r.fuel||[]).reduce((t,f)=>t+(+f.litres||0),0).toLocaleString('en-ZA')} litres`:''}</b></div>`);
  if((r.money||[]).length){const tot=k=>(r.money||[]).reduce((t,m)=>t+(+m[k]||0),0);
    add('money','MONEY HANDLED',yardRowsHtml(r.money,Y_MONEY)+(tot('amount')?`<div><b>Total handled: ${RZ(tot('amount'))}${tot('change')?` · Change returned: ${RZ(tot('change'))}`:''}</b></div>`:''));}
  if(r.shortages) add('shortages','SHORTAGES OF MATERIALS',`<div>${esc(r.shortages).replace(/\n/g,'<br>')}</div>`);
  add('absent','ABSENT STAFF AND LEAVE',(r.absent?.length?`<div>Absent: <b>${r.absent.length}</b> — ${esc(r.absent.join(', '))}</div>`:r.imported?'<div>Absent: not recorded in this report.</div>':'<div>Absent: none — all workers present.</div>')
    +(r.leave?.length?`<div>On leave: ${esc(r.leave.join(', '))}</div>`:''));
  if((r.complaints||[]).length) add('complaints','CUSTOMER COMPLAINTS',yardRowsHtml(r.complaints,Y_COMPL));
  if(r.type==='final'&&r.snap){
    if(r.snap.payments.length) add('payments','CLIENT PAYMENTS',r.snap.payments.map(p=>`<div style="margin-bottom:6px"><b>${esc(p.cust)}</b>
      <div class="pd-line"><span>Previous balance</span><b>${RZ(p.previous)}</b></div>${p.before?`<div class="pd-line"><span>Paid before</span><b>${RZ(p.before)}</b></div>`:''}
      <div class="pd-line"><span>Paid ${esc(fmtYmd(r.date))}</span><b>${RZ(p.today)}</b></div><div class="pd-line"><span>Total paid</span><b>${RZ(p.totalPaid)}</b></div>
      <div class="pd-line"><span>Remaining balance</span><b>${RZ(p.remaining)}</b></div></div>`).join(''));
    if(r.snap.deliveries.length){
      const tot=r.snap.deliveries.reduce((s,d)=>s+d.loads,0);
      add('deliveries','DELIVERY SUMMARY',`<ul>${r.snap.deliveries.map(d=>`<li>${esc(d.cust)} – ${d.loads} load${d.loads===1?'':'s'} (${esc(d.what)})</li>`).join('')}</ul><div><b>${r.snap.sandLoads===tot?`Total sand delivered: ${tot} load${tot===1?'':'s'}`:`Total delivered: ${tot} load${tot===1?'':'s'}${r.snap.sandLoads?` (sand: ${r.snap.sandLoads})`:''}`}</b></div>`);
    }
  }
  if(r.issues) add('problems','PROBLEMS',`<div>${esc(r.issues).replace(/\n/g,'<br>')}</div>`);
  if(r.notes) add('notes','NOTES',`<div>${esc(r.notes).replace(/\n/g,'<br>')}</div>`);
  return out;
}
const yardDayTitle=r=>longDate(r.date).replace(/^\w+, /,'').toUpperCase();
const yardLetter=(r,title,intro,body)=>`<div class="pd pd-rep">${a4Head(title,[['Date',fmtYmd(r.date)],['To',r.to||S.settings.bossName||'Mr Mufamadi'],['From',DOC_BY],['Ref',r.id]])}
    <div style="margin-top:12px">Dear Sir,<br>${esc(intro)} for ${esc(longDate(r.date))}:</div>
    ${body}
    <div style="margin-top:12px">Thank you.<br>Kind regards,<br><b>${esc(S.settings.compName)}</b></div>
    <div class="pd-foot"><div class="pd-kg"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio</div></div></div>`;
const yardSecName=t=>t.charAt(0)+t.slice(1).toLowerCase();
// the whole report: every part, numbered
function yardDocHtml(id){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return '';
  return yardLetter(r,`${(YARD_TYPES[r.type]||'Report').toUpperCase()} – ${yardDayTitle(r)}`,YARD_TYPES[r.type]||'Report',
    yardSections(r).map((x,i)=>`<h4>${i+1}. ${x.h}</h4>${x.html}`).join(''));
}
// one part of the report on its own (e.g. the Diesel Expense Report of 23 Oct)
function yardSecDocHtml(id,key){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return '';
  const x=yardSections(r).find(y=>y.key===key);if(!x) return '';
  return yardLetter(r,`${x.doc} – ${yardDayTitle(r)}`,yardSecName(x.doc),`<h4>${x.h}</h4>${x.html}`);
}
async function yardSecPdf(id,key){
  const h=yardSecDocHtml(id,key);if(!h) return;toast('Preparing the PDF…');
  try{savePdf(await htmlToPdf(h),`${id}-${key}`);}catch(e){toast('Could not make the PDF: '+e.message,true);}
}
// the WhatsApp lines that belong to one part
const YARD_MSG_KEY={'🧱':'production','🪨':'production','⚙️':'production','⛽':'fuel','💵':'money','📦':'shortages','👷':'absent','⚠️':'complaints','🚚':'deliveries','💰':'payments','❗':'problems'};
function sendYardSec(id,key){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return;
  const x=yardSections(r).find(y=>y.key===key);if(!x) return;
  const s=S.settings,lines=yardMsgLines(r).filter(l=>YARD_MSG_KEY[Object.keys(YARD_MSG_KEY).find(e=>l.startsWith(e))]===key);
  waSendPdf({boss:true,phone:s.ownerWa,label:'boss',docId:`${r.id}-${key}-${r.date}`,html:yardSecDocHtml(id,key),message:link=>
    `Good day ${r.to||s.bossName||'Mr Mufamadi'},\n\nPlease find the *${yardSecName(x.doc)}* for ${longDate(r.date)}.${lines.length?'\n\n'+lines.join('\n'):''}\n\n${waPdfLine(link,'report')}\n\nThank you.\nKind regards,\n*${s.compName}*`});
  r.sentAt=new Date().toISOString();saveState();renderYard();
}
function printYard(id){const h=yardDocHtml(id);if(h) printHTML(h,'a4');}
async function downloadYardPdf(id){
  const h=yardDocHtml(id);if(!h) return;toast('Preparing the PDF…');
  try{savePdf(await htmlToPdf(h),id);}catch(e){toast('Could not make the PDF: '+e.message,true);}
}
function yardMsgLines(r){
  const lines=[],made=yBricks(r);
  if(made) lines.push(`🧱 *Bricks made:* ${(r.bays||[]).filter(b=>b.produced).map(b=>`${b.name} ${Number(b.produced).toLocaleString('en-ZA')}`).join(' + ')} = *${made.toLocaleString('en-ZA')}*`);
  const c=(r.bays||[]).reduce((t,b)=>t+(b.cement||0),0);if(c) lines.push(`🪨 *Cement used:* ${c} bags`);
  const fuel=yFuel(r);if(fuel) lines.push(`⛽ *Diesel / fuel:* ${RZ(fuel)} (${(r.fuel||[]).map(f=>[f.driver,f.litres?f.litres+' L':'',f.invoice?'inv '+f.invoice:''].filter(Boolean).join(' ')).join('; ')})`);
  if((r.money||[]).length) lines.push(`💵 *Money handled:* ${r.money.map(m=>`${m.who||'?'} ${RZ(m.amount||0)} — ${m.spent||''}${m.change?` (change ${RZ(m.change)})`:''}`).join('; ')}`);
  if(r.shortages) lines.push(`📦 *Shortages:* ${r.shortages}`);
  if(r.absent?.length||!r.imported) lines.push(`👷 *Absent:* ${r.absent?.length?`${r.absent.length} (${r.absent.join(', ')})`:'none — all workers present'}${r.leave?.length?` · on leave: ${r.leave.join(', ')}`:''}`);
  if((r.complaints||[]).length) lines.push(`⚠️ *Complaints:* ${r.complaints.map(x=>`${x.name||'?'}${x.contact?' ('+x.contact+')':''}: ${x.complaint||''}${x.action?' → '+x.action:''}`).join('; ')}`);
  if(r.snap?.deliveries?.length) lines.push(`🚚 *Deliveries:* ${r.snap.deliveries.map(d=>`${d.cust} ${d.loads}`).join(', ')} (${r.snap.deliveries.reduce((t,d)=>t+d.loads,0)} loads)`);
  if(r.snap?.payments?.length) lines.push(`💰 *Payments:* ${r.snap.payments.map(p=>`${p.cust} ${RZ(p.today)} (balance ${RZ(p.remaining)})`).join('; ')}`);
  const m=(r.bays||[]).filter(b=>b.machine&&b.machine!=='working');if(m.length) lines.push(`⚙️ *Machines:* ${m.map(b=>`${b.name} — ${YARD_MACH[b.machine].toLowerCase()}`).join('; ')}`);
  if(r.issues) lines.push(`❗ *Problems:* ${r.issues}`);
  return lines;
}
function sendYard(id){
  const r=(S.yardReports||[]).find(x=>x.id===id);if(!r) return;
  const s=S.settings;
  waSendPdf({boss:true,phone:s.ownerWa,label:'boss',docId:r.id+'-'+r.date,html:yardDocHtml(r.id),message:link=>
    `Good day ${r.to||s.bossName||'Mr Mufamadi'},\n\nPlease find the *${YARD_TYPES[r.type]}* for ${longDate(r.date)}.\n\n${yardMsgLines(r).join('\n')}\n\n${waPdfLine(link,'report')}\n\nThank you.\nKind regards,\n*${s.compName}*`});
  r.sentAt=new Date().toISOString();saveState();renderYard();
}
// one summary of all the reports shown (e.g. This week), to print or send to the boss
function yardSummaryHtml(list,period){
  const days=[...new Set(list.map(r=>r.date))].sort();
  const tot=k=>list.reduce((s,r)=>s+(r.bays||[]).reduce((t,b)=>t+(+b[k]||0),0),0);
  const fin=list.filter(r=>r.type==='final');const finDays=new Set(fin.map(r=>r.date));
  // bricks counted from the final report of a day, or the latest report if the day has no final one
  const perDay=days.map(d=>{const rs=list.filter(r=>r.date===d);const f=rs.find(r=>r.type==='final')||rs.sort((a,b)=>(b.time||'').localeCompare(a.time||''))[0];
    return {d,rs,bricks:yBricks(f),cement:(f.bays||[]).reduce((t,b)=>t+(+b.cement||0),0),fuel:rs.reduce((t,r)=>t+yFuel(r),0),absent:[...new Set(rs.flatMap(r=>r.absent||[]))],compl:rs.reduce((t,r)=>t+(r.complaints||[]).length,0)};});
  const sum=k=>perDay.reduce((s,x)=>s+x[k],0);
  return `<div class="pd pd-rep">${a4Head('YARD REPORTS SUMMARY',[['Period',period],['To',S.settings.bossName||'Mr Mufamadi'],['Reports',String(list.length)],['From',DOC_BY]])}
    <table class="pd-tbl" style="margin-top:12px"><thead><tr><th>Day</th><th>Reports</th><th class="r">Bricks</th><th class="r">Cement</th><th class="r">Fuel</th><th>Absent</th><th class="r">Complaints</th></tr></thead><tbody>
    ${perDay.map(x=>`<tr><td>${esc(fmtYmd(x.d))}</td><td>${x.rs.map(r=>YARD_SHORT[r.type]).join(', ')}</td><td class="r">${x.bricks.toLocaleString('en-ZA')}</td><td class="r">${x.cement}</td><td class="r">${RZ(x.fuel)}</td><td>${esc(x.absent.join(', ')||'—')}</td><td class="r">${x.compl}</td></tr>`).join('')}
    <tr><td><b>Total</b></td><td></td><td class="r"><b>${sum('bricks').toLocaleString('en-ZA')}</b></td><td class="r"><b>${sum('cement')}</b></td><td class="r"><b>${RZ(sum('fuel'))}</b></td><td></td><td class="r"><b>${sum('compl')}</b></td></tr></tbody></table>
    ${list.some(r=>(r.complaints||[]).length)?`<h4>Customer complaints</h4>${yardRowsHtml(list.flatMap(r=>(r.complaints||[]).map(c=>({...c,name:`${c.name||''} (${fmtYmd(r.date)})`}))),Y_COMPL)}`:''}
    ${list.some(r=>r.shortages)?`<h4>Shortages reported</h4><ul>${list.filter(r=>r.shortages).map(r=>`<li>${esc(fmtYmd(r.date))}: ${esc(r.shortages)}</li>`).join('')}</ul>`:''}
    ${list.some(r=>r.issues)?`<h4>Problems reported</h4><ul>${list.filter(r=>r.issues).map(r=>`<li>${esc(fmtYmd(r.date))} (${YARD_SHORT[r.type]}): ${esc(r.issues)}</li>`).join('')}</ul>`:''}
    <div class="pd-foot"><div class="pd-kg"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio</div></div></div>`;
}
function yardWeekSummary(){
  if(yardRange==='all'&&!el('yFrom').value) setYardRange('week');
  const list=yardFiltered();if(!list.length){toast('No reports in this period',true);return;}
  const from=el('yFrom').value,to=el('yTo').value,period=from||to?`${from?fmtYmd(from):'start'} – ${to?fmtYmd(to):'today'}`:'All dates';
  const html=yardSummaryHtml(list,period),s=S.settings,id='YARD-SUMMARY-'+(from||'all')+'_'+(to||'');
  el('askTitle').textContent=`Summary — ${period}`;el('askOkBtn').textContent='Close';
  el('askBody').innerHTML=`<div class="yr-view">${html}</div><div class="yr-acts">
    <span class="al" style="color:var(--clay)" id="ySumWa"><i class=i-wa></i> Send to the boss</span>
    <span class="al" id="ySumPdf"><i class=i-download></i> PDF</span><span class="al" id="ySumPrint"><i class=i-printer></i> Print</span></div>`;
  el('ySumPrint').onclick=()=>printHTML(html,'a4');
  el('ySumPdf').onclick=async()=>{toast('Preparing the PDF…');try{savePdf(await htmlToPdf(html),id);}catch(e){toast('Could not make the PDF: '+e.message,true);}};
  el('ySumWa').onclick=()=>{const b=list.reduce((t,r)=>t+(r.type==='final'?yBricks(r):0),0);waSendPdf({boss:true,phone:s.ownerWa,label:'boss',docId:id,html,message:link=>
    `Good day ${s.bossName||'Mr Mufamadi'},\n\nPlease find the *yard reports summary* for ${period} (${list.length} report${list.length===1?'':'s'}).\n\n🧱 *Bricks made (final reports):* ${b.toLocaleString('en-ZA')}\n⛽ *Diesel / fuel:* ${RZ(list.reduce((t,r)=>t+yFuel(r),0))}\n⚠️ *Complaints:* ${list.reduce((t,r)=>t+(r.complaints||[]).length,0)}\n\n${waPdfLine(link,'summary')}\n\nKind regards,\n*${s.compName}*`});};
  askCb=()=>true;openMo('askMo');el('askMo').querySelector('.mo').classList.add('wide');
}

// ═══════════════════════════════════════
// WORKERS & PPE — work suit and boot sizes of the yard workers (opened from Yard Reports)
// ═══════════════════════════════════════
const ppeSort=()=>[...(S.workers||[])].sort((a,b)=>(+a.no||1e9)-(+b.no||1e9)||String(a.name).localeCompare(String(b.name)));
// "28×2 · 30×8": how many of each size, for ordering
const ppeCounts=k=>{const c={};(S.workers||[]).forEach(w=>{const v=String(w[k]??'').trim();if(v) c[v]=(c[v]||0)+1;});
  return Object.keys(c).sort((a,b)=>(parseFloat(a)||0)-(parseFloat(b)||0)||a.localeCompare(b)).map(v=>`${v}×${c[v]}`).join(' · ');};
function openPpe(){
  const ws=ppeSort(),admin=curUser?.role==='admin';
  el('askTitle').textContent='Workers & PPE — work suit and boot sizes';el('askOkBtn').textContent='Close';
  el('askBody').innerHTML=`<div class="yard-hint" style="margin-bottom:8px">${ws.length} worker${ws.length===1?'':'s'} listed${S.settings.ppeNote?` · ${esc(S.settings.ppeNote)}`:''}</div>
    ${ws.length?`<div class="tbl-w"><table><thead><tr><th>No.</th><th>Name</th><th>Work suit</th><th>Boots</th><th>Note</th><th></th></tr></thead><tbody>
    ${ws.map(w=>`<tr><td>${esc(w.no??'')}</td><td><b>${esc(w.name)}</b></td><td>${esc(w.suit??'')}</td><td>${esc(w.boots??'')}</td><td style="font-size:12px;color:var(--g)">${esc(w.note||'')}</td>
      <td><span class="al" onclick="editPpe(${w.id})">Edit</span>${admin?` <span class="al red" onclick="delPpe(${w.id})">Remove</span>`:''}</td></tr>`).join('')}</tbody></table></div>
    <div style="font-size:12.5px;margin-top:8px"><b>Work suits:</b> ${esc(ppeCounts('suit')||'—')}<br><b>Boots:</b> ${esc(ppeCounts('boots')||'—')}</div>`:'<div class="yard-empty">No workers yet. Add the first one.</div>'}
    <div class="yr-acts">
      <span class="al" style="color:var(--clay)" onclick="editPpe()">+ Add worker</span>
      ${ws.length?`<span class="al" onclick="sendPpe()"><i class=i-wa></i> Send to the boss</span><span class="al" onclick="ppePdf()"><i class=i-download></i> PDF</span><span class="al" onclick="printHTML(ppeDocHtml(),'a4')"><i class=i-printer></i> Print</span>`:''}
      <span class="al" onclick="editPpeNote()">Note on the list</span>
    </div>`;
  askCb=()=>true;openMo('askMo');el('askMo').querySelector('.mo').classList.add('wide');
}
function editPpe(id){
  const w=id?(S.workers||[]).find(x=>x.id===id):null;
  const next=Math.max(0,...(S.workers||[]).map(x=>+x.no||0))+1;
  askForm(w?'Edit worker':'Add worker',[
    {id:'name',label:'Name',value:w?w.name:''},
    {id:'no',label:'No. on the list',type:'number',value:w?w.no:next},
    {id:'suit',label:'Work suit size',value:w?w.suit:'',placeholder:'e.g. 32'},
    {id:'boots',label:'Boots size',value:w?w.boots:'',placeholder:'e.g. 9'},
    {id:'note',label:'Note (optional)',value:w?w.note||'':'',placeholder:'e.g. size not known yet'}],v=>{
      const name=(v.name||'').trim();if(!name){toast('Enter the name',true);return false;}
      const d={name,no:v.no===''?'':+v.no,suit:(v.suit||'').trim(),boots:(v.boots||'').trim(),note:(v.note||'').trim()};
      S.workers=S.workers||[];
      if(w) Object.assign(w,d);else S.workers.push({id:newNumId('nextWorkerId',S.workers),...d});
      logAudit(`PPE list: ${w?'updated':'added'} ${name}`,curUser?.name||'');saveState();setTimeout(openPpe,0);
    },w?'Save':'Add');
}
function delPpe(id){
  const w=(S.workers||[]).find(x=>x.id===id);if(!w) return;
  confirm('Remove worker',`Remove ${w.name} from the PPE list?`,()=>{S.workers=S.workers.filter(x=>x.id!==id);logAudit(`PPE list: removed ${w.name}`,curUser?.name||'');saveState();openPpe();});
}
function editPpeNote(){
  askForm('Note on the PPE list',[{id:'n',label:'Note (shows on the list and the PDF)',value:S.settings.ppeNote||'',placeholder:'e.g. Tiyani is not included: size not known yet'}],v=>{
    S.settings.ppeNote=(v.n||'').trim();saveState();setTimeout(openPpe,0);});
}
function ppeDocHtml(){
  const ws=ppeSort(),s=S.settings;
  return `<div class="pd pd-rep">${a4Head('PPE FOR WORKERS – WORK SUIT & BOOTS SIZES',[['Date',fmtD(new Date())],['To',s.bossName||'Mr Mufamadi'],['From',DOC_BY],['Workers',String(ws.length)]])}
    <table class="pd-tbl" style="margin-top:12px"><thead><tr><th>No.</th><th>Name</th><th class="r">Work suit size</th><th class="r">Boots size</th></tr></thead><tbody>
    ${ws.map(w=>`<tr><td>${esc(w.no??'')}</td><td>${esc(w.name)}${w.note?` <span style="color:#777">(${esc(w.note)})</span>`:''}</td><td class="r">${esc(w.suit??'')}</td><td class="r">${esc(w.boots??'')}</td></tr>`).join('')}</tbody></table>
    <div style="margin-top:10px"><b>TOTAL: ${ws.length} worker${ws.length===1?'':'s'} listed.</b>${s.ppeNote?`<br>Note: ${esc(s.ppeNote)}`:''}</div>
    <div style="margin-top:6px"><b>Work suits:</b> ${esc(ppeCounts('suit')||'—')}<br><b>Boots:</b> ${esc(ppeCounts('boots')||'—')}</div>
    <div class="pd-foot"><div class="pd-kg"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio</div></div></div>`;
}
async function ppePdf(){toast('Preparing the PDF…');try{savePdf(await htmlToPdf(ppeDocHtml()),'PPE-'+ymd(new Date()));}catch(e){toast('Could not make the PDF: '+e.message,true);}}
function sendPpe(){
  const s=S.settings,n=(S.workers||[]).length;
  waSendPdf({boss:true,phone:s.ownerWa,label:'boss',docId:'PPE-'+ymd(new Date()),html:ppeDocHtml(),message:link=>
    `Good day ${s.bossName||'Mr Mufamadi'},\n\nPlease find the *PPE list* (work suit and boot sizes) for ${n} worker${n===1?'':'s'}.\n\n👕 *Work suits:* ${ppeCounts('suit')||'—'}\n🥾 *Boots:* ${ppeCounts('boots')||'—'}${s.ppeNote?`\n📝 ${s.ppeNote}`:''}\n\n${waPdfLine(link,'list')}\n\nKind regards,\n*${s.compName}*`});
}

// ═══════════════════════════════════════
// BUILDER PRICING
// ═══════════════════════════════════════
function isBuilder(c){return !!(c&&c.priceLevel==='builder');}
function priceFor(p,c){return isBuilder(c)&&p.trade>0?p.trade:p.up;}
function repriceCart(){
  try{renderProds();}catch(e){}
  cart.forEach(i=>{const p=S.products.find(x=>x.id===i.id);if(!p) return;i.up=priceFor(p,selCust);i.tier=isBuilder(selCust)&&p.trade>0?'builder':'';});
  renderCart();
}
function quoteCustBuilder(){const n=(document.getElementById('qCust')?.value||'').trim().toLowerCase();return S.customers.find(c=>c.name.toLowerCase()===n&&isBuilder(c))||null;}

// ═══════════════════════════════════════
// DRIVER RUN SHEET
// ═══════════════════════════════════════
function printRunSheet(){
  const open=S.deliveries.filter(d=>d.status!=='delivered').sort((a,b)=>(a.reqDate||'9').localeCompare(b.reqDate||'9')||(a.id).localeCompare(b.id));
  if(!open.length){toast('No open deliveries to print',true);return;}
  const rows=open.map((d,k)=>{const items=d.items&&d.items.length?d.items.map(i=>`${esc(i.name)} × ${Number(i.qty).toLocaleString('en-ZA')} ${esc(unitLbl(i.unit))}`).join('<br>'):esc(d.load);
    const due=delDueState(d);
    return `<tr><td class="r">${k+1}</td><td><b>${esc(d.id)}</b>${d.loadCount>1?`<div class="pd-small">Load ${d.loadNo}/${d.loadCount}</div>`:''}</td><td><b>${esc(d.cust)}</b><div class="pd-small">${esc(d.phone||'')}</div></td><td>${esc(d.addr||'')}</td><td>${items}</td><td>${esc(d.reqDate||'')}${due==='overdue'?'<div class="pd-small" style="color:#B3261E">OVERDUE</div>':due==='today'?'<div class="pd-small">TODAY</div>':''}</td><td class="rs-box"></td><td class="rs-box"></td><td class="rs-sig"></td></tr>`;}).join('');
  printHTML(`<div class="pd">${a4Head('DRIVER RUN SHEET',[['Date',fmtD(new Date())],['Open loads',String(open.length)],['Driver',''],['Truck reg','']])}
  <table class="pd-tbl rs"><thead><tr><th>#</th><th>Delivery</th><th>Customer</th><th>Location / landmark</th><th>Load</th><th>Required</th><th>Loaded</th><th>Delivered</th><th>Customer signature</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="pd-note">Tick Loaded before leaving the yard and Delivered at each drop. Bring back every signed delivery note. Office: ${esc(S.settings.phone||'')}.</div>
  ${a4Foot('')}</div>`,'a4');
}

// ═══════════════════════════════════════
// REORDER FROM LOW STOCK
// ═══════════════════════════════════════
function suggestQty(p){const target=Math.max((p.ls||5)*4,(p.ls||5)+1);return Math.max(1,Math.ceil(target-p.stk));}
function reorderProduct(id){
  const p=S.products.find(x=>x.id===id);if(!p) return;
  if(curUser?.role!=='admin'){toast('Ask the manager to order stock',true);return;}
  openPurchase();
  document.getElementById('poProduct').value=p.name;onPoProductPick&&onPoProductPick();
  if(p.supplier) document.getElementById('poSupplier').value=p.supplier;
  document.getElementById('poQty').value=suggestQty(p);calcPo();
  toast(`Suggested ${suggestQty(p)} ${p.unit} — change if needed`);
}

// ═══════════════════════════════════════
// KEYBOARD SHORTCUTS (laptop till)
// ═══════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(document.getElementById('apinOv')?.classList.contains('on')){if(/^\d$/.test(e.key)){e.preventDefault();adminPinKey(e.key);}else if(e.key==='Backspace'){e.preventDefault();adminPinKey('✕');}else if(e.key==='Enter'){e.preventDefault();adminPinKey('↵');}else if(e.key==='Escape'){closeApin();}return;}
  const pos=document.getElementById('sc-pos')?.classList.contains('on');const modalOpen=!!document.querySelector('.ov.on');
  if(e.key==='Escape'&&modalOpen){const ov=[...document.querySelectorAll('.ov.on')].pop();if(ov&&!['apinOv','shiftOpenMo'].includes(ov.id)){ov.classList.remove('on');if(ov.id==='rcptMo'&&typeof saleDone!=='undefined'&&saleDone){saleDone=false;clearCartNow();}}return;}
  if(!pos||modalOpen||!document.getElementById('loginSc')?.classList.contains('gone')) return;
  const k=e.key;
  if(k==='F2'){e.preventDefault();const s=document.getElementById('pSrch');s?.focus();s?.select?.();}
  else if(k==='F4'){e.preventDefault();setPay('cash');}
  else if(k==='F6'){e.preventDefault();setPay('card');}
  else if(k==='F7'){e.preventDefault();setPay('eft');}
  else if(k==='F8'){e.preventDefault();openMatCalc('sale');}
  else if(k==='F9'){e.preventDefault();if(cart.length) processPayment();}
});
function prodSearchKey(e){if(e.key==='Enter'){const first=document.querySelector('#sc-pos .pgrid .pc:not(.oos)');first?.click();e.target.select();}}

// ═══════════════════════════════════════
// STATEMENT ON WHATSAPP
// ═══════════════════════════════════════
function stmtText(c){
  const a=custAgeing(c);const s=S.settings;
  const inv=a.invoices.slice(0,6).map(i=>`• ${i.id} (${i.date?String(i.date).slice(0,10):''}) — ${RZ(i.owed)}`).join('\n');
  const pays=(c.payments||[]).slice(0,3).map(p=>`• ${p.date} — ${RZ(p.amount)} (${p.method})`).join('\n');
  return `*${s.compName} — Account statement*\n${c.name} · ${fmtD(new Date())}\n\n*Balance owing: ${RZ(c.balance)}*${a.d30+a.d60+a.d90>0?`\nOverdue: ${RZ(a.d30+a.d60+a.d90)}`:''}\n\n${inv?`Open invoices:\n${inv}\n\n`:''}${pays?`Recent payments:\n${pays}\n\n`:''}${s.bank?`EFT: ${s.bank}\nReference: ${c.name}\n\n`:''}Thank you,\n${s.compName} · ${s.phone}`;
}
function waStatement(){
  const c=S.customers.find(x=>x.id===stmtCustId);if(!c) return;
  const sid='STATEMENT-'+String(c.name).replace(/[^A-Za-z0-9]+/g,'-').slice(0,30);
  waSendPdf({phone:c.phone,label:'statement',docId:sid,html:elDocHtml('stmtBody','ACCOUNT STATEMENT',[['Customer',c.name],['Date',new Date().toISOString().slice(0,10)],['Balance',RZ(c.balance)]],'Please use your name or the invoice number as the payment reference.'),message:link=>`Good day ${c.name},

Please find your *account statement* from *${S.settings.compName}*, dated ${longDate(new Date().toISOString().slice(0,10))}.

${stmtText(c)}

${waPdfLine(link,'statement')}`});
}

function catIco(c){return '';}
function fmtR(n){n=Number(n);if(!isFinite(n)) n=0;return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtK(v){v=Number(v)||0;const a=Math.abs(v);return a>=1e6?(v/1e6).toLocaleString('en-US',{maximumFractionDigits:2})+'m':a>=1e3?(v/1e3).toLocaleString('en-US',{maximumFractionDigits:1})+'k':v.toLocaleString('en-US',{maximumFractionDigits:0});}
function initials(n){return String(n||'?').replace(/[^A-Za-z ]/g,' ').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';}

function downloadProductCsvTemplate(){
  const headers=['name','category','unit','unit_price','cost_price','supplier','stock','low_stock_level','bulk_price','bulk_min_qty'];
  const rows=[
    ['River Sand','sand','load','420','260','Vhembe Quarries','30','5','380','5'],
    ['Maxi Brick','brick','each','4.20','2.60','Corobrik Limpopo','15000','1000','3.50','500'],
  ];
  downloadCsv(headers,rows,'product-import-template');
}

function parseCsvLine(line){
  const out=[];let cur='';let inQ=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(inQ){
      if(c==='"'){if(line[i+1]==='"'){cur+='"';i++;}else inQ=false;}
      else cur+=c;
    } else {
      if(c==='"') inQ=true;
      else if(c===','){out.push(cur);cur='';}
      else cur+=c;
    }
  }
  out.push(cur);
  return out.map(s=>s.trim());
}

function importProductsCsv(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=(e)=>{
    const text=e.target.result;
    const lines=text.split(/\r?\n/).filter(l=>l.trim().length);
    if(lines.length<2){toast('CSV file is empty or has no data rows',true);input.value='';return;}
    const headers=parseCsvLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z_]/g,''));
    const idx={};
    ['name','category','unit','unit_price','cost_price','supplier','stock','low_stock_level','bulk_price','bulk_min_qty'].forEach(k=>{idx[k]=headers.indexOf(k);});
    if(idx.name<0||idx.category<0||idx.unit<0||idx.unit_price<0){
      toast('CSV must include at least: name, category, unit, unit_price columns',true);input.value='';return;
    }
    const validCats=['sand','brick','block','cement','concrete','water','stone'];
    let added=0,updated=0,skipped=0;
    for(let i=1;i<lines.length;i++){
      const cols=parseCsvLine(lines[i]);
      const name=cols[idx.name]?.trim();
      const cat=cols[idx.category]?.trim().toLowerCase();
      const unit=cols[idx.unit]?.trim();
      const up=parseFloat(cols[idx.unit_price]);
      if(!name||!validCats.includes(cat)||!unit||isNaN(up)){skipped++;continue;}
      const cost=idx.cost_price>=0?parseFloat(cols[idx.cost_price]):NaN;
      const supplier=idx.supplier>=0?(cols[idx.supplier]||'').trim():'';
      const stk=idx.stock>=0?parseInt(cols[idx.stock]):0;
      const ls=idx.low_stock_level>=0?parseInt(cols[idx.low_stock_level]):5;
      const bp=idx.bulk_price>=0?parseFloat(cols[idx.bulk_price]):NaN;
      const bm=idx.bulk_min_qty>=0?parseInt(cols[idx.bulk_min_qty]):NaN;
      const data={name,cat,unit,up,cost:isNaN(cost)?null:cost,supplier,stk:isNaN(stk)?0:stk,ls:isNaN(ls)?5:ls,bp:isNaN(bp)?null:bp,bm:isNaN(bm)?null:bm,ico:catIco(cat)};
      const existing=S.products.find(p=>p.name.toLowerCase()===name.toLowerCase());
      if(existing){Object.assign(existing,data);updated++;}
      else{S.products.push({id:newNumId('nextProdId',S.products),...data});added++;}
      if(supplier&&!S.suppliers.find(s=>s.name===supplier)){S.suppliers.push({id:newNumId('nextSupplierId',S.suppliers),name:supplier,phone:'',email:'',addr:'',notes:''});}
    }
    saveState();renderInv();renderProds();
    toast(`Import complete — ${added} added, ${updated} updated${skipped?`, ${skipped} row(s) skipped (missing/invalid data)`:''}`);
    input.value='';
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════
let custTypeFilter='all';
let selectedCustIds=new Set();

function setCustTypeFilter(type,btn){
  custTypeFilter=type;
  document.querySelectorAll('#sc-customers .fb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderCusts();
}

function renderCusts(){
  const srch=document.getElementById('custSrch')?.value.toLowerCase()||'';
  const list=S.customers.filter(c=>
    (custTypeFilter==='all'||c.type===custTypeFilter)&&
    (c.name.toLowerCase().includes(srch)||
     (c.phone||'').toLowerCase().includes(srch)||
     (c.addr||'').toLowerCase().includes(srch))
  );
  const tbl=document.getElementById('custTbl');
  if(!list.length){tbl.innerHTML='<tr><td colspan="10" style="padding:20px;text-align:center;color:var(--gl)">No customers match your search</td></tr>';renderCustSel();return;}
  tbl.innerHTML=list.map(c=>{
    const pct=c.credit>0?c.balance/c.credit*100:0;
    const over=pct>80;
    const isAcct=c.type==='account';
    return `<tr>
      <td><input type="checkbox" class="custChk" data-id="${c.id}" ${selectedCustIds.has(c.id)?'checked':''} onchange="toggleCustSelect(${c.id},this)"></td>
      <td><strong>${c.name}</strong>${c.addr?`<div style="font-size:10px;color:var(--g)">${c.addr}</div>`:''}</td>
      <td>${c.phone||'—'}</td>
      <td>${isAcct?'<span class="pill p-ok">Account</span>':'<span class="pill p-low" style="background:var(--info-b);color:var(--info)">Contact</span>'}</td>
      <td>${isAcct?`R ${c.credit.toLocaleString()}`:'—'}</td>
      <td style="color:${over?'var(--err)':'var(--gd)'}"><strong>${isAcct?`R ${fmtR(c.balance)}`:'—'}</strong></td>
      <td>${c.purchaseCount||0}</td>
      <td style="font-size:12px;color:var(--g)">${c.lastPurchase||'—'}</td>
      <td>R ${fmtR(c.total||0)}</td>
      <td>
        ${isAcct?`<span class="al" onclick="openStmt(${c.id})">Statement</span><span class="al" onclick="openRecordPay(${c.id})">Pay</span>`:''}
        <span class="al" onclick="openEditCust(${c.id})">Edit</span>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('custSelectAll').checked=false;
  renderCustSel();
}

function toggleCustSelect(id,el){
  if(el.checked) selectedCustIds.add(id); else selectedCustIds.delete(id);
}

function toggleSelectAllCust(el){
  document.querySelectorAll('.custChk').forEach(cb=>{
    cb.checked=el.checked;
    const id=parseInt(cb.dataset.id);
    if(el.checked) selectedCustIds.add(id); else selectedCustIds.delete(id);
  });
}

// ═══════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════
function renderSuppliers(){
  const srch=document.getElementById('suppSrch')?.value.toLowerCase()||'';
  const list=S.suppliers.filter(s=>
    s.name.toLowerCase().includes(srch)||
    (s.phone||'').toLowerCase().includes(srch)||
    (s.email||'').toLowerCase().includes(srch)
  );
  const tbl=document.getElementById('suppTbl');
  if(!list.length){tbl.innerHTML='<tr><td colspan="8" style="padding:20px;text-align:center;color:var(--gl)">No suppliers match your search</td></tr>';return;}
  tbl.innerHTML=list.map(s=>{
    const products=S.products.filter(p=>p.supplier===s.name).map(p=>p.name);
    const purchased=S.purchases.filter(p=>p.supplier===s.name).reduce((sum,p)=>sum+p.total,0);
    return `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.phone||'—'}</td>
      <td style="font-size:12px;color:var(--g)">${s.email||'—'}</td>
      <td style="font-size:12px;color:var(--g)">${s.addr||'—'}</td>
      <td style="font-size:12px;color:var(--g)">${s.notes||'—'}</td>
      <td style="font-size:12px">${products.length?products.join(', '):'—'}</td>
      <td>R ${purchased.toLocaleString('en-ZA',{minimumFractionDigits:2})}</td>
      <td>
        <span class="al" onclick="openEditSupplier(${s.id})">Edit</span>
        <span class="al red" onclick="deleteSupplier(${s.id})">Delete</span>
      </td>
    </tr>`;
  }).join('');
}

function openSupplier(){
  editSupplierId=null;
  document.getElementById('suppMoTitle').textContent='Add Supplier';
  ['supName','supPhone','supAddr','supEmail','supNotes'].forEach(id=>document.getElementById(id).value='');
  openMo('suppMo');
}

function openEditSupplier(id){
  const s=S.suppliers.find(x=>x.id===id);if(!s) return;
  editSupplierId=id;
  document.getElementById('suppMoTitle').textContent='Edit Supplier';
  document.getElementById('supName').value=s.name;
  document.getElementById('supPhone').value=s.phone||'';
  document.getElementById('supAddr').value=s.addr||'';
  document.getElementById('supEmail').value=s.email||'';
  document.getElementById('supNotes').value=s.notes||'';
  openMo('suppMo');
}

function saveSupplier(){
  const name=document.getElementById('supName').value.trim();
  if(!name){toast('Supplier name required',true);return;}
  const data={name,phone:document.getElementById('supPhone').value,addr:document.getElementById('supAddr').value,email:document.getElementById('supEmail').value,notes:document.getElementById('supNotes').value};
  if(editSupplierId){
    const idx=S.suppliers.findIndex(x=>x.id===editSupplierId);
    const oldName=S.suppliers[idx].name;
    S.suppliers[idx]={...S.suppliers[idx],...data};
    // Keep product/purchase supplier references in sync if the name changed
    if(oldName!==name){
      S.products.forEach(p=>{if(p.supplier===oldName) p.supplier=name;});
      S.purchases.forEach(p=>{if(p.supplier===oldName) p.supplier=name;});
    }
  } else {
    S.suppliers.push({id:newNumId('nextSupplierId',S.suppliers),...data});
  }
  closeMo('suppMo');renderSuppliers();saveState();
  toast(editSupplierId?'Supplier updated':'Supplier added');
}

function deleteSupplier(id){
  const s=S.suppliers.find(x=>x.id===id);if(!s) return;
  const linkedProducts=S.products.filter(p=>p.supplier===s.name).length;
  confirm('Delete Supplier',`Delete "${s.name}"?${linkedProducts?` ${linkedProducts} product(s) currently list this supplier — their supplier field will be cleared, not the products themselves.`:''}`,()=>{
    S.products.forEach(p=>{if(p.supplier===s.name) p.supplier='';});
    S.suppliers=S.suppliers.filter(x=>x.id!==id);
    renderSuppliers();saveState();toast('Supplier deleted');
  });
}

function openCust(fromSale=false){editCustId=null;custFromSale=fromSale;document.getElementById('custMoTitle').textContent='Add Customer';['cName','cPhone','cAddr','cEmail','cNotes'].forEach(id=>document.getElementById(id).value='');document.getElementById('cCred').value=0;document.getElementById('cPrice').value='retail';openMo('custMo');}

function openEditCust(id){
  const c=S.customers.find(x=>x.id===id);if(!c) return;editCustId=id;custFromSale=false;
  document.getElementById('custMoTitle').textContent='Edit Customer';
  document.getElementById('cName').value=c.name;document.getElementById('cPhone').value=c.phone;
  document.getElementById('cAddr').value=c.addr;document.getElementById('cEmail').value=c.email||'';
  document.getElementById('cCred').value=c.credit;document.getElementById('cNotes').value=c.notes||'';document.getElementById('cPrice').value=c.priceLevel||'retail';
  openMo('custMo');
}

function saveCust(){
  const name=document.getElementById('cName').value.trim();if(!name){toast('Name required',true);return;}
  {const np=normPhone(document.getElementById('cPhone').value);
   if(np.length>=9){const dup=S.customers.find(c=>c.id!==editCustId&&normPhone(c.phone)===np);
     if(dup){toast(`This number is already saved for ${dup.name}`,true);return;}}}
  const data={name,phone:document.getElementById('cPhone').value,addr:document.getElementById('cAddr').value,email:document.getElementById('cEmail').value,credit:parseFloat(document.getElementById('cCred').value)||0,notes:document.getElementById('cNotes').value,priceLevel:document.getElementById('cPrice').value};
  let newId=editCustId;
  if(editCustId){const idx=S.customers.findIndex(x=>x.id===editCustId);S.customers[idx]={...S.customers[idx],...data};}
  else{
    newId=newNumId('nextCustId',S.customers);
    S.customers.push({id:newId,...data,type:'account',balance:0,total:0,purchaseCount:0,lastPurchase:'',since:new Date().toISOString().split('T')[0],payments:[],txHistory:[]});
  }
  closeMo('custMo');saveState();toast(editCustId?'Customer updated':'Customer added');
  if(custFromSale&&!editCustId){
    renderCustSel();
    document.getElementById('custSel').value=newId;
    onCustSelect();
    toast(`${name} added and selected for this sale`);
  } else {
    renderCusts();
  }
  custFromSale=false;
}

function normPhone(p){return (p||'').replace(/[^\d]/g,'');}
function resetWalkin(){['walkinPhone','walkinName'].forEach(i=>{const e=document.getElementById(i);if(e) e.value='';});const b=document.getElementById('walkinBox');if(b) b.style.display='block';const h=document.getElementById('walkinHint');if(h) h.style.display='none';}
function walkinPhoneLookup(){
  const v=normPhone(document.getElementById('walkinPhone').value);const h=document.getElementById('walkinHint');
  if(v.length<9){h.style.display='none';return;}
  const c=S.customers.find(x=>normPhone(x.phone)===v);
  if(c){
    h.style.display='block';h.style.color='var(--ok)';
    h.innerHTML=`✓ Already saved: <strong>${c.name}</strong> — <a href="#" onclick="event.preventDefault();pickWalkinMatch(${c.id})" style="color:var(--clay)">use this customer</a>`;
  } else {h.style.display='block';h.style.color='var(--g)';h.textContent='New number — add a name to save this customer.';}
}
function pickWalkinMatch(id){renderCustSel();document.getElementById('custSel').value=id;onCustSelect();toast('Customer selected');}

function captureWalkinContact(phone,amount,name,txId){
  const norm=normPhone(phone);
  if(norm.length<9||!name) return;
  const today=new Date().toISOString().split('T')[0];
  const existing=S.customers.find(c=>normPhone(c.phone)===norm);
  if(existing){
    existing.total=(existing.total||0)+amount;
    existing.purchaseCount=(existing.purchaseCount||0)+1;
    existing.lastPurchase=today;
    if(txId){existing.txHistory=existing.txHistory||[];existing.txHistory.unshift(txId);}
  } else {
    S.customers.push({
      id:newNumId('nextCustId',S.customers),name,phone,addr:'',email:'',
      credit:0,balance:0,total:amount,purchaseCount:1,lastPurchase:today,
      since:today,type:'contact',payments:[],txHistory:txId?[txId]:[]
    });
  }
}

function openStmt(id){
  stmtCustId=id;
  const c=S.customers.find(x=>x.id===id);if(!c) return;
  document.getElementById('stmtTitle').textContent=`${c.name} — Statement`;
  const txs=S.transactions.filter(t=>t.cust===c.name);
  const pays=c.payments||[];
  document.getElementById('stmtBody').innerHTML=`
<div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px">
  <div><strong>${c.name}</strong><br><span style="color:var(--g)">${c.phone} · ${c.addr}</span></div>
  <div style="text-align:right"><div style="font-size:11px;color:var(--g)">Credit Limit</div><div style="font-weight:700">R ${c.credit.toLocaleString()}</div></div>
</div>
<div style="font-size:11px;font-weight:600;color:var(--gd);margin-bottom:5px">TRANSACTIONS</div>
${txs.length?txs.map(t=>`<div class="stmt-row"><span>${t.id} — ${t.date.split(' ')[0]}</span><span style="font-weight:700;color:var(--clay-d)">+R ${t.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</span></div>`).join(''):'<div style="font-size:12px;color:var(--g);padding:8px 0">No transactions yet</div>'}
${pays.length?`<div style="font-size:11px;font-weight:600;color:var(--gd);margin:10px 0 5px">PAYMENTS RECEIVED</div>${pays.map(p=>`<div class="stmt-row"><span>${p.date} — ${p.method} ${p.ref?'('+p.ref+')':''}</span><span style="font-weight:700;color:var(--ok)">−R ${p.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</span></div>`).join('')}`:''}
<div class="rdv"></div>
<div style="display:flex;justify-content:space-between;align-items:center">
  <span style="font-size:13px;color:var(--gd)">Outstanding Balance</span>
  <span class="stmt-bal" style="color:${c.balance>c.credit*0.8?'var(--err)':'var(--clay-d)'}">R ${c.balance.toLocaleString('en-ZA',{minimumFractionDigits:2})}</span>
</div>`;
  openMo('stmtMo');
}

function openPayment(){closeMo('stmtMo');openRecordPay(stmtCustId);}

function openRecordPay(id){
  stmtCustId=id;
  const c=S.customers.find(x=>x.id===id);if(!c) return;
  document.getElementById('payName').value=c.name;
  document.getElementById('payBal').value=`R ${c.balance.toLocaleString('en-ZA',{minimumFractionDigits:2})}`;
  document.getElementById('payAmt').value='';document.getElementById('payRef').value='';payPreview();
  openMo('payMo');
}

// "paid a lot but still owes some": the balance left is shown before and after saving
function payPreview(){
  const c=S.customers.find(x=>x.id===stmtCustId),box=el('payLeft');if(!c||!box) return;
  const amt=parseFloat(el('payAmt').value)||0,left=Math.round((c.balance-amt)*100)/100;
  if(!amt){box.style.display='none';return;}
  box.style.display='';
  box.innerHTML=left<0?`<b style="color:var(--err)">R ${fmtR(-left)} more than the balance owed.</b> Enter up to ${RZ(c.balance)}.`
    :left===0?`<b style="color:var(--ok)">Paid in full</b> — nothing will be owing after this payment.`
    :`Still owing after this payment: <b>${RZ(left)}</b> <span style="color:var(--g)">(paid now ${RZ(amt)} of ${RZ(c.balance)})</span>`;
}
function payQuick(f){const c=S.customers.find(x=>x.id===stmtCustId);if(!c) return;el('payAmt').value=(Math.round(c.balance*f*100)/100).toFixed(2);payPreview();}
function payReceiptMsg(c,pay){
  const s=S.settings;
  return `Good day ${c.name},

Thank you for your payment to *${s.compName}*.

💰 *Amount received:* ${RZ(pay.amount)} (${({cash:'Cash',eft:'EFT',card:'Card'})[pay.method]||pay.method})
📅 *Date:* ${longDate(pay.ts,true)}${pay.ref?`
🔖 *Reference:* ${pay.ref}`:''}
${c.balance>0?`⏳ *Balance still owing:* ${RZ(c.balance)}`:'✅ *Your account is paid in full.*'}

${c.balance>0&&s.bank?`For EFT payments: ${s.bank}
Please use your name as the reference.

`:''}${waSign()}`;
}
function savePayment(sendReceipt){
  const c=S.customers.find(x=>x.id===stmtCustId);if(!c) return;
  const amt=parseFloat(document.getElementById('payAmt').value)||0;
  if(amt<=0){toast('Enter a valid payment amount',true);return;}
  if(amt>c.balance){toast(`Amount exceeds balance of R ${fmtR(c.balance)}`,true);return;}
  const pay={date:new Date().toLocaleDateString('en-ZA'),ts:new Date().toISOString(),by:curUser?.name||'',amount:amt,method:document.getElementById('payMethod').value,ref:document.getElementById('payRef').value};
  if(!c.payments) c.payments=[];
  c.payments.unshift(pay);c.balance=Math.max(0,c.balance-amt);
  closeMo('payMo');renderCusts();try{renderOwed();}catch(e){}saveState();
  toast(c.balance>0?`Payment of R ${fmtR(amt)} recorded — ${c.name} still owes R ${fmtR(c.balance)}`:`Payment of R ${fmtR(amt)} recorded — ${c.name} is paid in full`);
  if(sendReceipt) askPhoneAndSend(c.phone,()=>payReceiptMsg(c,pay),'customer');
}

// ═══════════════════════════════════════
// SEND ADVERT / MARKETING
// ═══════════════════════════════════════
function waLink(phone,msg){
  let n=normPhone(phone);
  if(n.startsWith('0')) n='27'+n.slice(1);
  else if(!n.startsWith('27')) n='27'+n;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}

function askPhoneAndSend(existingPhone,buildText,label){
  if(existingPhone&&normPhone(existingPhone).length>=9){window.open(waLink(existingPhone,buildText()),'_blank');return;}
  askForm('Send via WhatsApp',[{id:'phone',label:`No phone number on file for this ${label}. Enter one:`,type:'tel',placeholder:'e.g. 071 234 5678'}],v=>{
    if(normPhone(v.phone).length<9){toast('Enter a valid phone number',true);return false;}
    window.open(waLink(v.phone,buildText()),'_blank');
  },'Send');
}

// ═══════════════════════════════════════
// DOCUMENTS AS PDF ON WHATSAPP
// The document is drawn as an A4 PDF, saved in MFD's cloud under a random name and sent
// as a link inside a full WhatsApp message (a WhatsApp chat link can only carry text).
// The link opens on MFD's own web address. With no internet the PDF is saved on this
// device instead, to attach in WhatsApp by hand.
// ═══════════════════════════════════════
const DOC_BUCKET='mfd-docs';
const PDF_LIBS=['vendor/html2canvas.min.js','vendor/jspdf.umd.min.js'];
let _pdfLibs=null;
function loadPdfLibs(){
  if(_pdfLibs) return _pdfLibs;
  _pdfLibs=PDF_LIBS.reduce((p,src)=>p.then(()=>new Promise((res,rej)=>{
    if(document.querySelector(`script[data-lib="${src}"]`)) return res();
    const s=document.createElement('script');s.src=src;s.dataset.lib=src;s.onload=res;s.onerror=()=>rej(new Error('The PDF tools could not load'));document.head.appendChild(s);
  })),Promise.resolve()).catch(e=>{_pdfLibs=null;throw e;});
  return _pdfLibs;
}
// A4 at 96 dpi = 794 px wide; the padding matches the printed page margins
async function htmlToPdf(html){
  await loadPdfLibs();
  const box=document.createElement('div');
  box.style.cssText='position:fixed;left:-12000px;top:0;width:794px;padding:42px 45px;background:#fff;box-sizing:border-box;color:#141210';
  box.innerHTML=html;document.body.appendChild(box);
  try{
    if(document.fonts&&document.fonts.ready) await document.fonts.ready;
    await Promise.all([...box.querySelectorAll('img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;})));
    const canvas=await window.html2canvas(box,{scale:2,backgroundColor:'#ffffff',logging:false});
    const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
    const pxPerMm=canvas.width/210,pageH=Math.floor(297*pxPerMm);
    for(let y=0;y<canvas.height;y+=pageH){
      const h=Math.min(pageH,canvas.height-y);if(y>0&&h<6*pxPerMm) break;   // no near-empty last page
      const c=document.createElement('canvas');c.width=canvas.width;c.height=h;
      c.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
      if(y>0) pdf.addPage();
      pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,h/pxPerMm);
    }
    return pdf.output('blob');
  }finally{box.remove();}
}
// on-screen notes (statement, purchase order) become a PDF in the same way
const elDocHtml=(id,title,meta,note)=>{const e=el(id);return e?`<div class="pd">${a4Head(title,meta)}<div class="rcpt" style="font-family:var(--font-ui);font-size:13px;max-width:100%;margin-top:14px">${e.innerHTML}</div>${a4Bank()}${a4Foot(note||'')}</div>`:'';};
function savePdf(blob,docId){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${docId}.pdf`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);
}
async function cloudUploadPdf(blob,docId){
  if(!cloudReady()) throw new Error('not connected');
  const c=await cloudToken(cloudCfg());
  const rnd=[...crypto.getRandomValues(new Uint8Array(12))].map(b=>b.toString(36).padStart(2,'0')).join('');
  const name=`${String(docId).replace(/[^A-Za-z0-9-]/g,'')}-${rnd}.pdf`;
  let r;
  try{r=await fetch(`${cloudBase(c)}/storage/v1/object/${DOC_BUCKET}/${name}`,{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+c.access,'Content-Type':'application/pdf','x-upsert':'false'},body:blob});}
  catch(e){throw cloudNetErr(e);}
  if(!r.ok){const e=new Error(await cloudErrText(r));e.cloudHttp=r.status;throw e;}
  return `${location.origin}/doc/${name}`;
}
// "PDF" buttons: save the document on this device
async function downloadDocPdf(kind,id){
  const d=docFor(kind,id);if(!d){toast('Document not found',true);return;}
  toast('Preparing the PDF…');
  try{savePdf(await htmlToPdf(d.html),d.docId);}catch(e){toast('Could not make the PDF: '+e.message,true);}
}
// o: {phone, label, docId, html, message(link)}
function waSendPdf(o){
  const go=async ph=>{
    // a browser only allows a new window straight after the click, so it is opened now and
    // pointed at WhatsApp once the PDF is ready (the desktop app has no such limit)
    const pre=/Electron/i.test(navigator.userAgent)?null:window.open('about:blank','_blank');
    toast('Preparing the PDF…');
    let blob=null,link='';
    try{blob=await htmlToPdf(o.html);}catch(e){}
    if(blob){try{link=await cloudUploadPdf(blob,o.docId);}catch(e){}}
    if(blob&&!link) savePdf(blob,o.docId);
    const url=waLink(ph,o.message(link));
    if(pre&&!pre.closed) pre.location.href=url;else window.open(url,'_blank');
    if(!link) toast(blob?`No connection to the cloud: ${o.docId}.pdf was saved on this device — attach it in WhatsApp.`:'The PDF could not be made, so the message was sent without it.',true);
    else toast('WhatsApp opened with the message and PDF link');
    logAudit(`${o.docId} sent on WhatsApp${link?' (PDF)':''}`,curUser?.name||'');
  };
  // to the boss: always the boss's WhatsApp (Settings → Boss WhatsApp)
  if(o.boss){const n=o.phone||S.settings.ownerWa;if(normPhone(n).length>=9){go(n);return;}toast('Add the boss WhatsApp number in Settings',true);return;}
  // to a client or supplier: the number is shown first, filled in when it is known, and can be typed or changed
  const who=o.label==='supplier'?'Supplier':'Client';
  askForm('Send via WhatsApp',[
    {id:'phone',label:`${who} WhatsApp number`,type:'tel',value:o.phone||'',placeholder:'e.g. 071 234 5678'},
    {id:'html',type:'html',html:`<div class="yard-hint">${o.phone?'Check the number, or type another one.':'No number on file — type the '+who.toLowerCase()+'\'s WhatsApp number.'} WhatsApp opens with the message and the PDF.</div>`}],v=>{
    if(normPhone(v.phone).length<9){toast('Enter a valid WhatsApp number',true);return false;}
    go(v.phone);
  },'Send');
}

// ── message parts ──
function longDate(v,withTime){
  const d=txD(v);if(!d.getTime()) return String(v||'');
  const s=d.toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return withTime&&/\d{1,2}:\d{2}/.test(String(v))?`${s} at ${d.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})}`:s;
}
function waSign(){
  const s=S.settings;
  return `Kind regards,\n*${s.compName}*${s.slogan?` — ${s.slogan}`:''}${s.phone?`\n📞 ${s.phone}`:''}${s.whatsapp?` · WhatsApp ${s.whatsapp}`:''}${s.email?`\n✉️ ${s.email}`:''}`;
}
function waPdfLine(link,what){return link?`📄 *Your ${what} (PDF):*\n${link}`:`📄 Your ${what} is attached as a PDF.`;}
const itemList=rows=>rows.map(r=>`• ${r.name} × ${Number(r.qty).toLocaleString('en-ZA')} ${r.unit||''} — ${RZ(r.qty*r.up)}`).join('\n');

function docFor(kind,id){
  if(kind==='invoice'){const t=S.transactions.find(x=>x.id===(id||lastTxId));return t&&{docId:t.id,html:invoiceDocHtml(t.id)};}
  if(kind==='quote'){const q=S.quotes.find(x=>x.id===(id||activeQId));return q&&{docId:q.id,html:quoteDocHtml(q.id)};}
  if(kind==='delivery'){const d=S.deliveries.find(x=>x.id===(id||activeDelNoteId));return d&&{docId:d.id.replace(/\//g,'-'),html:deliveryDocHtml(d.id)};}
  return null;
}

function invoiceMsg(t,link){
  const s=S.settings,label=invLabel()==='TAX INVOICE'?'tax invoice':'invoice';
  const items=(t.cart||[]).map(i=>({name:i.name,qty:i.qty,unit:i.unit,up:gP(i)}));
  const method={cash:'Cash',card:'Card',eft:'EFT',account:'Account',split:'Cash + card'}[t.method]||t.method;
  const owed=t.method==='account'?(t.remainingOwed??t.amount):0;
  const pay=t.method==='account'
    ?`💳 *Deposit paid:* ${RZ(t.depositAmt||0)}\n⏳ *Balance on your account:* ${RZ(owed)}`
    :`✅ *Paid:* ${RZ(t.amount)} (${method})`;
  return `Good day${t.cust&&t.cust!=='Walk-in'?' '+t.cust:''},\n\nThank you for buying from *${s.compName}*. Here is your ${label} for your records.\n\n`+
    `🧾 *${label.charAt(0).toUpperCase()+label.slice(1)} no:* ${t.id}\n📅 *Date:* ${longDate(t.date,true)}\n${items.length?`🛒 *Items:*\n${itemList(items)}\n`:''}`+
    `${t.del>0?`🚚 *Transport:* ${RZ(t.del)}\n`:''}${t.discAmt>0?`🏷️ *Discount:* − ${RZ(t.discAmt)}\n`:''}💰 *Total:* ${RZ(t.amount)}\n${pay}\n\n`+
    `${waPdfLine(link,label)}\n\n`+
    `${owed>0&&s.bank?`For EFT payments: ${s.bank}\nPlease use *${t.id}* as the reference.\n\n`:''}`+
    `If you have any questions about this ${label}, simply reply to this message.\n\n${waSign()}`;
}
function quoteMsg(q,link){
  const s=S.settings;
  return `Good day ${q.cust},\n\nThank you for your enquiry. Please find your *quotation ${q.id}* from *${s.compName}*.\n\n`+
    `📅 *Date:* ${longDate(q.date)}\n⏳ *Valid until:* ${longDate(qValidUntil(q.date,q.validDays))}\n${q.reqDate?`📌 *Required by:* ${longDate(q.reqDate)}\n`:''}`+
    `🧱 *Items:*\n${itemList(q.lines)}\n${q.delivery?`🚚 *Transport:* ${RZ(q.delivery)}${q.delZoneName?` (${q.delZoneName})`:''}\n`:''}${q.discAmt>0?`🏷️ *Discount:* − ${RZ(q.discAmt)}\n`:''}💰 *Total:* ${RZ(q.amount)}\n\n`+
    `${waPdfLine(link,'quotation')}\n\n`+
    `To accept, simply reply *YES* to this message and we will book your order${q.reqDate?` for ${longDate(q.reqDate)}`:''}. We are happy to adjust quantities or arrange delivery.\n\n${waSign()}`;
}
function deliveryMsg(d,link){
  const s=S.settings,lp=d.loadCount>1?` (load ${d.loadNo} of ${d.loadCount})`:'';
  return `Good day ${d.cust},\n\nPlease find your *delivery note ${d.id}*${lp} from *${s.compName}*${d.inv?` for invoice ${d.inv}`:''}.\n\n`+
    `📦 *Goods:* ${d.load}\n📍 *Deliver to:* ${d.addr||'—'}\n📅 *Delivery date:* ${longDate(d.reqDate||d.date)}\n🚛 *Driver:* ${d.driver||'to be confirmed'}${d.truck?` · Truck ${d.truck}`:''}\n\n`+
    `${waPdfLine(link,'delivery note')}\n\n`+
    `Please check the goods when they arrive. Our driver will ask you to sign the delivery note to confirm that everything was received in good order. If you cannot be there in person, please reply with the name of the person who will receive and sign for the delivery.\n\n${waSign()}`;
}

function sendQuoteWhatsApp(){
  const q=S.quotes.find(x=>x.id===activeQId);
  if(!q){toast('Open a quote first',true);return;}
  waSendPdf({phone:q.contact,label:'quote',docId:q.id,html:quoteDocHtml(q.id),message:link=>quoteMsg(q,link)});
  if(q.status==='draft'){q.status='sent';q.sentAt=new Date().toISOString();saveState();try{renderQuotes();}catch(e){}}
}

function sendReceiptWhatsApp(){
  const t=S.transactions.find(x=>x.id===lastTxId);
  if(!t){toast('Open a receipt first',true);return;}
  const c=S.customers.find(x=>x.name===t.cust);
  waSendPdf({phone:t.phone||c?.phone,label:'sale',docId:t.id,html:invoiceDocHtml(t.id),message:link=>invoiceMsg(t,link)});
}

function sendDeliveryWhatsApp(){
  const d=S.deliveries.find(x=>x.id===activeDelNoteId);
  if(!d){toast('Open a delivery note first',true);return;}
  const c=S.customers.find(x=>x.name===d.cust);
  waSendPdf({phone:d.phone||c?.phone,label:'delivery',docId:d.id.replace(/\//g,'-'),html:deliveryDocHtml(d.id),message:link=>deliveryMsg(d,link)});
}

function sendPOWhatsApp(){
  const po=S.purchases.find(x=>x.id===activePOId);
  if(!po){toast('Open a purchase order first',true);return;}
  const sup=S.suppliers.find(s=>s.name===po.supplier),s=S.settings;
  waSendPdf({phone:sup?.phone,label:'supplier',docId:po.id,html:elDocHtml('poNoteBody','PURCHASE ORDER',[['Order no','#'+po.id],['Date',String(po.date||'').slice(0,10)],['Supplier',po.supplier]]),message:link=>
    `Good day ${po.supplier},\n\nPlease find *purchase order ${po.id}* from *${s.compName}*.\n\n📦 *Order:* ${po.product} × ${Number(po.qty).toLocaleString('en-ZA')} ${po.unit} @ ${RZ(po.costPerUnit)}\n💰 *Total:* ${RZ(po.total)}\n✅ *Paid:* ${RZ(po.paid)} · ⏳ *Due:* ${RZ(po.due)}\n${po.notes?`📝 ${po.notes}\n`:''}\n${waPdfLine(link,'purchase order')}\n\nPlease confirm the order and the delivery date by replying to this message.\n\n${waSign()}`});
}

function openAdvert(){
  const targets=selectedCustIds.size>0
    ? S.customers.filter(c=>selectedCustIds.has(c.id)&&c.phone)
    : S.customers.filter(c=>c.phone);
  document.getElementById('advertRecipientInfo').textContent=selectedCustIds.size>0
    ? `Sending to ${targets.length} selected customer(s) with a phone number.`
    : `No customers selected — showing all ${targets.length} customer(s) with a phone number. Select rows in the list to narrow this down.`;
  document.getElementById('advertMsg').value='';
  renderAdvertRecipients(targets);
  document.getElementById('advertNumbersOut').value=targets.map(c=>normPhone(c.phone)).join(', ');
  openMo('advertMo');
}

function renderAdvertRecipients(targets){
  const list=document.getElementById('advertRecipientList');
  if(!targets.length){list.innerHTML='<div style="font-size:12px;color:var(--g);padding:8px 0">No customers with phone numbers found.</div>';return;}
  list.innerHTML=targets.map(c=>`
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--sand);border-radius:6px;padding:7px 10px">
      <div><div style="font-size:12px;font-weight:600">${c.name}</div><div style="font-size:11px;color:var(--g)">${c.phone}</div></div>
      <button class="btn-s" style="font-size:11px;padding:4px 10px" onclick="sendAdvertTo('${c.phone.replace(/'/g,"")}')"><i class=i-wa></i> Send</button>
    </div>`).join('');
}

function sendAdvertTo(phone){
  const msg=document.getElementById('advertMsg').value.trim();
  if(!msg){toast('Write a message first',true);return;}
  window.open(waLink(phone,msg),'_blank');
}

function copyAdvertNumbers(){
  const el=document.getElementById('advertNumbersOut');
  el.select();
  try{document.execCommand('copy');toast('Numbers copied');}catch(e){toast('Could not copy — select and copy manually',true);}
}

// ═══════════════════════════════════════
// DELIVERY
// ═══════════════════════════════════════
const DCOLS=[
  {k:'pending',l:'<i class=i-clipboard></i> Pending',hint:'Ordered, not loaded yet'},
  {k:'ready',l:'<i class=i-check></i> Ready',hint:'Loaded, waiting for truck'},
  {k:'out',l:'<i class=i-truck></i> Out',hint:'On the way to customer'},
  {k:'delivered',l:'<i class=i-flag></i> Delivered',hint:'Signed slip back'}];
const DORDER=['pending','ready','out','delivered'];
function dTime(iso){if(!iso) return '';const d=new Date(iso);return d.toLocaleDateString('en-ZA',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});}
function delDueState(d){
  if(d.status==='delivered'||!d.reqDate) return '';
  const today=new Date().toISOString().split('T')[0];
  if(d.reqDate<today) return 'overdue';
  if(d.reqDate===today) return 'today';
  return '';
}
function delWaMsg(d){
  const c=S.settings.compName;
  const lp=d.loadCount>1?` (load ${d.loadNo} of ${d.loadCount})`:'';
  d={...d,id:d.id+lp};
  if(d.status==='out') return `Hi ${d.cust}, your order from ${c} (${d.load}) has left our yard and is on the way to ${d.addr||'you'}. Please be available to receive and sign. Call ${S.settings.phone} if needed. — ${c}`;
  if(d.status==='delivered') return `Hi ${d.cust}, thank you for buying from ${c}. Your order ${d.id} has been delivered. We appreciate your support! — ${c}`;
  if(d.status==='ready') return `Hi ${d.cust}, your order ${d.id} (${d.load}) is loaded and will be delivered soon. — ${c}`;
  return `Hi ${d.cust}, we have received your order ${d.id} (${d.load})${d.reqDate?' for '+d.reqDate:''}. We will let you know when it leaves the yard. — ${c}`;
}
function waDelivery(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  const c=S.customers.find(x=>x.name===d.cust);
  waSendPdf({phone:d.phone||c?.phone,label:'delivery',docId:d.id.replace(/\//g,'-'),html:deliveryDocHtml(d.id),message:link=>`${delWaMsg(d)}

${waPdfLine(link,'delivery note')}

${waSign()}`});
}
// every change to a delivery is kept on it: who, when, from → to and why
function logDel(d,from,to,note){
  d.log=d.log||[];d.log.unshift({ts:new Date().toISOString(),by:curUser?.name||'',from:from||'',to,note:note||''});
}
const DEL_LBL={pending:'Pending',ready:'Ready',out:'Out for delivery',delivered:'Delivered',rescheduled:'Not delivered — rescheduled',reopened:'Reopened'};
const NOT_DELIVERED_REASONS=['Customer not available','Wrong or unclear address','Customer refused the goods','Truck or driver problem','Weather or road conditions','Other'];
const delLoads=d=>{const m=/(\d+(?:\.\d+)?)\s*loads?\b/i.exec(d.load||'');return m?+m[1]:1;};
const delDay=d=>((d.times&&d.times.delivered)||'').slice(0,10);
let delHistQ={q:'',from:'',to:'',slip:'all'};

function renderKanban(){
  const today=new Date().toISOString().slice(0,10);
  const act=S.deliveries.filter(d=>d.status!=='delivered');
  const done=S.deliveries.filter(d=>d.status==='delivered');
  const cnt=k=>act.filter(d=>d.status===k).length;
  const k=el('delKpis');
  if(k) k.innerHTML=`<div class="yard-kpi"><span>Pending</span><b>${cnt('pending')}</b><small>ordered, not loaded</small></div>
    <div class="yard-kpi"><span>Out now</span><b>${cnt('out')}</b><small>on the way</small></div>
    <div class="yard-kpi"><span>Delivered today</span><b>${done.filter(d=>delDay(d)===today).length}</b><small>${done.filter(d=>delDay(d)===today).reduce((s,d)=>s+delLoads(d),0)} loads</small></div>
    <div class="yard-kpi ${act.some(d=>delDueState(d)==='overdue')?'bad':''}"><span>Overdue</span><b>${act.filter(d=>delDueState(d)==='overdue').length}</b><small>past the required date</small></div>
    <div class="yard-kpi ${done.some(d=>!d.slip)?'warn':''}"><span>Slips not back</span><b>${done.filter(d=>!d.slip).length}</b><small>delivered, not signed yet</small></div>`;
  const cols=DCOLS.filter(c=>c.k!=='delivered');
  el('kanban').innerHTML=cols.map((col,ci)=>{
    const cards=act.filter(d=>d.status===col.k).sort((a,b)=>(a.reqDate||'9').localeCompare(b.reqDate||'9'));
    const nxt=DORDER[DORDER.indexOf(col.k)+1],prv=DORDER[DORDER.indexOf(col.k)-1];
    return `<div class="kcol k-${col.k}">
      <div class="kch" title="${col.hint}">${col.l}<span class="pill p-ok" style="font-size:10px">${cards.length}</span></div>
      <div class="khint">${col.hint}</div>
      <div class="kbody">${cards.length?cards.map(d=>{
        const due=delDueState(d),t=d.times||{},resch=(d.failed||[]).length;
        return `
        <div class="kc ${due}">
          <div class="kc-top"><span class="kc-id">${esc(d.id)}${d.inv?` · ${esc(d.inv)}`:''}</span>${resch?`<span class="kc-tag">Attempt ${resch+1}</span>`:''}</div>
          <div class="kc-nm">${esc(d.cust)}</div>
          ${loadBadge(d)}
          <div class="kc-det">${esc(d.load)}</div>
          <div class="kc-det"><i class=i-pin></i> ${esc(d.addr||'—')}</div>
          ${d.phone?`<div class="kc-det"><a href="tel:${normPhone(d.phone)}" style="color:var(--clay);text-decoration:none"><i class=i-phone></i> ${esc(d.phone)}</a></div>`:''}
          ${d.reqDate?`<div class="kc-det kc-due ${due}"><i class=i-calendar></i> ${esc(d.reqDate)}${d.reqTime?' at '+esc(d.reqTime):''}${due==='overdue'?' · OVERDUE':due==='today'?' · TODAY':''}</div>`:''}
          ${resch?`<div class="kc-det kc-warn"><i class=i-alert></i> Not delivered ${dTime(d.failed[0].ts)}: ${esc(d.failed[0].reason)}</div>`:''}
          ${d.notes?`<div class="kc-det"><i class=i-note></i> ${esc(d.notes)}</div>`:''}
          <div class="kc-dt">${t.pending?'Ordered '+dTime(t.pending):'Ordered '+esc(d.date)}${t.ready?' · Ready '+dTime(t.ready):''}${t.out?' · Left '+dTime(t.out):''}</div>
          <div class="kc-acts">
            ${prv?`<button class="kmv ghost" onclick="moveDel('${d.id}','${prv}')" title="Move back">◀</button>`:''}
            ${nxt?`<button class="kmv grow" onclick="moveDel('${d.id}','${nxt}')">${nxt==='delivered'?'<i class=i-flag></i> Delivered':DCOLS.find(c=>c.k===nxt).l} ▶</button>`:''}
            ${col.k!=='pending'?`<button class="kmv warn" onclick="notDelivered('${d.id}')" title="Came back, not delivered">✗</button>`:''}
            <button class="kmv ghost" onclick="waDelivery('${d.id}')" title="WhatsApp the customer"><i class=i-wa></i></button>
            ${col.k==='pending'?`<button class="kmv ghost" onclick="openSplit('${d.id}')" title="Split into loads"><i class=i-scissors></i></button>`:''}
            <button class="kmv ghost" onclick="printDeliveryNote('${d.id}')" title="Delivery note"><i class=i-printer></i></button>
            <button class="kmv ghost" onclick="showDelLog('${d.id}')" title="History of this delivery"><i class=i-clock></i></button>
            ${col.k!=='delivered'?`<button class="kmv ghost" onclick="editDel('${d.id}')" title="Edit: phone, address, date, notes">✎</button>`:''}
          </div>
        </div>`;}).join(''):'<div class="kempty">No deliveries</div>'}</div>
    </div>`;
  }).join('');
  renderDelHistory();
}
function moveDel(id,status){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  // a delivered delivery is final: only the owner can reopen it, from the history
  if(d.status==='delivered'){toast('This delivery is delivered and locked. The owner can reopen it from Delivery history.',true);return;}
  if(status==='delivered'){
    askForm(`Delivered — ${d.id}`,[
      {id:'by',label:'Received and signed by (name)',placeholder:'e.g. Mr Solly'},
      {id:'slip',type:'checkbox',label:'The signed delivery note is back',value:false},
      {id:'note',label:'Note (optional)',placeholder:'e.g. offloaded at the back of the house'}],v=>{
        const from=d.status;d.status='delivered';d.times=d.times||{};d.times.delivered=new Date().toISOString();
        d.receivedBy=(v.by||'').trim();d.slip=!!v.slip;
        logDel(d,from,'delivered',[d.receivedBy?'Received by '+d.receivedBy:'',v.slip?'signed slip back':'slip not back yet',v.note].filter(Boolean).join(' · '));
        saveState();renderKanban();updateNavBadge&&updateNavBadge();toast(`${d.id} delivered and moved to the history`);
      },'Mark as delivered');
    return;
  }
  const back=DORDER.indexOf(status)<DORDER.indexOf(d.status),from=d.status;
  d.status=status;d.times=d.times||{};
  if(back){DORDER.slice(DORDER.indexOf(status)+1).forEach(k=>delete d.times[k]);}
  else d.times[status]=new Date().toISOString();
  logDel(d,from,status,back?'moved back':'');
  renderKanban();saveState();updateNavBadge&&updateNavBadge();
  toast(back?'Moved back':'Delivery updated');
  if(!back&&status==='out'&&d.phone) confirm('Send WhatsApp?',`Tell ${d.cust} the order has left the yard and is on the way?`,()=>waDelivery(id),false);
}
// the truck came back with the load: why, and when it goes again
function notDelivered(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  const tomorrow=new Date(Date.now()+864e5).toISOString().slice(0,10);
  askForm(`Not delivered — ${d.id}`,[
    {id:'reason',type:'select',label:'Why was it not delivered?',options:NOT_DELIVERED_REASONS,value:NOT_DELIVERED_REASONS[0]},
    {id:'note',label:'Details',placeholder:'e.g. nobody at home, phone off'},
    {id:'date',type:'date',label:'New delivery date',value:tomorrow},
    {id:'time',type:'time',label:'New delivery time (optional)',value:d.reqTime||''},
    ...(d.inv?[{id:'refund',type:'checkbox',label:`The customer wants a refund instead (invoice ${d.inv})`,value:false}]:[])],v=>{
      if(!v.refund&&!v.date){toast('Choose the new delivery date',true);return false;}
      const from=d.status;
      d.failed=d.failed||[];d.failed.unshift({ts:new Date().toISOString(),by:curUser?.name||'',reason:v.reason,note:(v.note||'').trim(),from});
      d.status='pending';d.times={pending:(d.times&&d.times.pending)||new Date().toISOString()};d.slip=false;
      if(v.date){d.reqDate=v.date;d.reqTime=v.time||'';}
      logDel(d,from,'rescheduled',`${v.reason}${v.note?' — '+v.note.trim():''}${v.date?` · new date ${v.date}${v.time?' '+v.time:''}`:''}`);
      saveState();renderKanban();updateNavBadge&&updateNavBadge();
      toast(v.date?`Rescheduled for ${v.date}${v.time?' at '+v.time:''}`:'Marked as not delivered');
      if(v.refund) setTimeout(()=>refundChooser(d.inv,d),200);
    },'Save');
}
// refund: the whole invoice, or only some of the items
function refundChooser(invId,del){
  const t=S.transactions.find(x=>x.id===invId);if(!t){toast(`Invoice ${invId} not found on this device`,true);return;}
  askForm(`Refund — ${t.id} · ${t.cust}`,[
    {id:'html',type:'html',html:`<div class="yard-auto">Invoice total <b>${RZ(t.amount)}</b> · paid by ${esc(t.method)}${t.returnedAmt?` · already refunded ${RZ(t.returnedAmt)}`:''}</div>`},
    {id:'how',type:'select',label:'What should be refunded?',options:[['full','Everything (full refund, stock goes back)'],['items','Only some items (choose them next)']],value:'full'}],v=>{
      setTimeout(()=>{
        if(v.how==='items') openItemReturn(t.id);
        else refundTxById(t.id,()=>{if(del){logDel(del,del.status,del.status,`Customer refunded (${t.id})`);del.refunded=t.id;saveState();renderKanban();}renderSales&&renderSales();});
      },150);
    },'Next');
}
// owner only: reopen a delivered delivery (kept in its history)
function reopenDel(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  if(curUser?.role!=='admin'){toast('Only the owner can reopen a delivered delivery',true);return;}
  reqAdmin('Admin PIN required to reopen a delivered delivery',()=>askForm(`Reopen — ${d.id}`,[
    {id:'to',type:'select',label:'Move it back to',options:[['out','Out for delivery'],['ready','Ready'],['pending','Pending']],value:'out'},
    {id:'why',label:'Reason (kept in the history)',placeholder:'e.g. marked delivered by mistake'}],v=>{
      if(!(v.why||'').trim()){toast('Give the reason',true);return false;}
      d.status=v.to;d.times=d.times||{};delete d.times.delivered;if(v.to!=='out') delete d.times.out;if(v.to==='pending') delete d.times.ready;
      d.slip=false;logDel(d,'delivered',v.to,'Reopened by the owner: '+v.why.trim());
      logAudit(`Delivery ${d.id} reopened (${v.why.trim()})`,curUser?.name||'');
      saveState();renderKanban();toast(`${d.id} moved back to ${DEL_LBL[v.to]}`);
    },'Reopen'));
}
function setSlip(id,v){const d=S.deliveries.find(x=>x.id===id);if(d){d.slip=v;logDel(d,d.status,d.status,v?'signed slip received':'slip marked as not back');saveState();renderKanban();}}
function showDelLog(id){
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  const rows=[...(d.log||[])];
  if(!rows.length){const t=d.times||{};DORDER.forEach(k=>{if(t[k]) rows.push({ts:t[k],to:k,by:'',note:''});});rows.reverse();}
  el('askTitle').textContent=`History — ${d.id} · ${d.cust}`;el('askOkBtn').textContent='Close';
  el('askBody').innerHTML=rows.length?`<div class="dlog">${rows.map(r=>`<div class="dlog-row"><b>${esc(DEL_LBL[r.to]||r.to)}</b><span>${dTime(r.ts)}</span>${r.note?`<div>${esc(r.note)}</div>`:''}</div>`).join('')}</div>`:'<div style="color:var(--g)">No changes recorded yet.</div>';
  askCb=()=>true;openMo('askMo');
}

// ── history: every delivered delivery, searchable and downloadable ──
function delHistRows(){
  const q=delHistQ.q.trim().toLowerCase();
  return S.deliveries.filter(d=>d.status==='delivered').filter(d=>{
    const day=delDay(d)||d.date;
    if(delHistQ.from&&day<delHistQ.from) return false;
    if(delHistQ.to&&day>delHistQ.to) return false;
    if(delHistQ.slip==='missing'&&d.slip) return false;
    if(delHistQ.slip==='resched'&&!(d.failed||[]).length) return false;
    return !q||[d.id,d.cust,d.load,d.addr,d.inv,d.driver,d.receivedBy].join(' ').toLowerCase().includes(q);
  }).sort((a,b)=>(delDay(b)||b.date).localeCompare(delDay(a)||a.date));
}
function setDelHist(k,v){delHistQ[k]=v;renderDelHistory();}
function renderDelHistory(){
  const host=el('delHist');if(!host) return;
  const rows=delHistRows(),loads=rows.reduce((s,d)=>s+delLoads(d),0);
  el('delHistSum').textContent=`${rows.length} deliver${rows.length===1?'y':'ies'} · ${loads} load${loads===1?'':'s'}`;
  if(!rows.length){host.innerHTML='<div class="yard-empty">No delivered deliveries match.</div>';return;}
  host.innerHTML=`<table class="dh-tbl"><thead><tr><th>Delivery</th><th>Customer</th><th>Goods</th><th>Delivered</th><th>Received by</th><th>Slip</th><th>Actions</th></tr></thead><tbody>${rows.map(d=>`<tr>
    <td><b>${esc(d.id)}</b>${d.inv?`<div class="ci-sub">${esc(d.inv)}</div>`:''}${(d.failed||[]).length?`<div class="ci-sub" style="color:var(--warn)">${d.failed.length+1} attempts</div>`:''}</td>
    <td>${esc(d.cust)}${d.addr?`<div class="ci-sub">${esc(d.addr)}</div>`:''}</td>
    <td>${esc(d.load)}</td>
    <td>${d.times?.delivered?dTime(d.times.delivered):esc(d.date)}${d.driver?`<div class="ci-sub">Driver: ${esc(d.driver)}</div>`:''}</td>
    <td>${esc(d.receivedBy||'—')}</td>
    <td>${d.slip?'<span class="pill p-ok">Signed</span>':`<span class="pill p-low" style="cursor:pointer" onclick="setSlip('${d.id}',true)" title="Mark the signed slip as received">Not back</span>`}</td>
    <td><span class="al" onclick="printDeliveryNote('${d.id}')"><i class=i-printer></i> Note</span><span class="al" onclick="showDelLog('${d.id}')"><i class=i-clock></i> History</span>${curUser?.role==='admin'?`<span class="al" onclick="reopenDel('${d.id}')">Reopen</span>`:''}</td>
  </tr>`).join('')}</tbody></table>`;
}
function delHistCsv(){
  const rows=delHistRows();if(!rows.length){toast('Nothing to download',true);return;}
  const c=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const lines=[['Delivery','Invoice','Customer','Phone','Address','Goods','Loads','Ordered','Delivered','Driver','Truck','Received by','Signed slip','Attempts','Not delivered reasons'].join(',')]
    .concat(rows.map(d=>[d.id,d.inv,d.cust,d.phone,d.addr,d.load,delLoads(d),d.date,d.times?.delivered?new Date(d.times.delivered).toLocaleString('en-ZA'):'',d.driver,d.truck,d.receivedBy,d.slip?'Yes':'No',(d.failed||[]).length+1,(d.failed||[]).map(f=>f.reason).join('; ')].map(c).join(',')));
  offerFile(`MFD-delivery-history-${new Date().toISOString().slice(0,10)}.csv`,'﻿'+lines.join('\r\n'),'text/csv');
}
async function delHistPdf(){
  const rows=delHistRows();if(!rows.length){toast('Nothing to download',true);return;}
  const period=delHistQ.from||delHistQ.to?`${delHistQ.from||'start'} to ${delHistQ.to||'today'}`:'All time';
  const html=`<div class="pd">${a4Head('DELIVERY HISTORY',[['Period',period],['Deliveries',String(rows.length)],['Loads',String(rows.reduce((s,d)=>s+delLoads(d),0))]])}
    <table class="pd-tbl" style="margin-top:12px"><thead><tr><th>Delivery</th><th>Customer</th><th>Goods</th><th>Delivered</th><th>Received by</th><th>Slip</th></tr></thead><tbody>
    ${rows.map(d=>`<tr><td>${esc(d.id)}</td><td>${esc(d.cust)}</td><td>${esc(d.load)}</td><td>${d.times?.delivered?dTime(d.times.delivered):esc(d.date)}</td><td>${esc(d.receivedBy||'')}</td><td>${d.slip?'Signed':'Not back'}</td></tr>`).join('')}</tbody></table>
    <div class="pd-foot"><div class="pd-kg"><img src="${KG_LOGO}" alt=""> MFD POS · software by KreativG Studio</div></div></div>`;
  toast('Preparing the PDF…');
  try{savePdf(await htmlToPdf(html),`MFD-delivery-history-${new Date().toISOString().slice(0,10)}`);}catch(e){toast('Could not make the PDF: '+e.message,true);}
}
function renderHomeDeliveries(){
  const el=document.getElementById('homeDeliveries');if(!el) return;
  const act=S.deliveries.filter(d=>d.status!=='delivered');
  const over=act.filter(d=>delDueState(d)==='overdue'),tod=act.filter(d=>delDueState(d)==='today');
  const noSlip=S.deliveries.filter(d=>d.status==='delivered'&&!d.slip);
  const cnt=k=>act.filter(d=>d.status===k).length;
  el.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:12px">
    <span class="pill" style="background:var(--sand)"><i class=i-clipboard></i> Pending ${cnt('pending')}</span>
    <span class="pill" style="background:var(--sand)"><i class=i-check></i> Ready ${cnt('ready')}</span>
    <span class="pill" style="background:var(--sand)"><i class=i-truck></i> Out ${cnt('out')}</span>
    ${noSlip.length?`<span class="pill p-warn"><i class=i-receipt></i> ${noSlip.length} slip(s) not back</span>`:''}
  </div>
  ${[...over.map(d=>[d,'OVERDUE','var(--err)']),...tod.map(d=>[d,'TODAY','var(--warn)'])].map(([d,l,c])=>`<div class="rr" style="font-size:12.5px;cursor:pointer" onclick="showSc('delivery')"><span><strong style="color:${c}">${l}</strong> · ${d.cust} — ${d.load.substring(0,40)}</span><span>${DCOLS.find(x=>x.k===d.status).l}</span></div>`).join('')||'<div style="font-size:12px;color:var(--gl)">No deliveries due today or overdue.</div>'}`;
}

function printDeliveryNote(id){
  activeDelNoteId=id;
  const d=S.deliveries.find(x=>x.id===id);if(!d) return;
  document.getElementById('delNoteBody').innerHTML=`
<div style="text-align:center;margin-bottom:12px">
  <strong style="font-size:16px">${S.settings.compName}</strong><br>
  ${S.settings.addr?`<span style="font-size:12px;color:var(--g)">${S.settings.addr}</span><br>`:''}
  ${S.settings.phone?`<span style="font-size:12px;color:var(--g)">Call: ${S.settings.phone}${S.settings.whatsapp?' · WhatsApp: '+S.settings.whatsapp:''}</span><br>`:''}
  <span style="font-size:12px;color:var(--g)">Please receive in good order and condition the goods below.</span><br>
  <strong style="font-size:14px;display:inline-block;margin-top:8px">DELIVERY NOTE</strong><br>
  <span style="font-size:12px;color:var(--g)">${d.id}${d.inv?' · Invoice: '+d.inv:''} · ${d.date}</span>
</div>
<div class="rdv"></div>
<div style="font-size:13px;line-height:1.8">
  <div><strong>Customer:</strong> ${d.cust}</div>
  ${d.phone?`<div><strong>Phone:</strong> ${d.phone}</div>`:''}
  <div><strong>Location / Landmark:</strong> ${d.addr}</div>
</div>
<div class="rdv"></div>
<div style="font-size:13px;line-height:1.8">
  <div><strong>Load / Products:</strong>${d.loadCount>1?` <span style="color:var(--clay)">— Load ${d.loadNo} of ${d.loadCount}</span>`:''}</div>
  ${d.items&&d.items.length?`<div style="padding:6px 0">${d.items.map(i=>`<div class="rr"><span>${i.name}</span><span>${Number(i.qty).toLocaleString()} ${unitLbl(i.unit)}</span></div>`).join('')}</div>`:`<div style="padding:8px 0">${d.load}</div>`}
</div>
<div class="rdv"></div>
<div style="font-size:13px;line-height:1.8">
  <div><strong>Date Required:</strong> ${d.reqDate||'—'}</div>
  ${d.notes?`<div><strong>Notes:</strong> ${d.notes}</div>`:''}
  <div><strong>Delivered on:</strong> ____ / ____ / ________ &nbsp; <strong>Time:</strong> ____ : ____</div>
</div>
<div class="rdv"></div>
<div style="margin-top:30px;display:flex;justify-content:space-between;gap:20px;font-size:12px">
  <div style="flex:1">
    <div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Driver Signature</div>
  </div>
  <div style="flex:1">
    <div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Customer Signature — Goods Received</div>
  </div>
</div>
<div class="rdv"></div>
<div style="text-align:center;font-size:11px;color:var(--g)">Please check items on delivery. Any shortages or damage must be noted above before signing.</div>`;
  openMo('delNoteMo');
}

let editDelId=null;
function openDel(){editDelId=null;el('delMoTitle').textContent='New Delivery';el('delSaveBtn').textContent='Save Delivery';['dCust','dPhone','dLoad','dAddr','dNotes'].forEach(id=>document.getElementById(id).value='');document.getElementById('dDate').value=new Date().toISOString().split('T')[0];openMo('delMo');}
// fill in what a delivery still needs (phone, address / landmark, date, notes) or correct it
function editDel(id){
  const d=(S.deliveries||[]).find(x=>x.id===id);if(!d) return;
  editDelId=id;el('delMoTitle').textContent=`Edit delivery ${d.id}`;el('delSaveBtn').textContent='Save changes';
  el('dCust').value=d.cust||'';el('dPhone').value=d.phone||'';el('dLoad').value=d.load||'';el('dAddr').value=d.addr||'';el('dDate').value=d.reqDate||'';el('dNotes').value=d.notes||'';
  openMo('delMo');
}

function saveDel(){
  const cust=document.getElementById('dCust').value.trim();
  const load=document.getElementById('dLoad').value.trim();
  if(!cust){toast('Customer required',true);return;}
  if(!load){toast('Load description required',true);return;}
  if(editDelId){
    const d=(S.deliveries||[]).find(x=>x.id===editDelId);if(!d){closeMo('delMo');return;}
    const n={cust,phone:el('dPhone').value.trim(),addr:el('dAddr').value.trim(),reqDate:el('dDate').value,notes:el('dNotes').value.trim()};
    // a load typed differently replaces the item list it was made from, so the note shows what was typed
    if(load!==(d.load||'')){n.load=load;delete d.items;}
    const changed=Object.keys(n).filter(k=>String(d[k]??'')!==String(n[k]??''));
    Object.assign(d,n);
    if(changed.length) logAudit(`Delivery ${d.id} edited (${changed.join(', ')})`,curUser?.name||'');
    closeMo('delMo');renderKanban();saveState();toast(changed.length?'Delivery updated':'No changes');editDelId=null;return;
  }
  const nowIso=new Date().toISOString();
  S.deliveries.unshift({id:newDocId('DEL','nextDelId',S.deliveries),cust,phone:document.getElementById('dPhone').value.trim(),load,addr:document.getElementById('dAddr').value,driver:'',truck:'',date:nowIso.split('T')[0],reqDate:document.getElementById('dDate').value,depart:'',ret:'',status:'pending',times:{pending:nowIso},slip:false,notes:document.getElementById('dNotes').value.trim(),inv:''});
  closeMo('delMo');renderKanban();saveState();toast('Delivery added as Pending');
}

// ═══════════════════════════════════════
// CASH-UP
// ═══════════════════════════════════════
const DENOMS=[{v:200,l:'R200 notes'},{v:100,l:'R100 notes'},{v:50,l:'R50 notes'},{v:20,l:'R20 notes'},{v:10,l:'R10 notes / coins'},{v:5,l:'R5 coins'},{v:2,l:'R2 coins'},{v:1,l:'R1 coins'},{v:0.5,l:'50c coins'}];
const PAYOUT_CATS=['Diesel / fuel','Supplier (paid on delivery)','Casual labour','Food / refreshments','Other'];
const PAYIN_CATS=['Change added to till','Other'];
let cuRevealed=false;

function curShift(){return S.shift&&S.shift.open?S.shift:null;}
function inShift(iso,start){if(!iso) return false;const d=txD(iso);return d>=start;}

function openShiftPrompt(after){
  const last=(S.cashupHistory||[])[0];
  document.getElementById('shFloat').value=last&&last.floatLeft!=null?last.floatLeft:'';
  document.getElementById('shOpenInfo').textContent=last&&last.floatLeft!=null?`Float left at last cash-up: R ${fmtR(Number(last.floatLeft))}. Count the till and confirm.`:'Count the change in the till before the first sale.';
  window._afterShiftOpen=after||null;
  openMo('shiftOpenMo');
  setTimeout(()=>document.getElementById('shFloat').focus(),50);
}
function confirmOpenShift(){
  const f=parseFloat(document.getElementById('shFloat').value);
  if(isNaN(f)||f<0){toast('Enter the float amount (R0 if the till is empty)',true);return;}
  const now=new Date().toISOString();
  S.shift={open:true,start:now,float:f,openedBy:curUser?.name||'',movements:[]};
  S.shiftStartTime=now;cuRevealed=false;
  logAudit(`Shift opened with float R ${fmtR(f)}`,curUser?.name||'');
  saveState();closeMo('shiftOpenMo');toast(`Shift opened · Float R ${fmtR(f)}`);
  const cb=window._afterShiftOpen;window._afterShiftOpen=null;
  if(document.getElementById('sc-cashup').classList.contains('on')) renderCashup();
  if(cb) cb();
}
function requireShift(cb){if(curShift()) {cb&&cb();return true;}openShiftPrompt(cb);return false;}

function computeShiftStats(){
  const sh=curShift();
  const start=new Date(Math.floor(new Date(sh?sh.start:(S.shiftStartTime||Date.now())).getTime()/1000)*1000);
  const r={start,float:sh?sh.float:0,txCount:0,cashSales:0,card:0,eft:0,accountOwed:0,
    acctCash:0,acctCard:0,acctEft:0,acctPays:[],payIn:0,payOut:0,moves:(sh&&sh.movements)||[],cashRefunds:0,refunds:[]};
  const txs=S.transactions.filter(t=>txD(t.date)>=start);
  r.txCount=txs.length;
  txs.forEach(t=>{
    if(t.method==='cash') r.cashSales+=t.amount;
    else if(t.method==='card') r.card+=t.amount;
    else if(t.method==='eft') r.eft+=t.amount;
    else if(t.method==='split'){r.cashSales+=t.splitCash||0;r.card+=t.splitCard||0;}
    else if(t.method==='account'){
      const dp=t.depositAmt||0;
      if(dp>0){if(t.depositMethod==='card') r.card+=dp;else if(t.depositMethod==='eft') r.eft+=dp;else r.cashSales+=dp;}
      r.accountOwed+=(t.remainingOwed!==undefined?t.remainingOwed:0);
    }
  });
  S.customers.forEach(c=>(c.payments||[]).forEach(p=>{
    if(!p.ts||new Date(p.ts)<start) return;
    if(p.method==='card') r.acctCard+=p.amount;else if(p.method==='eft') r.acctEft+=p.amount;else r.acctCash+=p.amount;
    r.acctPays.push({cust:c.name,...p});
  }));
  (S.sellReturns||[]).forEach(rt=>{
    if(txD(rt.date)<start) return;
    // Only refunds of sales from an earlier shift take cash out of this shift's total
    if(!rt.partial&&rt.origDate&&txD(rt.origDate)>=start) return;
    if(rt.partial&&rt.method==='card'){r.cardRefunds=(r.cardRefunds||0)+rt.amount;return;}
    if(rt.partial&&rt.method==='eft'){r.eftRefunds=(r.eftRefunds||0)+rt.amount;return;}
    let cashOut=0;
    if(rt.method==='cash') cashOut=rt.amount;
    else if(rt.method==='split') cashOut=rt.splitCash||0;
    else if(rt.method==='account'&&rt.depositMethod==='cash') cashOut=rt.depositAmt||0;
    if(cashOut>0){r.cashRefunds+=cashOut;r.refunds.push({...rt,cashOut});}
  });
  r.moves.forEach(m=>{if(m.type==='in') r.payIn+=m.amt;else r.payOut+=m.amt;});
  r.expCash=r.float+r.cashSales+r.acctCash+r.payIn-r.payOut-r.cashRefunds;
  r.expCard=r.card+r.acctCard-(r.cardRefunds||0);
  r.expEft=r.eft+r.acctEft-(r.eftRefunds||0);
  r.cash=r.expCash;r.cardEft=r.expCard+r.expEft;
  return r;
}
const R=v=>'R '+(Number(v)||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});

function readCounts(){return DENOMS.map((d,i)=>parseInt(document.getElementById('den-'+i)?.value||0)||0);}
function countedTotal(counts){return DENOMS.reduce((s,d,i)=>s+(counts[i]*d.v),0);}
function restoreCounts(){const c=window._cuCounts||[];DENOMS.forEach((d,i)=>{const e=document.getElementById('den-'+i);if(e) e.value=c[i]||'';});document.getElementById('cuCardSlip').value=window._cuSlip??'';calcDenoms();}
function revealCashup(){
  const counts=readCounts();const slipRaw=document.getElementById('cuCardSlip').value;
  const st=computeShiftStats();
  if(countedTotal(counts)===0&&st.expCash>0){toast('Count the cash first',true);return;}
  if(st.expCard>0&&slipRaw===''){toast('Enter the card machine slip total',true);return;}
  window._cuCounts=counts;window._cuSlip=slipRaw;window._cuFloat=parseFloat(document.getElementById('cuFloatLeft')?.value)||0;cuRevealed=true;renderCashup();
}
function recount(){reqAdmin('Admin PIN required to recount',()=>{cuRevealed=false;renderCashup();restoreCounts();});}
function vLine(label,exp,got){
  const d=got-exp;const ok=Math.abs(d)<0.01;
  return `<div class="cu-row"><span class="lbl">${label}</span><span class="val">Expected ${R(exp)} · Counted ${R(got)}</span></div>
  <div class="variance ${ok?'v-ok':d<0?'v-sh':'v-ov'}" style="margin-bottom:8px">${ok?'✓ Balanced':d<0?'SHORT by '+R(-d):'OVER by '+R(d)}</div>`;
}
function cuHeader(sh){
  const h=document.getElementById('cuHdr');if(!h) return;
  h.innerHTML=`<div><h2 class="cu-title">Daily Cash-Up</h2><div class="cu-sub">${sh?`Shift opened ${dTime(sh.start)} by ${esc(sh.openedBy||'')}`:'No shift open'}</div></div>
  <div class="cu-actions">${sh?`<button class="btn-s cu-ab" onclick="openMove('in')">⊕ Pay-in</button><button class="btn-s cu-ab" onclick="openMove('out')">⊖ Pay-out</button><button class="btn-s cu-ab" onclick="cashupRefund()">↩ Refund</button>`:''}<button class="btn-s cu-ab" onclick="openCashupHistory()">Past shifts</button></div>`;
}
// refund from the cash-up screen: find the sale, then the usual refund (cash refunds lower the expected cash)
function cashupRefund(){
  const recent=S.transactions.slice(0,40).map(t=>[t.id,`${t.id} · ${t.cust||'Walk-in'} · ${RZ(t.amount)} · ${String(t.date).slice(0,16)}`]);
  if(!recent.length){toast('No sales to refund yet',true);return;}
  askForm('Refund a sale',[
    {id:'inv',type:'select',label:'Which sale?',options:recent,value:recent[0][0]},
    {id:'other',label:'…or type the invoice number',placeholder:'e.g. INV-045'}],v=>{
      const id=(v.other||'').trim().toUpperCase()||v.inv;
      if(!S.transactions.find(t=>t.id===id)){toast(`Invoice ${id} not found`,true);return false;}
      setTimeout(()=>refundChooser(id),150);
    },'Next');
}
function cuCounted(){return cuRevealed?countedTotal(window._cuCounts||[]):countedTotal(readCounts());}
function renderCashup(){
  const body=document.getElementById('cuBody');
  const sh=curShift();cuHeader(sh);
  if(!sh){
    body.innerHTML=`<div class="cu-card cu-open"><h3>Open the till</h3><p>Enter the opening cash float to start the shift.</p>
      <button class="btn" onclick="openShiftPrompt()" style="width:100%;padding:13px">Start shift</button></div>`;
    return;
  }
  const st=computeShiftStats();
  const start=st.start;const salesTot=S.transactions.filter(t=>txD(t.date)>=start).reduce((s,t)=>s+t.amount,0);
  const counted=cuCounted();const slip=parseFloat(window._cuSlip)||0;
  const dCash=counted-st.expCash,dCard=slip-st.expCard;const needReason=cuRevealed&&(Math.abs(dCash)>=0.01||Math.abs(dCard)>=0.01);
  if(window._cuFloat===undefined||window._cuFloat===null) window._cuFloat=sh.float||0;
  const vtxt=d=>Math.abs(d)<0.01?'<span class="cu-ok">✓ Balanced</span>':d<0?`<span class="cu-bad">Short by ${R(-d)}</span>`:`<span class="cu-warn">Over by ${R(d)}</span>`;
  const moves=st.moves.map(m=>`<div class="cu-line"><span>${m.type==='in'?'Pay-in':'Pay-out'} · ${esc((m.cat||'').toUpperCase())} <small>${esc(m.reason||'')} (${esc(m.by||'')})</small></span><b>${m.type==='in'?'+ ':'− '}${R(m.amt)}</b></div>`).join('');
  body.innerHTML=`
  <div class="cu-kpis">
    <div class="cu-kpi"><span>Sales this shift</span><b>${R(salesTot)}</b></div>
    <div class="cu-kpi"><span>Opening float</span><b>${R(sh.float)}</b></div>
    <div class="cu-kpi"><span>Pay-ins / outs</span><b>${R(st.payIn)} / ${R(st.payOut)}</b></div>
    <div class="cu-kpi"><span>EFT / Account</span><b>${R(st.expEft)} / ${R(st.accountOwed)}</b></div>
  </div>
  <div class="cu-grid">
    <div class="cu-card">
      <h3>1 · Blind cash count</h3><p>Count the drawer before seeing what the system expects.</p>
      <div class="denom-grid">${DENOMS.map((d,i)=>`<label class="denom-row"><b>${d.v>=1?'R'+d.v:Math.round(d.v*100)+'c'}</b><input type="number" inputmode="numeric" id="den-${i}" min="0" placeholder="" oninput="calcDenoms()" ${cuRevealed?'disabled':''}></label>`).join('')}</div>
      <div class="cu-counted"><span>Counted</span><b id="countedAmt">${R(counted)}</b></div>
      ${cuRevealed?`<div class="cu-exp">
          <div class="cu-line"><span>Expected cash</span><b>${R(st.expCash)}</b></div>
          <div class="cu-line"><span>Result</span><b>${vtxt(dCash)}</b></div>
          <div class="cu-note">Float ${R(st.float)} + cash sales ${R(st.cashSales)} + account payments ${R(st.acctCash)} + pay-ins ${R(st.payIn)} − pay-outs ${R(st.payOut)} − cash refunds ${R(st.cashRefunds)}</div>
        </div><button class="cu-link" onclick="recount()"><i class=i-refresh></i> Recount (admin PIN)</button>`
      :`<button class="cu-done" onclick="revealCashup()">Done counting — show expected</button>`}
    </div>
    <div class="cu-card">
      <h3>2 · Card, float &amp; close</h3>
      <div class="fg"><label>FNB card machine slip total</label><input type="number" step="0.01" min="0" id="cuCardSlip" value="${window._cuSlip??''}" ${cuRevealed?'disabled':''} oninput="window._cuSlip=this.value"></div>
      ${cuRevealed?`<div class="cu-hint">Card total ${R(st.expCard)} · ${vtxt(dCard)}</div>`:''}
      <div class="fg"><label>Float left in drawer</label><input type="number" step="0.01" min="0" id="cuFloatLeft" value="${window._cuFloat}" oninput="window._cuFloat=parseFloat(this.value)||0;calcBank()"></div>
      <div class="cu-hint mono">To bank: <span id="cuBank">${R(Math.max(0,counted-(window._cuFloat||0)))}</span></div>
      ${needReason?`<div class="fg"><label>Shortage reason (admin approval needed)</label><textarea id="cuReason" rows="3"></textarea></div>`:''}
      ${cuRevealed?`<div class="fg"><label>Notes</label><input type="text" id="cuNotes" placeholder="Anything the owner should know"></div>`:''}
      <button class="btn cu-submit" onclick="submitCashup()" ${cuRevealed?'':'disabled'}>${needReason?'Submit cash-up (admin approval) & close shift':'Submit cash-up & close shift'}</button>
      ${moves?`<div class="cu-moves">${moves}</div>`:''}
      ${st.expEft>0?`<div class="cu-line"><span>EFT received — check on the bank app</span><b>${R(st.expEft)}</b></div>`:''}
      ${st.acctPays.length?`<div class="cu-note">Account payments: ${st.acctPays.map(p=>`${esc(p.cust)} ${R(p.amount)} (${p.method})`).join(', ')}</div>`:''}
      ${st.refunds.length?`<div class="cu-note">Cash refunds: ${st.refunds.map(r=>`${r.id} ${R(r.cashOut)}`).join(', ')}</div>`:''}
    </div>
  </div>`;
  if(cuRevealed) restoreCounts(); else {const c=window._cuDraft||[];DENOMS.forEach((d,i)=>{const e=document.getElementById('den-'+i);if(e&&c[i]) e.value=c[i];});calcDenoms();}
}
function calcDenoms(){const c=readCounts();if(!cuRevealed) window._cuDraft=c;const el=document.getElementById('countedAmt');if(el) el.textContent=R(countedTotal(cuRevealed?(window._cuCounts||c):c));calcBank();}
function calcBank(){const el=document.getElementById('cuBank');if(!el) return;el.textContent=R(Math.max(0,cuCounted()-(parseFloat(document.getElementById('cuFloatLeft')?.value)||0)));}
function renderCuResult(){}
function submitCashup(){
  if(!cuRevealed) return;
  const st=computeShiftStats();const counts=window._cuCounts||[];const counted=countedTotal(counts);const slip=parseFloat(window._cuSlip)||0;
  const dCash=counted-st.expCash,dCard=slip-st.expCard;
  const needReason=Math.abs(dCash)>=0.01||Math.abs(dCard)>=0.01;
  const reason=(document.getElementById('cuReason')?.value||'').trim();
  if(needReason&&!reason){toast('Give a reason for the difference',true);return;}
  const floatLeft=parseFloat(document.getElementById('cuFloatLeft').value)||0;
  if(floatLeft>counted){toast('Float left cannot be more than the cash counted',true);return;}
  const finish=(approvedBy)=>{
    const h={date:nowStamp(),cashier:curUser?.name,openedAt:S.shift.start,float:st.float,
      cashSales:st.cashSales,acctCash:st.acctCash,payIn:st.payIn,payOut:st.payOut,cashRefunds:st.cashRefunds,moves:st.moves,
      expected:st.expCash,counted,variance:dCash,expCard:st.expCard,cardSlip:slip,cardVariance:dCard,eft:st.expEft,
      accountOwed:st.accountOwed,txCount:st.txCount,floatLeft,banked:counted-floatLeft,reason,approvedBy:approvedBy||'',
      notes:document.getElementById('cuNotes')?.value||'',
      denomBreakdown:DENOMS.map((d,i)=>({label:d.l,count:counts[i]||0,value:d.v})).filter(d=>d.count>0)};
    h.id='CU-'+Date.now().toString(36).toUpperCase();
    S.cashupHistory=S.cashupHistory||[];S.cashupHistory.unshift(h);
    S.shift={open:false};S.shiftStartTime=new Date().toISOString();cuRevealed=false;window._cuCounts=null;window._cuSlip=null;window._cuFloat=null;window._cuDraft=null;
    if(needReason) logAudit(`Cash-up difference: cash ${dCash.toFixed(2)}, card ${dCard.toFixed(2)} — ${reason}`,approvedBy||'');
    saveState();renderCashup();showShiftSummaryPrint(h);toast('Shift closed');
  };
  if(needReason) reqAdmin('Admin PIN required to approve a cash-up difference',()=>finish(adminName()));
  else finish('');
}

function openMove(type){
  if(!curShift()){openShiftPrompt();return;}
  window._moveType=type;
  document.getElementById('mvTitle').textContent=type==='out'?'Pay Out (cash taken from till)':'Pay In (cash added to till)';
  document.getElementById('mvCat').innerHTML=(type==='out'?PAYOUT_CATS:PAYIN_CATS).map(c=>`<option>${c}</option>`).join('');
  document.getElementById('mvAmt').value='';document.getElementById('mvReason').value='';
  openMo('moveMo');
}
function saveMove(){
  const type=window._moveType;const amt=parseFloat(document.getElementById('mvAmt').value);
  const cat=document.getElementById('mvCat').value;const reason=document.getElementById('mvReason').value.trim();
  if(!(amt>0)){toast('Enter an amount',true);return;}
  if(!reason){toast('Describe what it was for',true);return;}
  const doIt=(approvedBy)=>{
    (S.shift.movements=S.shift.movements||[]).push({ts:new Date().toISOString(),type,amt,cat,reason,by:curUser?.name||'',approvedBy:approvedBy||''});
    logAudit(`${type==='out'?'Pay out':'Pay in'} R ${fmtR(amt)} · ${cat} · ${reason}`,approvedBy||curUser?.name||'');
    saveState();closeMo('moveMo');renderCashup();toast(type==='out'?'Pay out recorded':'Pay in recorded');
  };
  if(type==='out') reqAdmin('Admin PIN required for a pay out',()=>doIt(adminName()));else doIt('');
}

function cashupWaText(h){
  const v=(x)=>Math.abs(x)<0.01?'Balanced':(x<0?'SHORT '+R(-x):'OVER '+R(x));
  return `*${S.settings.compName} — Cash-Up*\n${h.date}\nSales: ${h.txCount}\n\n*Cash:* expected ${R(h.expected)}, counted ${R(h.counted)} → ${v(h.variance)}\n*Card:* expected ${R(h.expCard||0)}, slip ${R(h.cardSlip||0)} → ${v(h.cardVariance||0)}\n*EFT:* ${R(h.eft||0)} (check bank)\n*Owed on account:* ${R(h.accountOwed)}\n${h.payOut?`*Pay-outs:* ${R(h.payOut)}\n`:''}${h.reason?`*Reason:* ${h.reason}\n`:''}\n*Cash to bank:* ${R(h.banked||0)}\n*Float left:* ${R(h.floatLeft||0)}`;
}
function sendCashupWa(){
  const h=window._lastShiftPrint;if(!h) return;
  const num=S.settings.ownerWa||S.settings.whatsapp;
  if(!num){toast('Add the owner WhatsApp number in Settings',true);return;}
  window.open(waLink(num,cashupWaText(h)),'_blank');
}

function showShiftSummaryPrint(h){
  window._lastShiftPrint=h;
  const vt=x=>Math.abs(x||0)<0.01?['✓ Balanced','var(--ok)']:((x||0)<0?[`SHORT by ${R(-x)}`,'var(--err)']:[`OVER by ${R(x)}`,'var(--warn)']);
  const [cl,cc]=vt(h.variance),[kl,kc]=vt(h.cardVariance);
  const row=(a,b,bold)=>`<div class="rr" style="font-size:12.5px"><span>${a}</span><span>${bold?'<strong>'+b+'</strong>':b}</span></div>`;
  document.getElementById('shiftNoteBody').innerHTML=`
<div style="text-align:center;margin-bottom:12px">
  ${docHead()}
  <strong style="font-size:14px;display:inline-block;margin-top:8px">SHIFT CASH-UP SUMMARY</strong><br>
  <span style="font-size:12px;color:var(--g)">Closed ${h.date}${h.openedAt?' · Opened '+dTime(h.openedAt):''}</span>
</div>
<div class="rdv"></div>
${row('Cashier',DOC_BY)}${row('Sales this shift',h.txCount)}
<div class="rdv"></div>
<div style="font-size:12px;font-weight:700;color:var(--gd);margin-bottom:5px">CASH</div>
${row('Opening float',R(h.float||0))}${row('Cash sales',R(h.cashSales??h.expected))}
${h.acctCash?row('Account payments (cash)',R(h.acctCash)):''}${h.payIn?row('Pay-ins','+ '+R(h.payIn)):''}
${h.payOut?row('Pay-outs','− '+R(h.payOut)):''}${h.cashRefunds?row('Cash refunds','− '+R(h.cashRefunds)):''}
${row('Expected cash',R(h.expected),1)}${row('Counted cash',R(h.counted),1)}
<div style="text-align:center;font-size:15px;font-weight:800;color:${cc};padding:6px">${cl}</div>
${(h.moves||[]).length?`<div style="font-size:11px;color:var(--g)">${h.moves.map(m=>`${m.type==='in'?'+':'−'} ${R(m.amt)} ${m.cat} — ${m.reason}`).join('<br>')}</div>`:''}
<div class="rdv"></div>
<div style="font-size:12px;font-weight:700;color:var(--gd);margin-bottom:5px">CARD & EFT</div>
${row('Card expected',R(h.expCard||0))}${row('FNB slip total',R(h.cardSlip||0))}
<div style="text-align:center;font-size:13px;font-weight:800;color:${kc};padding:4px">${kl}</div>
${row('EFT received (check bank)',R(h.eft||0))}${row('Still owed on account',R(h.accountOwed||0))}
<div class="rdv"></div>
<div style="font-size:12px;font-weight:700;color:var(--gd);margin-bottom:5px">CASH COUNT</div>
${(h.denomBreakdown||[]).map(d=>row(`${d.label} × ${d.count}`,R(d.count*d.value))).join('')||'<div style="font-size:12px;color:var(--gl)">—</div>'}
<div class="rdv"></div>
${row('Cash to bank / owner',R(h.banked??h.counted),1)}${row('Float left for tomorrow',R(h.floatLeft||0))}
${h.reason?`<div class="rdv"></div><div style="font-size:12px"><strong>Reason for difference:</strong> ${h.reason}${h.approvedBy?' · Approved: '+h.approvedBy:''}</div>`:''}
${h.notes?`<div style="font-size:12px;color:var(--g);margin-top:4px">Notes: ${h.notes}</div>`:''}
<div style="margin-top:20px;display:flex;justify-content:space-between;gap:20px;font-size:12px">
  <div style="flex:1"><div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Cashier Signature</div></div>
  <div style="flex:1"><div style="border-top:1px solid var(--g);padding-top:6px;margin-top:30px">Owner Signature</div></div>
</div>`;
  openMo('shiftNoteMo');
}

function openCashupHistory(){
  const title=document.getElementById('cuHistTitle');
  if(title) title.textContent=curUser?.role==='admin'?'Past Shifts — All Staff':'Your Past Shifts';
  renderCashupHistory();openMo('cuHistMo');
}

function renderCashupHistory(){
  const tbl=document.getElementById('cuHistTbl');
  const isAdmin=curUser?.role==='admin';
  const list=(S.cashupHistory||[]).filter(h=>isAdmin||h.cashier===curUser?.name);
  if(!list.length){tbl.innerHTML=`<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--gl)">${isAdmin?'No shifts closed yet':'No past shifts on record for you yet'}</td></tr>`;return;}
  window._cuHistList=list;
  tbl.innerHTML=list.map((h,hi)=>{
    const v=h.variance||0;
    const vCol=Math.abs(v)<0.01?'var(--ok)':v<0?'var(--err)':'var(--warn)';
    const vLbl=Math.abs(v)<0.01?'✓ Balanced':(v<0?`− R ${fmtR(Math.abs(v))}`:`+ R ${fmtR(v)}`);
    return `<tr style="cursor:pointer" title="Open summary" onclick="closeMo('cuHistMo');showShiftSummaryPrint(window._cuHistList[${hi}])">
      <td style="padding:7px;font-size:11px;color:var(--g);border-bottom:1px solid var(--sand)">${h.date}</td>
      <td style="padding:7px;border-bottom:1px solid var(--sand)">${DOC_BY}</td>
      <td style="padding:7px;text-align:right;border-bottom:1px solid var(--sand)">${h.txCount||0}</td>
      <td style="padding:7px;text-align:right;font-family:var(--font-mono);border-bottom:1px solid var(--sand)">R ${fmtR((h.expected||0))}</td>
      <td style="padding:7px;text-align:right;font-family:var(--font-mono);border-bottom:1px solid var(--sand)">R ${fmtR((h.counted||0))}</td>
      <td style="padding:7px;text-align:right;font-family:var(--font-mono);font-weight:700;color:${vCol};border-bottom:1px solid var(--sand)">${vLbl}</td>
      <td style="padding:7px;font-size:11px;color:var(--g);border-bottom:1px solid var(--sand)">${h.reason||h.notes||'—'}</td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════
function filterTx(){
  const range=document.getElementById('repRange')?.value||'all';
  const now=new Date();
  return S.transactions.filter(t=>{
    if(range==='all') return true;
    const td=txD(t.date);
    if(range==='today') return td.toDateString()===now.toDateString();
    if(range==='week'){const w=new Date(now);w.setDate(w.getDate()-7);return td>=w;}
    if(range==='month'){const m=new Date(now);m.setDate(m.getDate()-30);return td>=m;}
    return true;
  });
}

function renderReports(){
  const txs=filterTx();
  const total=txs.reduce((s,t)=>s+t.amount,0);
  const totalStockVal=S.products.reduce((s,p)=>s+(p.stk*p.up),0);
  document.getElementById('repCards').innerHTML=[
    {l:'Total Revenue',v:`R ${total.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:`${txs.length} transactions`},
    {l:'Avg Sale Value',v:`R ${fmtR(txs.length?total/txs.length:0)}`,s:'Per transaction'},
    {l:'Stock Value',v:`R ${totalStockVal.toLocaleString('en-ZA',{minimumFractionDigits:2})}`,s:`${S.products.length} products`},
    {l:'Outstanding Debtors',v:`R ${fmtR(S.customers.reduce((s,c)=>s+c.balance,0))}`,s:`${S.customers.filter(c=>c.balance>0).length} customers`},
    {l:'Open Quotes',v:S.quotes.filter(q=>q.status==='sent').length,s:'Awaiting response'},
    {l:'Low / Out of Stock',v:S.products.filter(p=>!p.noStock&&p.stk<=p.ls).length,s:`of ${S.products.length} products`},
  ].map(c=>`<div class="rc"><div class="rc-lbl">${c.l}</div><div class="rc-val">${c.v}</div><div class="rc-sub">${c.s}</div></div>`).join('');

  // Top products from actual tx data
  const pr={};
  txs.forEach(t=>{if(t.cart) t.cart.forEach(i=>{pr[i.name]=(pr[i.name]||0)+gP(i)*i.qty;});});
  S.products.forEach(p=>{if(!pr[p.name]) pr[p.name]=p.up*p.stk*0.4;});
  const rev=Object.entries(pr).map(([n,r])=>({n,r})).sort((a,b)=>b.r-a.r).slice(0,6);
  const maxR=rev[0]?.r||1;
  document.getElementById('topChart').innerHTML=rev.map(p=>`<div class="br"><div class="br-lbl" title="${p.n}">${p.n}</div><div class="br-tr"><div class="br-f" style="width:${(p.r/maxR*100).toFixed(1)}%"></div></div><div class="br-v">R ${fmtK(p.r)}</div></div>`).join('');

  // Recent
  document.getElementById('recentTx').innerHTML=txs.slice(0,8).map(t=>`<div class="si"><div><div style="font-size:12px;font-weight:600">${t.id} — ${t.cust}</div><div style="font-size:11px;color:var(--g)">${t.date} · ${t.method}</div></div><div class="si-amt">R ${t.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>`).join('');

  // Debtor age
  document.getElementById('debtAge').innerHTML=`<table style="width:100%;font-size:12px;border-collapse:collapse">
    <thead><tr><th style="padding:7px;text-align:left;border-bottom:2px solid var(--sand-d)">Customer</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Balance</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Limit</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Usage</th><th style="padding:7px;border-bottom:2px solid var(--sand-d)">Status</th></tr></thead>
    <tbody>${S.customers.filter(c=>c.balance>0).map(c=>{
      const pct=c.credit>0?Math.round(c.balance/c.credit*100):0;
      const st=pct>90?'<span class="pill p-out">Critical</span>':pct>70?'<span class="pill p-low">High</span>':'<span class="pill p-ok">Normal</span>';
      return `<tr><td style="padding:7px">${c.name}</td><td style="padding:7px;text-align:right;font-weight:700">R ${fmtR(c.balance)}</td><td style="padding:7px;text-align:right">R ${c.credit.toLocaleString()}</td><td style="padding:7px;text-align:right">${pct}%</td><td style="padding:7px">${st}</td></tr>`;
    }).join('')}</tbody>
  </table>`;

  // Profit margin by product
  const marginProds=S.products.filter(p=>p.cost).map(p=>{
    const marginPct=(p.up-p.cost)/p.up*100;
    const marginR=p.up-p.cost;
    return {...p,marginPct,marginR};
  }).sort((a,b)=>a.marginPct-b.marginPct);
  if(!marginProds.length){
    document.getElementById('marginReport').innerHTML='<div style="font-size:12px;color:var(--g);padding:8px 0">Add cost prices in Inventory to see profit margins per product.</div>';
  } else {
    document.getElementById('marginReport').innerHTML=`<table style="width:100%;font-size:12px;border-collapse:collapse">
      <thead><tr><th style="padding:7px;text-align:left;border-bottom:2px solid var(--sand-d)">Product</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Sell Price</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Cost Price</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Margin/Unit</th><th style="padding:7px;text-align:right;border-bottom:2px solid var(--sand-d)">Margin %</th><th style="padding:7px;border-bottom:2px solid var(--sand-d)">Supplier</th></tr></thead>
      <tbody>${marginProds.map(p=>{
        const col=p.marginPct<15?'var(--err)':p.marginPct<30?'var(--warn)':'var(--ok)';
        return `<tr><td style="padding:7px">${p.name}</td><td style="padding:7px;text-align:right;font-family:var(--font-mono)">R ${fmtR(p.up)}</td><td style="padding:7px;text-align:right;font-family:var(--font-mono)">R ${fmtR(p.cost)}</td><td style="padding:7px;text-align:right;font-family:var(--font-mono)">R ${fmtR(p.marginR)}</td><td style="padding:7px;text-align:right;font-family:var(--font-mono);font-weight:700;color:${col}">${p.marginPct.toFixed(0)}%</td><td style="padding:7px;font-size:11px;color:var(--g)">${p.supplier||'—'}</td></tr>`;
      }).join('')}</tbody>
    </table>`;
  }

  // Tax report (VAT) for the selected period
  const vatCollected=txs.reduce((s,t)=>s+(t.vat||0),0);
  const taxableSales=txs.reduce((s,t)=>s+(t.amount-(t.vat||0)-(t.del||0)),0);
  const deliveryTotal=txs.reduce((s,t)=>s+(t.del||0),0);
  const grossSales=txs.reduce((s,t)=>s+t.amount,0);
  const untracked=txs.filter(t=>t.vat===undefined).length;
  document.getElementById('taxReport').innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:${untracked?'8px':'0'}">
      <div class="rc" style="padding:10px"><div class="rc-lbl">Taxable Sales (Excl. VAT)</div><div class="rc-val" style="font-size:16px">R ${taxableSales.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>
      <div class="rc" style="padding:10px"><div class="rc-lbl">VAT Collected (${S.settings.vatRate}%)</div><div class="rc-val" style="font-size:16px;color:var(--clay-d)">R ${vatCollected.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>
      <div class="rc" style="padding:10px"><div class="rc-lbl">Delivery Charges (No VAT)</div><div class="rc-val" style="font-size:16px">R ${deliveryTotal.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>
      <div class="rc" style="padding:10px"><div class="rc-lbl">Gross Sales (Incl. VAT)</div><div class="rc-val" style="font-size:16px">R ${grossSales.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div></div>
    </div>
    ${untracked?`<div style="font-size:11px;color:var(--g);padding-top:4px"><i class=i-alert></i> ${untracked} sale(s) in this period were made before VAT tracking was added and are excluded from the VAT figure above (still included in Gross Sales).</div>`:''}
  `;

  const pm={cash:0,card:0,eft:0,account:0};
  txs.forEach(t=>{if(pm[t.method]!==undefined) pm[t.method]+=t.amount;});
  const maxP=Math.max(...Object.values(pm))||1;
  const cols={cash:'var(--clay)',card:'var(--clay-l)',eft:'var(--ok)',account:'var(--clay-d)'};
  document.getElementById('payChart').innerHTML=Object.entries(pm).map(([m,v])=>`<div class="br"><div class="br-lbl">${m.charAt(0).toUpperCase()+m.slice(1)}</div><div class="br-tr"><div class="br-f" style="width:${(v/maxP*100).toFixed(1)}%;background:${cols[m]}"></div></div><div class="br-v">R ${fmtK(v)}</div></div>`).join('');

  // Stock valuation by category
  const sv={sand:0,brick:0,block:0,cement:0,concrete:0};
  S.products.forEach(p=>{if(sv[p.cat]!==undefined) sv[p.cat]+=p.stk*p.up;});
  const maxSv=Math.max(...Object.values(sv))||1;
  const catLbls={sand:'Sand',brick:'Bricks',block:'Blocks',cement:'Cement',concrete:'Pillars'};
  document.getElementById('stockVal').innerHTML=Object.entries(sv).map(([c,v])=>`<div class="br"><div class="br-lbl">${catLbls[c]}</div><div class="br-tr"><div class="br-f" style="width:${(v/maxSv*100).toFixed(1)}%"></div></div><div class="br-v">R ${fmtK(v)}</div></div>`).join('');

  // Cashier performance
  const cp={};
  txs.forEach(t=>{if(t.cashier){if(!cp[t.cashier]) cp[t.cashier]={sales:0,count:0};cp[t.cashier].sales+=t.amount;cp[t.cashier].count++;}});
  const maxC=Math.max(...Object.values(cp).map(x=>x.sales))||1;
  document.getElementById('cashierPerf').innerHTML=Object.entries(cp).map(([n,v])=>`<div class="br"><div class="br-lbl">${n}</div><div class="br-tr"><div class="br-f" style="width:${(v.sales/maxC*100).toFixed(1)}%"></div></div><div class="br-v">R ${fmtK(v.sales)} (${v.count})</div></div>`).join('');
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function renderSettings(){
  setTimeout(renderStoreInfo,0);
  const cfg=S.settings;
  document.getElementById('sCompName').value=cfg.compName;
  document.getElementById('sVat').value=cfg.vat||'';
  document.getElementById('sPhone').value=cfg.phone||'';
  document.getElementById('sAddr').value=cfg.addr||'';
  document.getElementById('sWhatsapp').value=cfg.whatsapp||'';
  document.getElementById('sEmail').value=cfg.email||'';
  document.getElementById('sOwnerWa').value=cfg.ownerWa||'';
  document.getElementById('sOwnerEmail').value=cfg.ownerEmail||'';
  document.getElementById('sSlogan').value=cfg.slogan||'';
  document.getElementById('sBank').value=cfg.bank||'';
  document.getElementById('sFooter').value=cfg.footer||'';
  document.getElementById('sMaxDisc').value=cfg.maxDisc;
  document.getElementById('sVatRate').value=cfg.vatRate;
  document.getElementById('sQValidity').value=cfg.qValidity;
  document.getElementById('sQFollow').value=cfg.qFollowDays||3;
  document.getElementById('sLowStock').value=cfg.lowStock;
  document.getElementById('sAutoLock').value=cfg.autoLockMinutes!==undefined?cfg.autoLockMinutes:10;
  document.getElementById('userList').innerHTML=S.users.map(u=>{
    const st=!u.pwHash?'<span class="u-warn">No sign-in yet — click Edit to set an email and password</span>':u.mustChange?'<span class="u-warn">Must choose own password at next sign-in</span>':'Active';
    const me=curUser&&u.id===curUser.id;
    return `<div class="user-card">
      <div class="uav ${u.role==='admin'?'adm':''}">${initials(u.name)}</div>
      <div class="user-card-info"><div class="user-card-name">${esc(u.name)}${me?' <span style="font-size:11px;color:var(--g)">(you)</span>':''}</div><div class="user-card-role">${u.role==='admin'?'Admin':'Cashier'} · ${esc(u.email||'no email')} · ${st}</div></div>
      <button class="btn-s" style="font-size:11px;padding:3px 8px" onclick="openEditUser(${u.id})">Edit</button>
      ${!me?`<button class="btn-d" style="font-size:11px;padding:3px 8px" onclick="delUser(${u.id})">Remove</button>`:''}
    </div>`;}).join('');
  renderZoneList();
  updateLastBackupLbl();
  renderCloudCard();
}

function renderZoneList(){
  const zl=document.getElementById('zoneList');
  if(!zl) return;
  if(!S.zones.length){zl.innerHTML='<div style="font-size:12px;color:var(--g);padding:6px 0">No delivery zones yet.</div>';return;}
  zl.innerHTML=S.zones.map(z=>`
    <div class="user-card">
      <div class="uav" style="background:var(--clay-l)"><i class=i-truck></i></div>
      <div class="user-card-info"><div class="user-card-name">${esc(z.name)}${z.code?` <span class="ci-sub">${esc(z.code)}</span>`:''}</div><div class="user-card-role">${z.fee>0?'R '+z.fee.toLocaleString('en-ZA')+' per load':'Price entered at quote / sale'}</div></div>
      <button class="btn-s" style="font-size:11px;padding:3px 8px" onclick="editZone(${z.id})">Edit</button>
      <button class="btn-d" style="font-size:11px;padding:3px 8px" onclick="delZoneEntry(${z.id})">Remove</button>
    </div>`).join('');
}

function renderZoneOptions(){
  const opts=S.zones.map(z=>`<option value="${z.id}">${esc(zoneLabel(z))} — ${z.fee>0?'R'+z.fee.toLocaleString():'enter price'}</option>`).join('');
  const posSel=document.getElementById('delZone');
  if(posSel){const cur=posSel.value;posSel.innerHTML='<option value="0">Select zone…</option>'+opts;posSel.value=cur||'0';}
  const qSel=document.getElementById('qDelZone');
  if(qSel){const cur=qSel.value;qSel.innerHTML=opts;if(cur) qSel.value=cur;}
}

const ZONE_FIELDS=(z)=>[{id:'name',label:'Distance / area',value:z?z.name:'',placeholder:'e.g. 0 – 10 km'},{id:'fee',label:'Price per load (R) — 0 means type the price at each sale',type:'number',value:z?z.fee:''},{id:'code',label:'Code (shows on quotes and invoices)',value:z?z.code||'':'',placeholder:'e.g. TRSVERZ'}];
function zoneVals(v){
  const name=(v.name||'').trim(),fee=parseFloat(v.fee);
  if(!name){toast('Enter the zone name',true);return null;}
  if(isNaN(fee)||fee<0){toast('Enter a valid fee amount (0 or more)',true);return null;}
  return {name,fee,code:(v.code||'').trim().toUpperCase()};
}
function addZone(){
  askForm('Add delivery zone',ZONE_FIELDS(null),v=>{
    const z=zoneVals(v);if(!z) return false;
    S.zones.push({id:newNumId('nextZoneId',S.zones),...z});
    renderZoneList();renderZoneOptions();saveState();toast('Zone added');
  },'Add zone');
}

// ── Clearing the test data at go-live is done in the cloud (supabase/migrations/…_clear_test_data.sql).
// It sets a clear marker in the "meta" settings row; each till that last synced before it then clears
// its own copy here, also practice records it never sent. Products, prices, zones, stock, company
// settings and the owner sign-in are always kept.
// stock is never touched: stock levels and the stock-change history (stockAdj) stay as they are
const WIPE_LISTS=['transactions','quotes','deliveries','purchases','sellReturns','cashupHistory','heldSales','auditLog','yardReports','customers','suppliers'];
const WIPE_NEXT=['nextCustId','nextPurchId','nextSupplierId','nextReturnId','nextAuditId','nextHeldId','nextRptId'];
const isOutstandingOrder=d=>/^DEL-R191026-\d+$/.test(String(d&&d.id||''));   // the 5 orders in the price-list SQL
function wipeKeep(w){
  const keep={};WIPE_LISTS.forEach(f=>{keep[f]=[];});
  if(w.keepReal){
    // only the outstanding orders from Portia's report (DEL-R191026-…) with their customers, and the 23 Oct report
    keep.deliveries=(S.deliveries||[]).filter(isOutstandingOrder);
    const names=new Set(keep.deliveries.map(d=>String(d.cust||'').trim().toLowerCase()));
    keep.customers=(S.customers||[]).filter(c=>names.has(String(c.name||'').trim().toLowerCase()));
    keep.yardReports=(S.yardReports||[]).filter(r=>/^RPT-R2[123]1026-/.test(String(r&&r.id||'')));   // Portia's reports of 21–23 Oct
  }
  keep.users=w.staff?(S.users||[]).filter(u=>u.role==='admin'):(S.users||[]);
  return keep;
}
// sh: this till's cloud shadow when the clear came from another till. Anything the cloud still holds as
// live is kept (records made after the clear, e.g. a real sale that has just arrived); only this till's
// own copies of the cleared records, and practice records it never sent, are removed.
function applyWipe(w,sh){
  const keep=wipeKeep(w),after=new Date(w.at);
  const live=(f,r)=>{if(!sh) return false;const spec=CLOUD_TABLES.find(x=>x.f===f);if(!spec) return false;
    const k=spec.key(r);if(Cloud.pullDeleted&&Cloud.pullDeleted[spec.t]&&Cloud.pullDeleted[spec.t].has(k)) return false;   // the clear deleted it in the cloud
    // made after the clear = real. A time counts as the end of its second (or minute, if it has no seconds).
    if(spec.appendOnly||(r&&r.date&&/\d:\d/.test(String(r.date)))){
      const t=txD(r.date).getTime()+(/\d:\d\d:\d/.test(String(r.date))?999:59999);if(t>=after) return true;if(spec.appendOnly) return false;}
    return !!(sh[spec.t]&&(k in sh[spec.t]));};
  WIPE_LISTS.forEach(f=>{const k=new Set(keep[f]);S[f]=(S[f]||[]).filter(r=>r&&(k.has(r)||live(f,r)));});
  S.users=(S.users||[]).filter(u=>keep.users.includes(u)||live('users',u));
  WIPE_NEXT.forEach(k=>{S[k]=1;});
  if(w.renum){S.nextTxId=1;S.nextQId=1;S.nextDelId=1;}   // numbers then carry on after the records that were kept
  S.shift={open:false};S.shiftStartTime=w.at;S.lastWeekly=null;S.wipe=w;
  cart=[];selCust=null;lastTxId=null;
}
function editZone(id){
  const z=S.zones.find(x=>x.id===id);if(!z) return;
  askForm('Edit delivery zone',ZONE_FIELDS(z),v=>{
    const n=zoneVals(v);if(!n) return false;
    Object.assign(z,n);
    renderZoneList();renderZoneOptions();saveState();toast('Zone updated');
  });
}

function delZoneEntry(id){
  confirm('Remove Zone','Remove this delivery zone? Existing sales and quotes already using it are not affected.',()=>{
    S.zones=S.zones.filter(z=>z.id!==id);
    renderZoneList();renderZoneOptions();saveState();toast('Zone removed');
  });
}

function saveSettings(){
  S.settings.compName=document.getElementById('sCompName').value||'M.F.D Bricks and Sand Supply';
  S.settings.vat=document.getElementById('sVat').value;
  S.settings.phone=document.getElementById('sPhone').value;
  S.settings.addr=document.getElementById('sAddr').value;
  S.settings.whatsapp=document.getElementById('sWhatsapp').value;
  S.settings.email=document.getElementById('sEmail').value;
  S.settings.ownerWa=document.getElementById('sOwnerWa').value;
  S.settings.ownerEmail=document.getElementById('sOwnerEmail').value.trim();
  S.settings.slogan=document.getElementById('sSlogan').value;
  S.settings.bank=document.getElementById('sBank').value;
  S.settings.footer=document.getElementById('sFooter').value;
  {const md=parseFloat(document.getElementById('sMaxDisc').value);S.settings.maxDisc=isNaN(md)||md<0?5:md;}
  {const vr=parseFloat(document.getElementById('sVatRate').value);S.settings.vatRate=isNaN(vr)||vr<0?0:vr;}
  renderCart&&renderCart();
  S.settings.qValidity=parseInt(document.getElementById('sQValidity').value)||14;
  S.settings.qFollowDays=parseInt(document.getElementById('sQFollow').value)||3;
  S.settings.lowStock=parseInt(document.getElementById('sLowStock').value)||5;
  S.settings.autoLockMinutes=parseInt(document.getElementById('sAutoLock').value);
  if(isNaN(S.settings.autoLockMinutes)||S.settings.autoLockMinutes<0) S.settings.autoLockMinutes=10;
  resetIdleTimer();
  saveState();toast('Settings saved');
}

let editUserId=null;
function userRoleChanged(){
  const admin=el('uRole').value==='admin';const u=S.users.find(x=>x.id===editUserId);
  el('uPinRow').style.display=admin?'flex':'none';
  el('uPinLbl').textContent=u&&u.apHash?'New approval PIN (leave blank to keep)':'Approval PIN (4 digits)';
}
function openAddUser(){
  if(curUser?.role!=='admin'){toast('Only the owner can add staff',true);return;}
  editUserId=null;el('userMoTitle').textContent='Add staff';el('uSaveBtn').textContent='Add staff';
  ['uName','uEmail','uPass','uPin'].forEach(id=>el(id).value='');el('uRole').value='cashier';
  el('uPassLbl').textContent='Temporary password';el('uPass').placeholder='At least 8 characters, letters and a number';
  el('uHint').textContent='Give the temporary password to the person. They must choose their own password the first time they sign in.';
  userRoleChanged();openMo('userMo');
}
function openEditUser(id){
  const u=S.users.find(x=>x.id===id);if(!u) return;
  editUserId=id;el('userMoTitle').textContent=`Edit — ${u.name}`;el('uSaveBtn').textContent='Save';
  el('uName').value=u.name;el('uEmail').value=u.email||'';el('uRole').value=u.role;el('uPass').value='';el('uPin').value='';
  el('uPassLbl').textContent=u.pwHash?'Reset password (leave blank to keep)':'Temporary password';
  el('uPass').placeholder=u.pwHash?'Type a temporary password to reset':'At least 8 characters, letters and a number';
  el('uHint').textContent=u.pwHash?'Resetting sets a temporary password. The person must choose a new one at their next sign-in.':'Give the temporary password to the person. They must choose their own password the first time they sign in.';
  userRoleChanged();openMo('userMo');
}
async function saveUser(){
  if(curUser?.role!=='admin'){toast('Only the owner can manage staff',true);return;}
  const name=el('uName').value.trim(),email=normEmail(el('uEmail').value),role=el('uRole').value,pw=el('uPass').value,pin=el('uPin').value.trim();
  const u=editUserId?S.users.find(x=>x.id===editUserId):null;
  if(!name){toast('Name required',true);return;}
  if(!validEmail(email)){toast('Enter a valid email address',true);return;}
  if(S.users.some(x=>x.id!==editUserId&&normEmail(x.email)===email)){toast('This email is already used by another staff member',true);return;}
  const needPw=!u||!u.pwHash;
  if(needPw||pw){const pp=pwProblem(pw);if(pp){toast(pp,true);return;}}
  const needPin=role==='admin'&&!(u&&u.apHash);
  if(role==='admin'&&(needPin||pin)&&!validPin(pin)){toast('The approval PIN must be exactly 4 digits',true);return;}
  if(u&&u.role==='admin'&&role!=='admin'&&S.users.filter(x=>x.role==='admin'&&x.pwHash).length<=1){toast('There must be at least one admin',true);return;}
  if(u&&curUser&&u.id===curUser.id&&role!=='admin'){toast('You cannot remove your own admin rights',true);return;}
  setBusy('uSaveBtn',true,'Saving…');
  try{
    if(u&&curUser&&u.id===curUser.id&&(pw||email!==normEmail(u.email))&&!await ownerCloudChange(u,{email,password:pw||''})) return;
    const t=u||{id:newNumId('nextUserId',S.users),avatar:''};
    Object.assign(t,{name,email,role,avatar:role==='admin'?'👑':'👤'});
    if(pw){const h=await hashSecret(pw);t.pwHash=h.hash;t.pwSalt=h.salt;t.mustChange=!(curUser&&t.id===curUser.id);}
    if(role==='admin'&&pin){const h=await hashSecret(pin);t.apHash=h.hash;t.apSalt=h.salt;}
    if(role!=='admin'){delete t.apHash;delete t.apSalt;delete t.recHash;delete t.recSalt;}
    delete t.pin;
    if(!u) S.users.push(t);
    clearFail('login:'+email);
    logAudit(u?(pw?`Password reset for ${name}`:`Staff details updated: ${name}`):`Staff sign-in added: ${name} (${role})`,curUser?.name||'');
    saveState();closeMo('userMo');renderSettings();buildNav();
    toast(u?(pw?`Password reset — ${name} must choose a new one at next sign-in`:'Staff updated'):`${name} added — share the email and temporary password with them`);
  }finally{setBusy('uSaveBtn',false);}
}
function delUser(id){
  const u=S.users.find(x=>x.id===id);if(!u) return;
  if(curUser&&u.id===curUser.id){toast('You cannot remove yourself',true);return;}
  if(u.role==='admin'&&S.users.filter(x=>x.role==='admin'&&x.pwHash).length<=1){toast('There must be at least one admin',true);return;}
  confirm('Remove staff',`Remove ${u.name}? They will no longer be able to sign in.`,()=>{S.users=S.users.filter(x=>x.id!==id);logAudit(`Staff removed: ${u.name}`,curUser?.name||'');renderSettings();saveState();buildNav();toast('Staff removed');});
}
function openMyPassword(){
  if(!curUser) return;['mpCur','mpNew','mpNew2','mpPin'].forEach(id=>el(id).value='');el('mpRec').checked=false;
  el('mpAdminRow').style.display=curUser.role==='admin'?'flex':'none';openMo('myPwMo');
}
async function saveMyPassword(){
  const u=curUser;if(!u) return;
  const cur=el('mpCur').value,pw=el('mpNew').value,pin=el('mpPin').value.trim(),wantRec=el('mpRec').checked;
  if(!await verifySecret(cur,u.pwHash,u.pwSalt)){toast('Current password is incorrect',true);return;}
  if(pw||!pin&&!wantRec){const pp=pwProblem(pw);if(pp){toast(pp,true);return;}if(pw!==el('mpNew2').value){toast('The new passwords do not match',true);return;}}
  if(pin&&!validPin(pin)){toast('The approval PIN must be exactly 4 digits',true);return;}
  setBusy('mpBtn',true,'Saving…');
  try{
    if(pw&&!await ownerCloudChange(u,{password:pw})) return;
    if(pw){const h=await hashSecret(pw);u.pwHash=h.hash;u.pwSalt=h.salt;u.mustChange=false;}
    if(pin&&u.role==='admin'){const h=await hashSecret(pin);u.apHash=h.hash;u.apSalt=h.salt;}
    let code=null;if(wantRec&&u.role==='admin'){code=newRecoveryCode();const h=await hashSecret(normCode(code));u.recHash=h.hash;u.recSalt=h.salt;}
    logAudit(['Changed own password',pin?'approval PIN':'',code?'new recovery code':''].filter(Boolean).join(' · '),u.name);
    saveState();closeMo('myPwMo');
    if(code){confirm('New recovery code',`Write this down and keep it safe. It replaces the old code and is shown only once:\n\n${code}`,()=>{},false);}
    else toast('Saved');
  }finally{setBusy('mpBtn',false);}
}

// ═══════════════════════════════════════
// UTILS
// ═══════════════════════════════════════
function openMo(id){document.getElementById(id).classList.add('on');}
function closeMo(id){document.getElementById(id).classList.remove('on');if(id==='askMo') el('askMo').querySelector('.mo').classList.remove('wide');if(id==='rcptMo'&&saleDone){saleDone=false;clearCartNow();}}
// prints only that window (the till slip, a statement…), never the screen behind it
function printMo(id){
  setPage(id==='rcptMo'?'80mm':'a4');
  document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  document.body.classList.add('mo-print');
  const done=()=>{document.body.classList.remove('mo-print');window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  window.print();setTimeout(done,60000);   // normally cleared by afterprint, when the print window closes
}
function toast(msg,err=false){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast'+(err?' err':'');
  t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800);
}

// ═══════════════════════════════════════
// POS TOOLBAR: CALCULATOR
// ═══════════════════════════════════════
let calcExpr='';
function openCalculator(){calcExpr='';updateCalcDisplay();openMo('calcMo');}
function updateCalcDisplay(){
  const d=document.getElementById('calcDisplay');
  const shown=calcExpr.replace(/\*/g,'×').replace(/\//g,'÷');
  d.textContent=shown||'0';
}
function calcInput(k){
  if(k==='C'){calcExpr='';updateCalcDisplay();return;}
  if(k==='back'){calcExpr=calcExpr.slice(0,-1);updateCalcDisplay();return;}
  if(k==='='){
    if(!/^[0-9+\-*/.() %]+$/.test(calcExpr)){calcExpr='Error';updateCalcDisplay();return;}
    try{
      const result=Function('"use strict";return ('+calcExpr.replace(/%/g,'/100')+')')();
      calcExpr=(isFinite(result)?String(Math.round(result*10000)/10000):'Error');
    }catch(e){calcExpr='Error';}
    updateCalcDisplay();return;
  }
  if(calcExpr==='Error') calcExpr='';
  calcExpr+=k;updateCalcDisplay();
}

// ═══════════════════════════════════════
// POS TOOLBAR: SELL RETURN
// ═══════════════════════════════════════
function openSellReturn(){
  document.getElementById('returnSrch').value='';
  renderReturnResults();
  openMo('returnMo');
}
function renderReturnResults(){
  const q=document.getElementById('returnSrch').value.toLowerCase();
  const list=q?S.transactions.filter(t=>t.id.toLowerCase().includes(q)||t.cust.toLowerCase().includes(q)):S.transactions.slice(0,15);
  const el=document.getElementById('returnResults');
  if(!list.length){el.innerHTML='<div style="font-size:13px;color:var(--g);padding:20px;text-align:center">No matching sales found.</div>';return;}
  el.innerHTML=list.map(t=>`
    <div style="background:var(--sand);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:700">${t.id} — ${t.cust}</div>
        <div style="font-size:11px;color:var(--g)">${t.date} · ${t.method} · R ${t.amount.toLocaleString('en-ZA',{minimumFractionDigits:2})}</div>
      </div>
      <div style="display:flex;gap:6px"><button class="btn-s" style="font-size:12px;padding:6px 12px" onclick="openItemReturn('${t.id}')"><i class=i-undo></i> Return items</button><button class="btn-d" style="font-size:12px;padding:6px 12px" onclick="closeMo('returnMo');refundTxById('${t.id}')">Full refund</button></div>
    </div>`).join('');
}

// ═══════════════════════════════════════
// POS TOOLBAR: CLOSE REGISTER / FULL SCREEN / SYNC
// ═══════════════════════════════════════
function closeRegister(){showSc('cashup');}

function toggleFullScreen(){
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen?.().catch(()=>toast(/Electron/i.test(navigator.userAgent)?'Press F11 for full screen (or install the latest MFD POS desktop app)':'Full screen is not available in this browser — press F11',true));
  } else {
    document.exitFullscreen?.();
  }
}
document.addEventListener('fullscreenchange',()=>{
  const btn=document.getElementById('fsBtn');

});

function updateSyncUI(){
  const lbl=document.getElementById('syncLbl');
  const dot=document.getElementById('syncDot');
  if(!lbl) return;
  const n=S.pendingSync||0;
  lbl.textContent=`${n} sale(s) pending sync`;
  if(dot) dot.className='ptb-dot'+(n===0?' ok':'');
}

function syncSales(){
  const n=S.pendingSync||0;
  if(n===0){toast('Already up to date');return;}
  S.pendingSync=0;saveState();updateSyncUI();
  toast(`${n} sale(s) synced to cloud`);
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// CLOUD DATABASE — offline-first sync
// The till always works from its own copy. Changes are queued and copied to
// MFD's cloud database when there is internet; changes made elsewhere
// (another device, phone access) are pulled back in.
// ═══════════════════════════════════════
const CLOUD_KEY='mfd_cloud',CLOUD_SHADOW='mfd_cloud_shadow',CLOUD_MARKS='mfd_cloud_pull';
const CLOUD_COUNTERS=['nextRptId','nextProdId','nextTxId','nextQId','nextDelId','nextCustId','nextUserId','nextPurchId','nextReturnId','nextSupplierId','nextAuditId','nextZoneId','nextAdjId','nextHeldId','nextWorkerId'];
const CLOUD_TABLES=[
  {t:'staff',f:'users',key:r=>String(r.id)},
  {t:'products',f:'products',key:r=>String(r.id)},
  {t:'customers',f:'customers',key:r=>String(r.id)},
  {t:'suppliers',f:'suppliers',key:r=>String(r.id)},
  {t:'zones',f:'zones',key:r=>String(r.id)},
  {t:'sales',f:'transactions',key:r=>String(r.id),front:true},
  {t:'quotes',f:'quotes',key:r=>String(r.id),front:true},
  {t:'deliveries',f:'deliveries',key:r=>String(r.id),front:true},
  {t:'purchases',f:'purchases',key:r=>String(r.id),front:true},
  {t:'returns',f:'sellReturns',key:r=>String(r.id),front:true},
  {t:'cashups',f:'cashupHistory',key:r=>String(r.id),front:true},
  {t:'stock_adjustments',f:'stockAdj',key:r=>String(r.id),front:true},
  {t:'held_sales',f:'heldSales',key:r=>String(r.id),front:true},
  {t:'audit_log',f:'auditLog',key:r=>String(r.id)+'@'+(r.date||''),front:true,appendOnly:true},
  {t:'yard_reports',f:'yardReports',key:r=>String(r.id),front:true,optional:true},
  {t:'workers',f:'workers',key:r=>String(r.id),optional:true},
];
const CLOUD_KV=[
  {id:'settings',get:()=>S.settings,set:v=>{S.settings={...S.settings,...v};}},
  {id:'counters',get:()=>{const o={};CLOUD_COUNTERS.forEach(k=>{if(S[k]!==undefined) o[k]=S[k];});return o;},
    set:v=>{CLOUD_COUNTERS.forEach(k=>{if(typeof v[k]==='number') S[k]=Math.max(S[k]||0,v[k]);});}},
  {id:'shift',get:()=>({shift:S.shift||{open:false},shiftStartTime:S.shiftStartTime||''}),set:v=>{if(v.shift) S.shift=v.shift;if(v.shiftStartTime) S.shiftStartTime=v.shiftStartTime;}},
  {id:'meta',get:()=>({lastWeekly:S.lastWeekly||null,wipe:S.wipe||null}),set:v=>{S.lastWeekly=v.lastWeekly||null;
    // a clear this till has not applied yet: it clears its own copy too (records the cloud still holds and
    // records made after the clear are kept). A full restore already brings the clean copy, so it only notes it.
    if(v.wipe&&v.wipe.at>(S.wipe?.at||'')){if(Cloud.restoring) S.wipe=v.wipe;else applyWipe(v.wipe,Cloud.pullShadow);}}},
];
const Cloud={busy:false,again:false,timer:null,state:'off',msg:'',lastSync:'',pending:0};
// MFD's own cloud project. The URL and publishable key are public by design:
// the database only answers a signed-in cloud account, and only with its own rows.
const CLOUD_DEFAULT={url:'https://skydpikflsrkhurogzvj.supabase.co',key:'sb_publishable_IKQ7qT57y_jkHJXTyuDIsg_dNnH4MaE'};
const CLOUD_BASE='mfd_cloud_base';
// last cloud version (updated_at) seen of each shared record: a change is only written over
// the cloud copy if nobody changed it since, otherwise it is fetched, merged and sent again
const CLOUD_TS='mfd_cloud_ts';
// shared lists both devices edit: merged field by field, so a price change on one
// device and a sale (stock change) on another both survive
const CLOUD_MERGE={products:['stk'],customers:['balance','total','purchaseCount'],suppliers:[],zones:[],staff:[]};

// ── this device's letter ──
// '' on the main till (the one that set up the owner), B, C… on devices that joined
// from the cloud. New numbers carry the letter (INV-B012, product 2000012), so two
// devices can never hand out the same invoice or product number, even offline.
const DEVICE_KEY='mfd_device';
function deviceInfo(){try{return JSON.parse(localStorage.getItem(DEVICE_KEY)||'null');}catch(e){return null;}}
function deviceCode(){const d=deviceInfo();return (d&&d.code)||'';}
// gen: the device-numbering round this letter belongs to (raised when the numbering is restarted)
function setDevice(code,main,gen){const o=deviceInfo()||{};try{localStorage.setItem(DEVICE_KEY,JSON.stringify({id:o.id||('d'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)),code:code||'',main:!!main,gen:gen??o.gen??0,set:new Date().toISOString()}));}catch(e){}}
function deviceBand(){const c=deviceCode();return c?(c.charCodeAt(0)-64)*1000000:0;}
function deviceLabel(){const c=deviceCode();return c?`Device ${c} (numbers look like INV-${c}001)`:'Main till (numbers look like INV-001)';}
function newNumId(key,list){
  const band=deviceBand();let n=Math.max(1,Number(S[key])||1);
  (list||[]).forEach(r=>{const v=Number(r&&r.id);if(v>band&&v<band+1000000) n=Math.max(n,v-band+1);});
  S[key]=n+1;return band+n;
}
function newDocId(prefix,key,list){
  const code=deviceCode(),re=new RegExp('^'+prefix+'-'+code+'(\\d+)$');let n=Math.max(1,Number(S[key])||1);
  (list||[]).forEach(r=>{const m=re.exec(String(r&&r.id||''));if(m) n=Math.max(n,Number(m[1])+1);});
  S[key]=n+1;return `${prefix}-${code}${String(n).padStart(3,'0')}`;
}
// three-way merge of one record: base = what both sides last agreed on
function merge3(b,l,r,add){
  const out={},eq=(x,y)=>canon(x)===canon(y);
  new Set([...Object.keys(l||{}),...Object.keys(r||{})]).forEach(k=>{
    const bv=b?b[k]:undefined,lv=l?l[k]:undefined,rv=r?r[k]:undefined;
    if(add.includes(k)&&[lv,rv,bv].every(v=>typeof v==='number')) out[k]=Math.round((rv+lv-bv)*1000)/1000; // running total (stock, balance): add up both devices' changes
    else if(eq(lv,rv)||eq(rv,bv)) out[k]=lv;                  // same, or only this device changed it
    else if(eq(lv,bv)) out[k]=rv;                            // only the other device changed it
    else if(Array.isArray(lv)&&Array.isArray(rv)){            // lists (payments, invoice history): keep additions from both
      const bs=new Set((Array.isArray(bv)?bv:[]).map(canon)),ls=new Set(lv.map(canon)),rs=new Set(rv.map(canon));
      out[k]=[...rv.filter(x=>!(bs.has(canon(x))&&!ls.has(canon(x)))),...lv.filter(x=>!bs.has(canon(x))&&!rs.has(canon(x)))];
    }
    else out[k]=lv;
  });
  Object.keys(out).forEach(k=>{if(out[k]===undefined) delete out[k];});
  return out;
}
const cloneJ=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));

// always MFD's own project: an address or key saved by an older version can never point a device elsewhere
function cloudCfg(){let c={};try{c=JSON.parse(localStorage.getItem(CLOUD_KEY)||'{}')||{};}catch(e){}c.url=CLOUD_DEFAULT.url;c.key=CLOUD_DEFAULT.key;return c;}
function cloudSaveCfg(c){try{localStorage.setItem(CLOUD_KEY,JSON.stringify(c));}catch(e){}}
function cloudLoadJSON(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){return {};}}
function cloudSaveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function cloudReady(){const c=cloudCfg();return !!(c.url&&c.key&&c.refresh&&c.linked);}

// stable JSON (sorted keys) so the database's key order never looks like a change
function canon(v){
  if(v===null||typeof v!=='object') return JSON.stringify(v===undefined?null:v);
  if(Array.isArray(v)) return '['+v.map(canon).join(',')+']';
  return '{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';
}
function chash(v){const s=canon(v);let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(36)+'.'+s.length.toString(36);}

function cloudEnsureIds(){
  (S.cashupHistory||[]).forEach((h,i)=>{if(!h.id) h.id='CU-'+String(h.date||'').replace(/\D/g,'')+'-'+String(h.cashier||'x').replace(/\W/g,'').slice(0,10);});
  const seen={};(S.cashupHistory||[]).forEach(h=>{if(seen[h.id]) h.id+='-'+Math.random().toString(36).slice(2,6);seen[h.id]=1;});
}

// ── HTTP ──
function cloudBase(c){return String(c.url||'').trim().replace(/\/+$/,'');}
function cloudNetErr(e){
  if(e&&e.cloudHttp) return e;
  const err=new Error('No internet connection right now. Everything you do is still saved on this device and will be sent to the cloud automatically when the connection is back. Check the Wi-Fi or mobile data, then try again.');err.offline=true;return err;
}
async function cloudErrText(r){let t='';try{const j=await r.json();t=j.error_description||j.msg||j.message||j.error||'';}catch(e){}return t||('HTTP '+r.status);}
async function cloudAuth(c,grant,body){
  let r;
  try{r=await fetch(cloudBase(c)+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify(body)});}
  catch(e){throw cloudNetErr(e);}
  if(!r.ok){const e=new Error(await cloudErrText(r));e.cloudHttp=r.status;e.auth=true;throw e;}
  const s=await r.json();
  c.access=s.access_token;c.refresh=s.refresh_token||c.refresh;c.exp=Date.now()+((s.expires_in||3600)*1000);
  if(s.user){c.uid=s.user.id;if(s.user.email) c.email=s.user.email;}
  cloudSaveCfg(c);return c;
}
async function cloudToken(c){
  if(c.access&&c.exp&&Date.now()<c.exp-60000) return c;
  if(!c.refresh){const e=new Error('Signed out of the cloud. Connect again in Settings.');e.auth=true;throw e;}
  return cloudAuth(c,'refresh_token',{refresh_token:c.refresh});
}
async function cloudReq(path,opt,retried){
  let c=await cloudToken(cloudCfg());
  let r;
  try{r=await fetch(cloudBase(c)+'/rest/v1/'+path,{...opt,headers:{apikey:c.key,Authorization:'Bearer '+c.access,'Content-Type':'application/json',...((opt&&opt.headers)||{})}});}
  catch(e){throw cloudNetErr(e);}
  if(r.status===401&&!retried){c.exp=0;cloudSaveCfg(c);return cloudReq(path,opt,true);}
  if(!r.ok){const e=new Error(await cloudErrText(r));e.cloudHttp=r.status;throw e;}
  return r;
}
const cloudIn=ids=>'in.('+ids.map(i=>'"'+String(i).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"').join(',')+')';

// ── push local changes ──
async function cloudPush(){
  cloudEnsureIds();
  const sh=cloudLoadJSON(CLOUD_SHADOW),base=cloudLoadJSON(CLOUD_BASE),tsAll=cloudLoadJSON(CLOUD_TS);let sent=0,conflicts=0;
  for(const spec of CLOUD_TABLES){
    const rows=Array.isArray(S[spec.f])?S[spec.f]:[];const old=sh[spec.t]||{};const cur={},up=[];
    const mb=CLOUD_MERGE[spec.t]?(base[spec.t]||{}):null,nb={};
    rows.forEach(r=>{if(!r) return;const id=spec.key(r);const h=chash(r);cur[id]=h;if(old[id]!==h) up.push({id,data:r,deleted:false});
      if(mb) nb[id]=(old[id]===h&&mb[id])?mb[id]:cloneJ(r);});
    if(mb){base[spec.t]=nb;}
    const gone=spec.appendOnly?[]:Object.keys(old).filter(id=>!(id in cur));
    try{
    if(mb){
      const ts=tsAll[spec.t]=tsAll[spec.t]||{};
      const fresh=up.filter(x=>!ts[x.id]),known=up.filter(x=>ts[x.id]);
      for(let i=0;i<fresh.length;i+=400){
        const r=await cloudReq(spec.t+'?on_conflict=owner_id,id&select=id,updated_at',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(fresh.slice(i,i+400))});
        (await r.json()).forEach(x=>{ts[x.id]=x.updated_at;});
      }
      for(const x of known){
        const r=await cloudReq(`${spec.t}?id=eq.${encodeURIComponent(x.id)}&updated_at=eq.${encodeURIComponent(ts[x.id])}&select=id,updated_at`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({data:x.data,deleted:false})});
        const got=await r.json();
        if(got.length){ts[x.id]=got[0].updated_at;continue;}
        // someone else changed it first: keep this device's change unsent, merge on the next pull
        conflicts++;cur[x.id]=old[x.id];if(mb[x.id]) nb[x.id]=mb[x.id];else delete nb[x.id];
      }
      cloudSaveJSON(CLOUD_TS,tsAll);
    } else
    for(let i=0;i<up.length;i+=400){
      await cloudReq(spec.t+'?on_conflict=owner_id,id',{method:'POST',headers:{Prefer:(spec.appendOnly?'resolution=ignore-duplicates':'resolution=merge-duplicates')+',return=minimal'},body:JSON.stringify(up.slice(i,i+400))});
    }
    for(let i=0;i<gone.length;i+=100){
      await cloudReq(spec.t+'?id='+encodeURIComponent(cloudIn(gone.slice(i,i+100))),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({deleted:true})});
    }
    }catch(e){if(spec.optional&&e.cloudHttp===404) continue;throw e;}   // newer table not added to the cloud yet: kept on the device, sent later
    sent+=up.length+gone.length;sh[spec.t]=cur;cloudSaveJSON(CLOUD_SHADOW,sh);if(mb) cloudSaveJSON(CLOUD_BASE,base);
  }
  const kvOld=sh.__kv||{},kvUp=[],kvCur={};
  CLOUD_KV.forEach(k=>{const v=k.get();const h=chash(v);kvCur[k.id]=h;if(kvOld[k.id]!==h) kvUp.push({id:k.id,data:v,deleted:false});});
  if(kvUp.length) await cloudReq('store_settings?on_conflict=owner_id,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(kvUp)});
  sent+=kvUp.length;sh.__kv=kvCur;cloudSaveJSON(CLOUD_SHADOW,sh);
  base.__kv={...(base.__kv||{}),settings:cloneJ(S.settings)};cloudSaveJSON(CLOUD_BASE,base);
  cloudPush.conflicts=conflicts;
  return sent;
}

// ── pull changes made elsewhere (local unsynced edits always win) ──
async function cloudFetchAll(table,since){
  const out=[];let off=0;
  const q=since?'&updated_at=gt.'+encodeURIComponent(since):'';
  for(;;){
    const r=await cloudReq(`${table}?select=id,data,deleted,updated_at${q}&order=updated_at.asc,id.asc&limit=1000&offset=${off}`,{method:'GET'});
    const rows=await r.json();out.push(...rows);if(rows.length<1000) break;off+=1000;
  }
  return out;
}
function cloudOverlap(iso){if(!iso) return '';const d=new Date(new Date(iso).getTime()-120000);return isNaN(d)?'':d.toISOString();}
async function cloudPull(){
  const sh=cloudLoadJSON(CLOUD_SHADOW),marks=cloudLoadJSON(CLOUD_MARKS),base=cloudLoadJSON(CLOUD_BASE),tsAll=cloudLoadJSON(CLOUD_TS);let changed=0;Cloud.prevMark=marks.store_settings||'';Cloud.pullShadow=sh;Cloud.pullDeleted={};
  for(const spec of [...CLOUD_TABLES,{t:'store_settings',kv:true}]){
    let rows;try{rows=await cloudFetchAll(spec.t,cloudOverlap(marks[spec.t]));}catch(e){if(spec.optional&&e.cloudHttp===404) continue;throw e;}
    let mark=marks[spec.t]||'';
    if(spec.kv){
      const old=sh.__kv||{};
      const kb=base.__kv=base.__kv||{};
      rows.forEach(row=>{if(row.updated_at>mark) mark=row.updated_at;if(row.id==='devices'&&!row.deleted) cloudCheckDevices(row.data);const k=CLOUD_KV.find(x=>x.id===row.id);if(!k||row.deleted) return;
        const h=chash(row.data);if(old[row.id]===h) return;
        if(chash(k.get())!==old[row.id]&&old[row.id]){
          // settings changed here and on another device: keep both sets of changes
          if(row.id==='settings'&&kb.settings){S.settings=merge3(kb.settings,S.settings,row.data,[]);kb.settings=cloneJ(row.data);old[row.id]=h;changed++;}
          return;
        }
        k.set(row.data);old[row.id]=chash(k.get());if(row.id==='settings') kb.settings=cloneJ(S.settings);changed++;});
      sh.__kv=old;
    } else {
      const old=sh[spec.t]||{};const arr=Array.isArray(S[spec.f])?S[spec.f]:(S[spec.f]=[]);
      const add=CLOUD_MERGE[spec.t],mb=add?(base[spec.t]=base[spec.t]||{}):null;
      const idx={};arr.forEach((r,i)=>{if(r) idx[spec.key(r)]=i;});
      const removeIds=new Set();
      const ts=mb?(tsAll[spec.t]=tsAll[spec.t]||{}):null;
      rows.forEach(row=>{
        if(row.updated_at>mark) mark=row.updated_at;
        if(ts) ts[row.id]=row.updated_at;
        const id=row.id;const at=idx[id];const local=at!==undefined?arr[at]:null;
        if(row.deleted){
          (Cloud.pullDeleted[spec.t]=Cloud.pullDeleted[spec.t]||new Set()).add(id);
          if(spec.appendOnly||!(id in old)) return;
          if(local&&chash(local)!==old[id]) return;
          if(local) removeIds.add(id);delete old[id];if(mb) delete mb[id];changed++;return;
        }
        const h=chash(row.data);
        if(old[id]===h) return;
        if(local&&old[id]&&chash(local)!==old[id]){
          // changed here AND on another device: merge both (the merged copy is sent on the next push)
          if(mb&&mb[id]){arr[at]=merge3(mb[id],local,row.data,add);mb[id]=cloneJ(row.data);old[id]=h;changed++;}
          return;
        }
        if(mb) mb[id]=cloneJ(row.data);
        if(local&&chash(local)===h){old[id]=h;return;}
        if(local) arr[at]=row.data;else{if(spec.front) arr.unshift(row.data);else arr.push(row.data);}
        old[id]=h;changed++;
      });
      if(removeIds.size) S[spec.f]=arr.filter(r=>!(r&&removeIds.has(spec.key(r))));
      sh[spec.t]=old;
    }
    if(mark) marks[spec.t]=mark;
  }
  cloudSaveJSON(CLOUD_SHADOW,sh);cloudSaveJSON(CLOUD_MARKS,marks);cloudSaveJSON(CLOUD_BASE,base);cloudSaveJSON(CLOUD_TS,tsAll);
  if(deviceInfo()?.claim){const code=await cloudClaimDevice();logAudit(`Device numbering restarted on another device: this one is now Device ${code}`,curUser?.name||'');try{renderCloudCard();}catch(e){}}
  if(changed){saveStateLocal();cloudRefreshUI();}
  return changed;
}

// ── full restore (new laptop, or after a disaster) ──
async function cloudRestoreAll(){
  Cloud.prevMark='';
  const sh={},marks={},tsR={};const next={};
  for(const spec of CLOUD_TABLES){
    let rows;try{rows=await cloudFetchAll(spec.t,'');}catch(e){if(spec.optional&&e.cloudHttp===404){next[spec.f]=S[spec.f]||[];sh[spec.t]={};continue;}throw e;}
    if(CLOUD_MERGE[spec.t]){tsR[spec.t]={};rows.forEach(r=>{tsR[spec.t][r.id]=r.updated_at;});}
    const live=rows.filter(r=>!r.deleted).map(r=>r.data);
    if(spec.front) live.reverse();
    if(spec.t==='sales'||spec.t==='audit_log') live.sort((a,b)=>txD(b.date)-txD(a.date));
    next[spec.f]=live;sh[spec.t]={};live.forEach(r=>{sh[spec.t][spec.key(r)]=chash(r);});
    const last=rows[rows.length-1];if(last) marks[spec.t]=rows.reduce((m,r)=>r.updated_at>m?r.updated_at:m,'');
  }
  const kv=await cloudFetchAll('store_settings','');
  if(!next.users||!next.users.some(u=>u.role==='admin'&&u.pwHash)) throw new Error('The cloud has no owner sign-in yet, so nothing was restored.');
  CLOUD_TABLES.forEach(spec=>{S[spec.f]=next[spec.f];});
  const base={};CLOUD_TABLES.forEach(spec=>{if(!CLOUD_MERGE[spec.t]) return;base[spec.t]={};next[spec.f].forEach(r=>{base[spec.t][spec.key(r)]=cloneJ(r);});});
  cloudSaveJSON(CLOUD_BASE,base);
  Cloud.restoring=true;
  try{sh.__kv={};kv.filter(r=>!r.deleted).forEach(r=>{const k=CLOUD_KV.find(x=>x.id===r.id);if(k){k.set(r.data);sh.__kv[r.id]=chash(k.get());}if(r.updated_at>(marks.store_settings||'')) marks.store_settings=r.updated_at;});}
  finally{Cloud.restoring=false;}
  base.__kv={settings:cloneJ(S.settings)};
  cloudSaveJSON(CLOUD_SHADOW,sh);cloudSaveJSON(CLOUD_MARKS,marks);cloudSaveJSON(CLOUD_BASE,base);cloudSaveJSON(CLOUD_TS,tsR);
  saveStateLocal();
}

// ── scheduler ──
function saveStateLocal(){
  if(Store.blocked) return;
  const json=JSON.stringify(S);
  if(window.mfdDesktop){try{window.mfdDesktop.save(json);}catch(e){}return;}
  Store.save(json);
}
function cloudSchedule(ms){
  if(!cloudReady()||Cloud.state==='signin') return;   // signed out: wait for the sign-in
  clearTimeout(Cloud.timer);Cloud.timer=setTimeout(()=>cloudSync(),ms===undefined?2500:ms);
}
async function cloudSync(opts){
  opts=opts||{};
  if(!cloudReady()) {cloudSetState('off');return false;}
  if(Cloud.busy){Cloud.again=true;return false;}
  if(navigator.onLine===false){cloudSetState('offline','No internet — changes are kept on this device and sent when the connection is back.');return false;}
  Cloud.busy=true;cloudSetState('syncing');
  try{
    // pull first, so changes from other devices are merged in before this device sends its own
    let got=opts.skipPull?0:await cloudPull();
    let sent=await cloudPush();
    for(let round=0;round<3&&cloudPush.conflicts;round++){got+=await cloudPull();sent+=await cloudPush();}
    const c=cloudCfg();c.lastSync=new Date().toISOString();c.lastError='';cloudSaveCfg(c);
    cloudSetState('ok');
    if(opts.toast) toast(sent||got?`Cloud synced — ${sent} sent, ${got} received`:'Cloud is up to date');
    return true;
  }catch(e){
    const c=cloudCfg();c.lastError=e.message;cloudSaveCfg(c);
    cloudSetState(e.offline?'offline':(e.auth?'signin':'error'),e.message);
    if(opts.toast) toast(e.message,true);
    return false;
  }finally{
    Cloud.busy=false;
    if(Cloud.again){Cloud.again=false;cloudSchedule(1500);}
  }
}
function cloudSetState(st,msg){Cloud.state=st;Cloud.msg=msg||'';try{updateCloudBadge();}catch(e){}try{if(document.getElementById('sc-settings')?.classList.contains('on')) renderCloudCard();}catch(e){}}
function cloudWhen(iso){if(!iso) return 'never';const d=new Date(iso);const s=(Date.now()-d)/1000;if(s<60) return 'just now';if(s<3600) return Math.floor(s/60)+' min ago';return d.toLocaleString('en-ZA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}
// sync runs quietly in the background: its status is shown under Settings → Cloud database only
function updateCloudBadge(){
  const el=document.getElementById('sbCloud');if(el) el.style.display='none';
}
function cloudRefreshUI(){
  // the signed-in person's record changed on another device (e.g. their name): show the new one
  try{const u=curUser&&S.users.find(x=>x.id===curUser.id);if(u&&u!==curUser&&u.name!==curUser.name){curUser=u;buildSidebar();}}catch(e){}
  try{renderProds();renderCustSel();updateNavBadge();updateSbFoot();updateSuspBadge();}catch(e){}
  const cur=document.querySelector('.sc.on')?.id?.replace('sc-','');
  if(['home','inventory','customers','suppliers','sales','sellreturns','quotes','delivery','owed','purchases','reports','discounts'].includes(cur)){try{showSc(cur);}catch(e){}}
}
window.addEventListener('online',()=>cloudSchedule(500));
window.addEventListener('offline',()=>{if(cloudReady()) cloudSetState('offline','No internet — changes are kept on this device.');});
setInterval(()=>{if(cloudReady()&&!Cloud.busy&&Cloud.state!=='signin') cloudSync();},15000);   // signed out: wait for the sign-in   // other devices' changes appear within ~15 s
// opening the app or switching back to it fetches other devices' changes straight away
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') cloudSchedule(300);});
window.addEventListener('focus',()=>cloudSchedule(300));
setTimeout(()=>{if(cloudReady()) cloudSync();},4000);
setInterval(()=>{try{updateCloudBadge();}catch(e){}},30000);

// ── Settings card ──
// The owner's MFD POS email and password are also MFD's cloud sign-in (used when a new
// device signs in). Changing one changes the other; the cloud is changed first, so the
// two can never drift apart.
function isCloudOwner(u){
  if(!u||u.role!=='admin'||!cloudReady()) return false;
  const admins=S.users.filter(x=>x.role==='admin'&&x.pwHash);
  return normEmail(u.email)===normEmail(cloudCfg().email)||admins.length===1;
}
async function cloudSetLogin(ch){
  const c=await cloudToken(cloudCfg());const body={};
  if(ch.email&&normEmail(ch.email)!==normEmail(c.email)) body.email=normEmail(ch.email);
  if(ch.password) body.password=ch.password;
  if(!Object.keys(body).length) return {changed:false};
  let r;
  try{r=await fetch(cloudBase(c)+'/auth/v1/user',{method:'PUT',headers:{apikey:c.key,Authorization:'Bearer '+c.access,'Content-Type':'application/json'},body:JSON.stringify(body)});}
  catch(e){throw cloudNetErr(e);}
  if(!r.ok){const e=new Error(await cloudErrText(r));e.cloudHttp=r.status;throw e;}
  const u=await r.json().catch(()=>({}));
  // with email confirmation on, the new email only counts once its link is clicked
  const emailPending=!!(body.email&&normEmail(u.email||'')!==body.email);
  if(body.email&&!emailPending){const k=cloudCfg();k.email=body.email;cloudSaveCfg(k);}
  return {changed:true,emailPending};
}
// owner's change: cloud first, then this device; returns false (and says why) if the cloud refused
async function ownerCloudChange(u,ch){
  if(!isCloudOwner(u)) return true;
  if(navigator.onLine===false){toast('Connect to the internet to change the owner’s email or password — it is also the cloud sign-in.',true);return false;}
  try{
    const r=await cloudSetLogin(ch);
    if(r.emailPending) setTimeout(()=>confirm('Confirm the new email',`The cloud sent a confirmation link to ${ch.email}. Open that email and click the link to finish the change. Until then, new devices still sign in with the old email.`,()=>{},false),400);
    return true;
  }catch(e){toast('The cloud sign-in could not be changed, so nothing was changed: '+e.message,true);return false;}
}
// Settings → Cloud database: make the cloud sign-in match the owner's MFD POS email and password
function cloudMatchLogin(){
  const u=curUser;if(!u||u.role!=='admin'){toast('Only the owner can do this',true);return;}
  askForm('Update the cloud sign-in',[
    {id:'html',type:'html',html:`<div class="yard-auto">New devices sign in with the cloud sign-in. This sets it to your MFD POS email <b>${esc(u.email)}</b> and password, so both are the same.</div>`},
    {id:'pw',type:'password',label:'Your MFD POS password'}],v=>{
      (async()=>{
        if(!await verifySecret(v.pw,u.pwHash,u.pwSalt)){toast('That is not your MFD POS password',true);return;}
        try{const r=await cloudSetLogin({email:u.email,password:v.pw});
          logAudit('Cloud sign-in updated to match the owner login',u.name);renderCloudCard();
          toast(r.emailPending?`Password updated. Check ${u.email} and click the confirmation link to finish the email change.`:'The cloud sign-in now matches your MFD POS email and password');
        }catch(e){toast('Could not update the cloud sign-in: '+e.message,true);}
      })();
    },'Update');
}
function cloudUrlOk(u){return /^https:\/\/[^\s/]+/i.test(u)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(u);}
function renderCloudCard(){
  const box=document.getElementById('cloudBody');if(!box) return;
  const c=cloudCfg();
  // a background sync redraws this card: keep what is being typed
  // (kept across redraws that briefly hide the boxes, e.g. while a sync runs)
  const typed=Cloud.typed=Cloud.typed||{};['cEmail','cPass','cReEmail'].forEach(id=>{const i=document.getElementById(id);if(i) typed[id]={v:i.value,f:document.activeElement===i};});
  renderCloudCardHtml(box,c);
  Object.entries(typed).forEach(([id,t])=>{const i=document.getElementById(id);if(!i) return;i.value=t.v;if(t.f) i.focus();});
  if(c.linked&&Cloud.state!=='signin'&&Cloud.state!=='syncing') Cloud.typed={};
}
function renderCloudCardHtml(box,c){
  // a background sync every few seconds is normal: show it as connected, not as "Syncing…"
  const stLbl={ok:'Connected and up to date',syncing:'Connected and up to date',offline:'Offline — changes are saved here and will be sent later',signin:'Needs sign-in again',error:'Sync problem',off:'Not connected'}[c.linked?Cloud.state:'off'];
  const stCls={ok:'ok',syncing:'ok',offline:'warn',signin:'bad',error:'bad',off:'warn'}[c.linked?Cloud.state:'off'];
  if(c.linked){
    box.innerHTML=`<div class="cloud-st ${stCls}"><i></i><b>${stLbl}</b></div>
      <div class="cloud-meta">Cloud account: <b>${esc(c.email||'')}</b><br>This device: <b>${esc(deviceLabel())}</b>${curUser?.role==='admin'?` · <a href="#" onclick="event.preventDefault();makeMainTill()">${deviceCode()?'make this the main till':'restart the device numbering'}</a>`:''}<br>Last sync: <b>${cloudWhen(c.lastSync)}</b>${c.lastError&&Cloud.state!=='ok'?`<br><span style="color:var(--err)">${esc(c.lastError)}</span>`:''}</div>
      ${Cloud.state==='signin'?`<div style="font-size:12px;color:var(--gd);margin-top:8px">If the owner email was changed, sign in with the new email. Forgot the password? Log out, then use “Forgot password?” → “Email me a reset link”.</div>
      <div class="fr" style="margin-top:6px"><div class="fg"><label>Cloud account email</label><input type="email" id="cReEmail" value="${esc(c.email||'')}" spellcheck="false" autocomplete="username"></div><div class="fg"><label>Cloud account password</label><input type="password" id="cPass" autocomplete="current-password"></div></div>
      <button class="btn" id="cReBtn" style="margin-top:8px" onclick="cloudReSignIn()">Sign in</button>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn" onclick="cloudSync({toast:true})">↻ Sync now</button>
        <button class="btn-s" onclick="cloudAskRestore()"><i class=i-download></i> Restore from cloud</button>
        ${curUser?.role==='admin'?`<button class="btn-s" onclick="cloudMatchLogin()">Update the cloud sign-in</button>`:''}
        <button class="btn-d" onclick="cloudDisconnect()">Disconnect</button>
      </div>`;
  } else {
    box.innerHTML=`<div class="cloud-st warn"><i></i><b>Not connected</b> — everything is saved on this device only.</div>
      <div class="fr"><div class="fg"><label>Cloud account email</label><input type="email" id="cEmail" value="${esc(c.email||curUser?.email||'')}" spellcheck="false"></div>
      <div class="fg"><label>Cloud account password</label><input type="password" id="cPass" autocomplete="current-password"></div></div>
      <div style="font-size:11.5px;color:var(--g);margin:2px 0 10px">Use the owner’s email and password (the MFD cloud account has the same ones), so new devices can sign in straight away. The password is used once and is not stored.</div>
      <button class="btn" id="cBtn" onclick="cloudConnect()">Connect</button>`;
  }
}
async function cloudConnect(){
  const prev0=cloudCfg(),url=prev0.url||CLOUD_DEFAULT.url,key=prev0.key||CLOUD_DEFAULT.key;
  const email=normEmail(document.getElementById('cEmail').value),pw=document.getElementById('cPass').value;
  if(!cloudUrlOk(url)){toast('Enter the project URL, starting with https://',true);return;}
  if(key.length<20){toast('Paste the anon public key',true);return;}
  if(!validEmail(email)||!pw){toast('Enter the cloud account email and password',true);return;}
  setBusy('cBtn',true,'Connecting…');
  const prev=cloudCfg();
  cloudSaveCfg({...prev,url,key,email,linked:false});
  try{
    const c={url,key,email};
    await cloudAuth(c,'password',{email,password:pw});
    if(prev.uid&&prev.uid!==c.uid){cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});}
    // is there already data in this cloud account?
    const r=await cloudReq('staff?select=id&limit=1',{method:'GET'});const has=(await r.json()).length>0;
    const r2=await cloudReq('sales?select=id&limit=1',{method:'GET'});const hasSales=(await r2.json()).length>0;
    if(!has&&!hasSales){
      if(!deviceInfo()) setDevice('',true);              // first device in an empty cloud = the main till
      c.linked=true;cloudSaveCfg(c);cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});
      logAudit('Connected to the cloud database ('+cloudBase(c)+')',curUser?.name||'');
      renderCloudCard();toast('Connected — uploading this device’s data…');
      await cloudSync({toast:true,skipPull:true});
    } else {
      cloudSaveCfg(c);openCloudChoice();
    }
  }catch(e){
    if(e.auth&&/invalid login/i.test(e.message)){
      const chk=await cloudAccountCheck(email);
      toast(chk.owner&&!chk.email?`Cloud sign-in failed: ${email} is not the MFD cloud account. If the owner email was changed, sign in with the new owner email.`:'Cloud sign-in failed: the email or password is wrong. If the owner email was changed, use the new email; forgot the password? Log out and use “Forgot password?”.',true);
    } else toast(e.auth?('Cloud sign-in failed: '+e.message):e.message,true);
  }
  finally{setBusy('cBtn',false);renderCloudCard();}
}
function openCloudChoice(){openMo('cloudChoiceMo');}
async function cloudChooseUpload(){
  closeMo('cloudChoiceMo');
  try{await cloudClaimDevice();}catch(e){toast(e.message,true);return;}
  const c=cloudCfg();c.linked=true;cloudSaveCfg(c);
  cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});
  logAudit('Connected to the cloud database and uploaded this device ('+cloudBase(c)+')',curUser?.name||'');
  // if the test data was cleared in the cloud meanwhile, this till's copy is cleared first, not uploaded again
  renderCloudCard();await cloudSync({toast:true});
}
// give this device its own letter (B, C…) unless it is the main till; the list lives in the cloud
async function cloudClaimDevice(){
  const d=deviceInfo();if(d&&(d.main||d.code)) return deviceCode();
  // two devices may claim at the same moment (e.g. right after the numbering was restarted): the list
  // is only written if nobody changed it since it was read, otherwise it is read again
  for(let attempt=0;attempt<8;attempt++){
    const r=await cloudReq('store_settings?select=data,updated_at&id=eq.devices',{method:'GET'});const j=await r.json();
    const row=j[0]||null,dv=(row&&row.data)||{};const list=Array.isArray(dv.list)?dv.list:[];
    const used=new Set(list.map(x=>x.code));let code='';
    for(let i=66;i<=90;i++){const ch=String.fromCharCode(i);if(!used.has(ch)){code=ch;break;}}
    if(!code) throw new Error('No device letters left (B to Z are all in use)');
    const data={...dv,list:[...list,{code,joined:new Date().toISOString(),agent:String(navigator.userAgent||'').slice(0,120)}]};
    const w=row
      ?await cloudReq(`store_settings?id=eq.devices&updated_at=eq.${encodeURIComponent(row.updated_at)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({data,deleted:false})})
      :await cloudReq('store_settings?on_conflict=owner_id,id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify([{id:'devices',data,deleted:false}])});
    const done=await w.json().catch(()=>[]);
    if(Array.isArray(done)&&done.length){setDevice(code,false,dv.gen||0);return code;}
    await new Promise(res=>setTimeout(res,150+Math.random()*350));   // someone else just took a letter: try again
  }
  throw new Error('Could not get a device letter right now — try again');
}
// the device numbering was restarted on another device: this one gives up its old letter and takes a new one
function cloudCheckDevices(d){
  const me=deviceInfo();if(!d||!me||!(d.gen>(me.gen||0))||d.mainId===me.id) return;
  try{localStorage.setItem(DEVICE_KEY,JSON.stringify({id:me.id,code:'',main:false,gen:me.gen||0,claim:true,set:new Date().toISOString()}));}catch(e){}
}
// this device becomes the main till (numbers like INV-001) and the device list starts again: every
// other device drops its old letter at its next sync and takes a new one (B, C…), so no two devices
// can ever print the same number
function makeMainTill(){
  confirm('Make this the main till','This device becomes the main till: its numbers look like INV-001. The list of devices starts again, and every other device takes a new letter (B, C…) at its next sync. Continue?',()=>reqAdmin('Admin PIN required',async()=>{
    if(cloudReady()){
      if(navigator.onLine===false){toast('Connect to the internet first, so the other devices are told',true);return;}
      try{
        const r=await cloudReq('store_settings?select=data&id=eq.devices',{method:'GET'});const j=await r.json();
        const gen=(((j[0]&&j[0].data)||{}).gen||0)+1;
        setDevice('',true,gen);
        await cloudReq('store_settings?on_conflict=owner_id,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{id:'devices',data:{list:[],gen,mainId:deviceInfo().id,reset:new Date().toISOString()},deleted:false}])});
      }catch(e){toast('Could not restart the device list: '+e.message,true);return;}
    } else setDevice('',true);
    logAudit('This device was made the main till; device numbering restarted',curUser?.name||'');renderCloudCard();toast('This is now the main till — numbers look like INV-001');
  }),false);
}
async function cloudChooseRestore(){
  closeMo('cloudChoiceMo');const c=cloudCfg();c.linked=true;cloudSaveCfg(c);
  await cloudDoRestore();
}
function cloudAskRestore(){
  confirm('Restore from cloud','This replaces everything on this device with the data in the cloud. Anything on this device that has not synced yet will be lost. Continue?',()=>reqAdmin('Admin PIN required to restore from the cloud',cloudDoRestore));
}
async function cloudDoRestore(){
  if(Cloud.busy){toast('A sync is running — try again in a moment',true);return;}
  Cloud.busy=true;cloudSetState('syncing');toast('Downloading from the cloud…');
  try{
    await cloudClaimDevice();
    await cloudRestoreAll();
    const c=cloudCfg();c.lastSync=new Date().toISOString();c.lastError='';cloudSaveCfg(c);
    Cloud.busy=false;cloudSetState('ok');
    logAudit('Restored all data from the cloud',curUser?.name||'');saveStateLocal();
    toast('Restored from the cloud — please sign in again');
    setTimeout(()=>{logout();},900);
  }catch(e){Cloud.busy=false;cloudSetState(e.offline?'offline':'error',e.message);toast(e.message,true);}
}
async function cloudReSignIn(){
  const prev=cloudCfg(),c={...prev};
  const email=normEmail(document.getElementById('cReEmail')?.value||c.email),pw=document.getElementById('cPass')?.value;
  if(!validEmail(email)){toast('Enter the cloud account email',true);return;}
  if(!pw){toast('Enter the cloud account password',true);return;}
  setBusy('cReBtn',true,'Signing in…');
  try{
    await cloudAuth(c,'password',{email,password:pw});
    // the same cloud account only (its email may have changed): another account would mix two businesses' data
    if(prev.uid&&c.uid!==prev.uid){
      // another account than this device used before (e.g. the owner's account was made again): switch to it
      // by taking that account's data, never by mixing this device's records into it
      cloudSaveCfg(prev);
      confirm('Switch cloud account',`${email} is a different cloud account from the one this device used before. Switch this device to it? Everything on this device is replaced with that account's data (Restore from cloud).`,()=>reqAdmin('Admin PIN required to switch the cloud account',()=>{
        cloudSaveCfg({...c,linked:true});
        cloudSaveJSON(CLOUD_SHADOW,{});cloudSaveJSON(CLOUD_MARKS,{});cloudSaveJSON(CLOUD_BASE,{});cloudSaveJSON(CLOUD_TS,{});
        logAudit(`Cloud account switched to ${email}`,curUser?.name||'');cloudDoRestore();
      }),false);
      return;
    }
    toast('Signed in to the cloud');cloudSync({toast:true});
  }catch(e){
    toast('Cloud sign-in failed: '+(/invalid login/i.test(e.message)?'the email or password is wrong. If the owner email was changed, use the new email.':e.message),true);
  }finally{setBusy('cReBtn',false);}
}
function cloudDisconnect(){
  confirm('Disconnect cloud','Stop syncing this device with the cloud? Data stays on this device and in the cloud. Changes made while disconnected are sent if you connect again.',()=>{
    const c=cloudCfg();delete c.access;delete c.refresh;delete c.exp;c.linked=false;cloudSaveCfg(c);
    logAudit('Disconnected from the cloud database',curUser?.name||'');
    cloudSetState('off');renderCloudCard();toast('Cloud disconnected');
  });
}

function paintBrand(){const l=document.getElementById('loginMark');if(l&&!l.firstChild) l.innerHTML=mfdLogo('gold');const m=document.getElementById('mtopMark');if(m&&!m.firstChild) m.innerHTML=mfdLogo('gold',{compact:1});}

// ═══════════════════════════════════════
// APP INSTALL + OFFLINE (active when hosted on pos.mfdbricksandsand.co.za)
// ═══════════════════════════════════════
function updateNetUI(){
  const on=navigator.onLine!==false;
  const el=document.getElementById('sbNet');
  let linked=false;try{linked=!!cloudCfg().linked;}catch(e){}
  if(el){el.hidden=on||linked;if(!on) el.innerHTML='<b>● Offline</b>Keep selling. Sales save on this laptop.';}
  const m=document.getElementById('mtopShift');if(m) m.classList.toggle('off',!on);
}
window.addEventListener('online',()=>{updateNetUI();toast('Back online');});
window.addEventListener('offline',()=>{updateNetUI();toast('Offline. Sales still save on this laptop',true);});
let _installEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();_installEvt=e;const b=document.getElementById('installBtn');if(b) b.hidden=false;});
window.addEventListener('appinstalled',()=>{_installEvt=null;const b=document.getElementById('installBtn');if(b) b.hidden=true;toast('MFD POS installed. Open it from the desktop icon');});
function installApp(){
  if(!_installEvt){toast('Use the install icon in the Chrome address bar');return;}
  _installEvt.prompt();_installEvt.userChoice.finally(()=>{_installEvt=null;const b=document.getElementById('installBtn');if(b) b.hidden=true;});
}
// the update is put in by itself as soon as the till is idle (no sale in progress, no window
// open, nobody typing); until then the bar lets the cashier update when ready
function tillIdle(){
  const a=document.activeElement;
  return !(cart&&cart.length)&&!document.querySelector('.ov.on,.conf-ov.on,.apin-ov.on')&&!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))&&!(Store.busy||Store.next!==null);
}
function offerUpdate(reg){
  const apply=()=>{if(reg.waiting) reg.waiting.postMessage('skipWaiting');};
  if(tillIdle()){apply();return;}
  showUpdateBar(reg);
  const t=setInterval(()=>{if(!reg.waiting){clearInterval(t);return;}if(tillIdle()){clearInterval(t);apply();}},15000);
}
function showUpdateBar(reg){
  if(document.getElementById('appUpd')) return;
  const d=document.createElement('div');d.className='app-upd';d.id='appUpd';
  d.innerHTML='<span>A new version of MFD POS is ready. Finish the current sale, then update.</span><button>Update now</button>';
  d.querySelector('button').onclick=()=>{if(reg.waiting) reg.waiting.postMessage('skipWaiting');};
  document.body.appendChild(d);
}
(function registerSW(){
  try{
    if(!('serviceWorker' in navigator)) return;
    if(window.top!==window.self) return;              // inside a preview frame: skip
    if(!/^https:$/.test(location.protocol)&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    navigator.serviceWorker.register('sw.js').then(reg=>{
      if(reg.waiting&&navigator.serviceWorker.controller) offerUpdate(reg);
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w) return;
        w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller) offerUpdate(reg);});});
      // a new version reaches every device within about 2 minutes, and straight away when the app is opened or clicked into
      const check=()=>{if(navigator.onLine!==false) reg.update().catch(()=>{});};
      setInterval(check,2*60*1000);
      window.addEventListener('focus',check);
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') check();});
    }).catch(()=>{});
    // reload only when a newer version takes over; the very first install keeps the page as it is
    // (it is already the current version, and a reload would lose what is being typed)
    let reloaded=false,hadCtl=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloaded) return;if(!hadCtl){hadCtl=true;return;}reloaded=true;location.reload();});
  }catch(e){}
})();

const IS_LIVE=/^https:$/.test(location.protocol)&&!/localhost|127\.0\.0\.1/i.test(location.hostname);
if(IS_LIVE) document.documentElement.classList.add('live');
async function renderStoreInfo(){
  const el=document.getElementById('storeInfo');if(!el) return;
  if(window.mfdDesktop){el.innerHTML='';return;}
  const i=await storageInfo(),bytes=Store.bytes||JSON.stringify(S).length;
  const size=bytes<1024?`${bytes} bytes`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(2)} MB`;
  const n=(a,w,pl)=>`${(a||[]).length.toLocaleString('en-ZA')} ${(a||[]).length===1?w:(pl||w+'s')}`;
  let cloud=false;try{cloud=!!cloudCfg().linked;}catch(e){}
  el.innerHTML=`<div><b>Saved on this device:</b> ${size} · ${Store.ready?'secure browser database':'basic browser storage'}</div>
  <div style="font-size:12px;color:var(--g)">${n(S.transactions,'sale')} · ${n(S.products,'product')} · ${n(S.customers,'customer')} · ${n(S.quotes,'quote')} · ${n(S.deliveries,'delivery','deliveries')}${Store.savedAt?` · last saved ${cloudWhen(Store.savedAt)}`:''}</div>
  <div><b>Protected from clearing:</b> ${i.persisted?'Yes':'Not yet. Install MFD POS as an app to protect it'}</div>
  <div><b>Cloud copy:</b> ${cloud?'Yes, synced to the cloud database':'No. Download a backup at least once a day'}</div>`;
}
window.onload=async function(){
  paintBrand();
  if(!window.mfdDesktop){
    const raw=await Store.init();
    if(raw) S=loadState(raw);
    else if(Store.ready){let ls=null;try{ls=localStorage.getItem('mfd_pos_v1');}catch(e){} if(ls){try{await Store.put('state',ls);}catch(e){}}}
    const ok=await OneWin.claim(false);
    if(!ok){Store.blocked=true;showWinBlock(false);}
  }
  initLogin();updateNetUI();
  if(Store.blocked) return;
  window.addEventListener('hashchange',()=>{if(isResetReturn()) startEmailReset();});   // link opened in a tab that already had the app
  if(isResetReturn()){startEmailReset();return;}   // opened from the password-reset email
  try{
    const ss=JSON.parse(sessionStorage.getItem('mfd_sess')||'null');
    const mins=parseInt(S.settings.autoLockMinutes)||0;
    const fresh=ss&&(Date.now()-ss.t)<((mins>0?mins:480)*60000);
    const u=fresh&&S.users.find(x=>x.id===ss.id&&x.pwHash&&!x.mustChange);
    if(u){
      completeLogin(u,true);
      const c=JSON.parse(sessionStorage.getItem('mfd_cart')||'null');
      if(c&&Array.isArray(c.cart)&&c.cart.length){
        cart=c.cart.filter(it=>S.products.some(p=>p.id===it.id));
        if(c.cust){const sel=document.getElementById('custSel');if(sel){sel.value=String(c.cust);onCustSelect();}}
        renderCart();showSc('pos');toast('Your sale was kept after the refresh');
      }
    }
  }catch(e){}
};
