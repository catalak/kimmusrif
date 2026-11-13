
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TL=n=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:0}).format(Math.round(n||0))+' ₺';
const INC=['Ek gelir','Kira geliri','Diğer gelir'];
const NEWC=[['market','Market'],['disari','Dışarda yeme'],['ulasim','Ulaşım'],['giyim','Giyim'],['saglik','Sağlık'],['cocuk','Çocuk'],['fatura','Fatura'],['bakim','Bakım'],['eglence','Eğlence-tatil'],['konut','Konut'],['borc','Borç-taksit'],['diger','Diğer']];
const NEWP=[['p1','Ben'],['p2','Eşim'],['aile','Tüm aile']];
const mkL=a=>a.map(x=>({id:x[0],name:x[1]}));
const PL=()=>S.people||[],CL=()=>S.cats||[];
const wn=id=>{const p=PL().find(x=>x.id===id);return p?p.name:String(id||'')};
const cn=id=>{const c=CL().find(x=>x.id===id);return c?c.name:String(id||'')};
const optI=(a,v)=>a.map(x=>`<option value="${esc(x.id)}"${x.id===v?' selected':''}>${esc(x.name)}</option>`).join('');
const dcat=id=>CL().some(c=>c.id===id)?id:(CL()[0]||{}).id;
const cutOf=d=>d>10?d-10:Math.min(d+20,28);
function mig(s){if(!s.people){s.people=mkL(NEWP);s.cats=mkL(NEWC)}
 s.stmts=s.stmts||[];s.isrc=s.isrc||DI();if(!s.accts||!s.accts.length){s.accts=[{id:'h1',name:'Ana hesap',bal:0,bm:today.slice(0,7)}];s.defAcct='h1'}s.assets=s.assets||[];s.isrc.forEach(x=>{if(x.day===undefined)x.day=0});(s.debts||[]).forEach(d=>{if(d.kind!=='kredi'&&!d.tur){d.tur='TL';d.miktar=d.balance||0;d.kur=1}});(s.cards||[]).forEach(c=>{if(c.stmt>0)s.stmts.push({id:'m'+c.id,card:c.id,dt:sdue(c),amt:c.stmt,odenen:c.paid?c.stmt:(c.odenen||0)});c.stmt=0;c.paid=false;c.odenen=0;c.stmtDue='';c.cut=cutOf(c.due);});s.stmts=s.stmts.filter(x=>x.amt>0||x.odenen>0||x.d>0);s.stmts.forEach(x=>{if(x.d===undefined)x.d=x.amt>0&&x.odenen>=x.amt?2:(x.odenen>0?3:0)});return s}
const MN=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const NUM=new Set(['amt','cut','due','stmt','balance','month','ben','es','pay','day','odenen','inst','miktar','kur','bal']);
const pd=s=>({y:+s.slice(0,4),m:+s.slice(5,7)-1,d:+s.slice(8,10)});
const mk=(y,m)=>y*12+m;
const mkd=s=>{const p=pd(s);return mk(p.y,p.m)};
const inPer = (dt, M) => {
  const day = S.payDay || 1;
  if (day === 1) return mkd(dt) === M;
  
  function demoData(){
 const M=nowM(),dt=(m,d)=>{const y=Math.floor(m/12),mo=m%12;return y+'-'+String(mo+1).padStart(2,'0')+'-'+String(Math.min(d,28)).padStart(2,'0')};
 const inc={};
 [M-2,M-1,M].forEach((k,idx)=>{inc[ikey(k)]={ben:68000,es:54000,bene:idx===1?12000:0}});
 const tx=[
  // 2 Ay Önce (Eylül)
  {id:'d1',type:'out',date:dt(M-2,4),amt:6400,cat:'market',who:'aile',pay:'k1',inst:1,note:'Aylık büyük market'},
  {id:'d2',type:'out',date:dt(M-2,7),amt:4200,cat:'cocuk',who:'aile',pay:'k1',inst:2,note:'Defne okul kırtasiye & çanta'},
  {id:'d3',type:'out',date:dt(M-2,11),amt:7850,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep sonbahar gardırop'},
  {id:'d4',type:'out',date:dt(M-2,14),amt:2400,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d5',type:'out',date:dt(M-2,18),amt:3100,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Arkadaşlarla brunch & kahve'},
  {id:'d6',type:'out',date:dt(M-2,22),amt:2650,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Kuaför & cilt bakımı'},
  {id:'d7',type:'out',date:dt(M-2,26),amt:2900,cat:'market',who:'aile',pay:'cash',inst:1,note:'Haftalık pazar & kasap'},
  // Geçen Ay (Ekim)
  {id:'d8',type:'out',date:dt(M-1,3),amt:6900,cat:'market',who:'aile',pay:'k1',inst:1,note:'Market alışverişi'},
  {id:'d9',type:'out',date:dt(M-1,6),amt:3400,cat:'cocuk',who:'aile',pay:'k1',inst:1,note:'Emir bez & mama + kreş'},
  {id:'d10',type:'out',date:dt(M-1,9),amt:9400,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep trençkot & bot'},
  {id:'d11',type:'out',date:dt(M-1,12),amt:4600,cat:'eglence',who:'p2',pay:'k2',inst:2,note:'Hafta sonu aile kaçamağı'},
  {id:'d12',type:'out',date:dt(M-1,16),amt:2600,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d13',type:'out',date:dt(M-1,20),amt:3650,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Dışarda akşam yemeği & tatlı'},
  {id:'d14',type:'out',date:dt(M-1,24),amt:1850,cat:'giyim',who:'p1',pay:'k1',inst:1,note:'Kerem gömlek'},
  {id:'d15',type:'out',date:dt(M-1,27),amt:3200,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Kozmetik yenileme'},
  // Bu Ay (Kasım)
  {id:'d16',type:'out',date:dt(M,2),amt:7100,cat:'market',who:'aile',pay:'k1',inst:1,note:'Mutfak alışverişi'},
  {id:'d17',type:'out',date:dt(M,5),amt:8600,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep çanta & triko'},
  {id:'d18',type:'out',date:dt(M,8),amt:3800,cat:'cocuk',who:'aile',pay:'k1',inst:1,note:'Defne yüzme kursu & Emir oyuncak'},
  {id:'d19',type:'out',date:dt(M,10),amt:2950,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Kahve, pasta & öğle yemekleri'},
  {id:'d20',type:'out',date:dt(M,11),amt:2500,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d21',type:'out',date:dt(M,12),amt:2400,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Bakım & spa paketi'}
 ];
 return {
  people:[{id:'p1',name:'Kerem'},{id:'p2',name:'Zeynep'},{id:'aile',name:'Tüm aile'}],
  cats:mkL(NEWC),
  accts:[{id:'h1',name:'Ortak Maaş Hesabı',bal:42000,bm:ikey(M-2)}],
  defAcct:'h1',
  assets:[{name:'Kenardaki Gram Altın',tur:'Gram altın',miktar:18,kur:3050}],
  isrc:[
   {id:'ben',name:'Kerem maaş',ff:1,day:15,acct:'h1'},
   {id:'es',name:'Zeynep maaş',ff:1,day:15,acct:'h1'},
   {id:'bene',name:'Ek ders / Prim',ff:0,day:20,acct:'h1'}
  ],
  inc, incMode:'matrix', m:M, mode:'cash', extra:15000,
  cards:[
   {id:'k1',name:'Ortak Kart (Bonus)',cut:5,due:15,stmt:0,stmtDue:''},
   {id:'k2',name:'Zeynep Kart (World)',cut:12,due:22,stmt:0,stmtDue:''}
  ],
  stmts:[
   {id:'st1',card:'k1',dt:dt(M-1,15),amt:14800,asg:5920,d:2,odenen:14800},
   {id:'st2',card:'k2',dt:dt(M-1,22),amt:16900,asg:6760,d:2,odenen:16900},
   {id:'st3',card:'k1',dt:dt(M,15),amt:15400,asg:6160,d:0,odenen:0},
   {id:'st4',card:'k2',dt:dt(M,22),amt:18750,asg:7500,d:0,odenen:0}
  ],
  fixed:[
   {name:'Site Aidatı',amt:3500,cat:'konut',who:'aile',day:5,acct:'h1'},
   {name:'Elektrik + Su + Doğalgaz',amt:3400,cat:'fatura',who:'aile',day:18,acct:'h1'},
   {name:'İnternet & Telefonlar',amt:1450,cat:'fatura',who:'aile',day:20,acct:'h1'},
   {name:'Defne & Emir Kreş/Etüt',amt:9500,cat:'cocuk',who:'aile',day:10,acct:'h1'}
  ],
  yearly:[
   {name:'Araç Kasko & Trafik',amt:16500,cat:'ulasim',who:'aile',month:4,day:12,pm:'k1',inst:3},
   {name:'DASK & Konut Sigortası',amt:3200,cat:'konut',who:'aile',month:9,day:5,pm:'cash',inst:1}
  ],
  debts:[
   {name:'Ziraat Konut Kredisi',kind:'kredi',pay:28500,day:16,end:ikey(M+84),acct:'h1'},
   {name:'Garanti İhtiyaç Kredisi',kind:'kredi',pay:9200,day:18,end:ikey(M+14),acct:'h1'}
  ],
  tx
 };
}
  const p = pd(dt);
  return (p.d >= day ? mk(p.y, p.m) : mk(p.y, p.m) - 1) === M;
};

const ml=k=>MN[k%12]+' '+Math.floor(k/12);
const today=new Date().toISOString().slice(0,10);
const DI=()=>[{id:'ben',name:'Ben maaş',ff:1},{id:'bene',name:'İkramiye',ff:0},{id:'es',name:'Eşim maaş',ff:1},{id:'ek',name:'Ek gelir',ff:0},{id:'kira',name:'Kira geliri',ff:1},{id:'dig',name:'Diğer gelir',ff:0}];
const def=()=>({isrc:DI(),m:mk(2026,10),mode:'cash',extra:0,sal:{ben:0,es:0},
 cards:[[5,15],[15,25]].map((c,i)=>({id:'k'+(i+1),name:'Kart '+(i+1),cut:c[0],due:c[1],stmt:0,stmtDue:''})),
 fixed:[],yearly:[],debts:[],tx:[],stmts:[]});
let S=def(),tab=1,F={type:'out',date:today,cat:null,who:'aile',pay:'cash'};
let ST='Değişiklikler otomatik kaydedilir',EI=-1;
function stat(t){ST=t;const e=$('#st');if(e)e.textContent=t}
function save(){stat('Kaydediliyor…');Store.save(S).then(()=>stat('Kaydedildi ('+Store.label()+')')).catch(e=>stat('Kaydedilemedi'+(e&&e.message?': '+e.message:'')))}

const card=id=>S.cards.find(c=>c.id===id);
const pn=id=>id==='cash'?'Nakit':(card(id)?card(id).name:'?');
const opt=(a,v)=>a.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('');
const sum=a=>a.reduce((x,y)=>x+y,0);
const YY=()=>S.yy||new Date().getFullYear();
const yA=(y,Y)=>{const a=y.ya||{};if(a[Y]!==undefined)return a[Y];const ks=Object.keys(a).map(Number).filter(k=>k<Y).sort((p,q)=>q-p);return ks.length?a[ks[0]]:y.amt};
function yset(i,v){const y=S.yearly[i];y.ya=y.ya||{};y.ya[YY()]=parseFloat(v)||0;save()}
const yvs=ys=>S.yearly.flatMap(y=>ys.map(Y=>({id:'y',type:'out',date:Y+'-'+String(y.month||1).padStart(2,'0')+'-'+String(Math.min(y.day||15,28)).padStart(2,'0'),amt:yA(y,Y),cat:y.cat,who:y.who,pay:y.pm||'cash',inst:y.inst||1})));
const yv=M=>yvs([Math.floor(M/12)-1,Math.floor(M/12)]);
const AX=()=>{const Y=Math.floor(nowM()/12);return[...S.tx,...yvs([Y-1,Y,Y+1])]};
const paidOf=c=>c.paid?c.stmt:Math.min(c.odenen||0,c.stmt);
function sdue(c){if(c.stmtDue)return c.stmtDue;const n=pd(today),cm=mk(n.y,n.m)-(n.d>c.cut?0:1),dm=cm+(c.due>c.cut?0:1),y=Math.floor(dm/12),m=dm%12,d=Math.min(c.due,new Date(y,m+1,0).getDate());return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function cardNm(c){const n=pd(today);return mk(n.y,n.m)+(n.d>c.cut?1:0)}
function inst(t){const c=card(t.pay);if(!c)return[];const p=pd(t.date),n=t.inst||1,r=[];
 for(let i=0;i<n;i++){const sm=mk(p.y,p.m)+i+(p.d>c.cut?1:0);r.push({sm,k:sm+(c.due>c.cut?0:1),a:t.amt/n,c})}return r}
const sPaid=x=>x.d===2?x.amt:x.d===1?(x.asg||x.amt*.4):(x.d===3?(x.odenen||0):0);
const carry=(c,M)=>sum(S.stmts.filter(x=>x.card===c.id&&mkd(x.dt)===M-1&&x.amt>0&&(x.d===1||x.d===3)).map(x=>Math.max(0,x.amt-sPaid(x))));
function cardEst(c,M){let a=0;[...S.tx,...yv(M)].forEach(t=>{if(t.pay===c.id&&t.type!=='in')inst(t).forEach(x=>{if(x.k===M)a+=x.a})});return a}
const defDt=(c,M)=>{const y=Math.floor(M/12),m=M%12;return y+'-'+String(m+1).padStart(2,'0')+'-'+String(Math.min(c.due,new Date(y,m+1,0).getDate())).padStart(2,'0')};
function sset(cid,f,v){let j=S.stmts.findIndex(x=>x.card===cid&&mkd(x.dt)===S.m);
 if(j<0){S.stmts.push({id:'s'+Date.now()+cid,card:cid,dt:defDt(card(cid),S.m),amt:0,asg:0,d:0,odenen:0});j=S.stmts.length-1}
 S.stmts[j][f]=(f==='dt'||f==='acct')?v:(f==='d'?+v:(parseFloat(v)||0));save();render()}
const cardSure=(c,M)=>sum(S.stmts.filter(x=>x.card===c.id&&mkd(x.dt)===M&&(x.amt>0||x.odenen>0)).map(x=>sPaid(x)||x.amt));
const cardTah=(c,M)=>S.stmts.some(x=>x.card===c.id&&mkd(x.dt)===M&&(x.amt>0||x.odenen>0))?0:cardEst(c,M)+carry(c,M);
function cardDue(c,M){const st=S.stmts.filter(x=>x.card===c.id&&mkd(x.dt)===M&&(x.amt>0||x.odenen>0));
 if(st.length)return sum(st.map(x=>sPaid(x)||x.amt));
 return cardEst(c,M)+carry(c,M)}
const ymk=s=>{const p=String(s).split('-');return mk(+p[0],+p[1]-1)};
const nowM=()=>mkd(today);
const on=(f,M)=>(!f.from||ymk(f.from)<=M)&&(!f.to||M<=ymk(f.to));
const loanOn=(d,M)=>d.pay>0&&d.end&&M>=nowM()&&M<=ymk(d.end);
const loanLeft=d=>d.pay>0&&d.end?d.pay*Math.max(0,ymk(d.end)-nowM()+1):0;
const ffOf=f=>{const x=(S.isrc||[]).find(y=>y.id===f);return !!(x&&x.ff)};
const ikey=k=>Math.floor(k/12)+'-'+String(k%12+1).padStart(2,'0');
function iv(M,f){const e=S.inc||{};for(let k=M,n=0;n<36;k--,n++){const v=(e[ikey(k)]||{})[f];if(v!==undefined)return v;if(!ffOf(f))break}return 0}
const incM=M=>sum((S.isrc||[]).map(x=>iv(M,x.id)));
function setInc(k,f,v){S.inc=S.inc||{};const o=S.inc[ikey(k)]=S.inc[ikey(k)]||{};if(v==='')delete o[f];else o[f]=parseFloat(v)||0;save();
 document.querySelectorAll('input[data-f]').forEach(i=>{const K=+i.dataset.k,g=i.dataset.f;if(ffOf(g))i.placeholder=iv(K,g)||'';const t=document.getElementById('t'+K);if(t)t.innerHTML='<b>'+TL(incM(K))+'</b>'})}
function vGelir(){const s=nowM()+(S.io||0),rows=[],src=S.isrc||[];
 for(let k=s;k<s+12;k++){const e=(S.inc||{})[ikey(k)]||{};rows.push(`<tr><td>${ml(k)}</td>${src.map(x=>`<td><input data-k=${k} data-f=${x.id} style="width:86px;padding:5px 6px;font-size:13px" type=number step=any value="${e[x.id]??''}" placeholder="${x.ff?iv(k,x.id)||'':''}" onchange="setInc(${k},'${x.id}',this.value)"></td>`).join('')}<td id=t${k}><b>${TL(incM(k))}</b></td></tr>`)}
 return `<div class=sec><h2>Aylık gelirler (net, hesaba geçen)</h2>
 <div class=row><button class=b onclick="S.io=(S.io||0)-12;save();render()">Önceki 12 ay</button><button class=b onclick="S.io=(S.io||0)+12;save();render()">Sonraki 12 ay</button></div>
 <div class=wrap><table class=sm><thead><tr><th>Ay</th>${src.map(x=>`<th>${esc(x.name)}</th>`).join('')}<th>Toplam</th></tr></thead><tbody>${rows.join('')}</tbody></table></div></div>
 <div class=sec><h2>Gelir kalemleri</h2><p class=mut>Her kalemi istediğin gibi adlandır. "Her ay devam etsin" işaretliyse (maaş, kira geliri gibi) boş bıraktığın aylarda önceki ayın tutarı geçerli olur. İşaretli değilse (ikramiye, ek gelir gibi) sadece yazdığın ayda sayılır.</p>
 ${src.map((x,i)=>`<div class=row><input style="flex:2;min-width:160px" value="${esc(x.name)}" onchange="U('isrc',${i},'name',this.value,1)"><input type=number min=1 max=31 placeholder="Ayın kaçı" title="Ayın kaçında yatıyor" style="width:110px" value="${x.day||''}" onchange="U('isrc',${i},'day',this.value)">${acSel('isrc',i,x.acct)}<label style="display:flex;gap:6px;align-items:center;color:var(--ink);font-size:14px"><input type=checkbox style="width:auto" ${x.ff?'checked':''} onchange="S.isrc[${i}].ff=this.checked?1:0;save();render()">Her ay devam etsin</label><button class=b onclick="del('isrc',${i})">Sil</button></div>`).join('')}
 <button class=b onclick="S.isrc.push({id:'g'+Date.now(),name:'Yeni gelir',ff:0});save();render()">Gelir kalemi ekle</button></div>`}
function calc(M){
 const ex=S.tx.filter(t=>t.type!=='in'),yr=S.yearly.filter(y=>y.month-1===M%12).map(y=>({...y,amt:yA(y,Math.floor(M/12))})),fx=S.fixed.filter(f=>on(f,M)),ln=S.debts.filter(d=>d.kind==='kredi'&&loanOn(d,M));
 const inc=incM(M)+sum(S.tx.filter(t=>t.type==='in'&&inPer(t.date, M)).map(t=>t.amt));
 const items=[...ex.filter(t=>inPer(t.date, M)),...fx,...yr,...ln.map(d=>({cat:'borc',who:'aile',amt:d.pay}))].map(t=>({cat:t.cat,who:t.who,a:t.amt}));
 const cash=sum(ex.filter(t=>t.pay==='cash'&&inPer(t.date, M)).map(t=>t.amt))+sum(fx.map(f=>f.amt))+sum(ln.map(d=>d.pay))+sum(yr.filter(f=>!f.pm||f.pm==='cash').map(f=>f.amt))+sum(S.cards.map(c=>cardSure(c,M)));
 const est=sum(S.cards.map(c=>cardTah(c,M)));
 return{inc,items,spend:sum(items.map(i=>i.a)),cash,est,fixed:sum(fx.map(f=>f.amt))+sum(ln.map(d=>d.pay))}}

function U(k,i,f,v,r){const o=i==null?S[k]:S[k][i];if(k==='fixed'&&(f==='from'||f==='to')){const a=f==='from'?v:o.from,b=f==='to'?v:o.to;if(a&&b&&b<a){render();stat('Bitiş ayı başlangıçtan önce olamaz');return}}o[f]=NUM.has(f)?(parseFloat(v)||0):v;if(k==='cards'&&f==='due')o.cut=cutOf(o.due);if((k==='debts'||k==='assets')&&f==='kur')o.kt=today;if((k==='debts'||k==='assets')&&f==='tur'){if(v==='TL')o.kur=1;else if(o.kur===1)o.kur=0}save();if(r)render()}
function del(k,i){if(k==='tx')EI=-1;S[k].splice(i,1);save();render()}
function zam(i){const f=S.fixed[i],n=nowM()+1,s=k=>Math.floor(k/12)+'-'+String(k%12+1).padStart(2,'0');S.fixed.splice(i+1,0,{...f,from:s(n),to:''});if(!f.from||f.from<=s(n-1))f.to=s(n-1);save();render()}
function snap(){F.date=$('#dt').value;F.amt=$('#am').value;F.cat=$('#ca').value;F.note=$('#nt').value;if($('#wh'))F.who=$('#wh').value;if($('#in'))F.inst=$('#in').value;if($('#ac'))F.acct=$('#ac').value}
function edit(i){const t=S.tx[i];EI=i;Object.assign(F,{type:t.type,date:t.date,cat:t.cat,who:t.who,pay:t.pay,amt:t.amt,inst:t.inst||1,note:t.note||'',acct:t.acct||null});render();scrollTo(0,0)}
function cancelEdit(){EI=-1;F.amt='';F.note='';F.inst=1;render()}
function bkSave(){const b=new Blob([JSON.stringify(S)],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='butce-yedek-'+today+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);stat('Yedek dosyası indirildi')}
function bkFile(f){if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);if(!j.cards||!j.tx)throw 0;S=mig(Object.assign(def(),j));save();render();stat('Yedek yüklendi')}catch(e){stat('Dosya okunamadı')}})}
function bk(){const t=$('#bkt');t.value=JSON.stringify(S);t.select();stat('Yedek hazır, kopyalayabilirsin')}
function bkCopy(){bk();try{navigator.clipboard.writeText($('#bkt').value).then(()=>stat('Panoya kopyalandı'),()=>{document.execCommand('copy');stat('Kopyalandı')})}catch(e){document.execCommand('copy');stat('Kopyalandı')}}
function bkLoad(){try{const j=JSON.parse($('#bkt').value);if(!j.cards||!j.tx)throw 0;S=mig(Object.assign(def(),j));save();render();stat('Yedek yüklendi')}catch(e){stat('Yedek metni okunamadı')}}
function addStmt(id){const c=card(id),n=pd(today),y=n.y,m=n.m,d=Math.min(c.due,new Date(y,m+1,0).getDate());S.stmts.push({id:'s'+Date.now(),card:id,dt:y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),amt:0,odenen:0});save();render()}
function add(){const am=parseFloat(String($('#am').value).replace(',','.'));if(!(am>0)){$('#am').focus();return}
 const inc=F.type==='in';
 const rec={id:EI>=0?S.tx[EI].id:Date.now()+'',type:F.type,date:$('#dt').value||today,amt:am,cat:$('#ca').value,who:inc?'aile':$('#wh').value,pay:inc?'cash':$('#pa').value,inst:inc||$('#pa').value==='cash'?1:Math.max(1,+($('#in').value||1)),note:$('#nt').value,acct:(!inc&&$('#pa').value==='cash')?($('#ac')?$('#ac').value:resAcct($('#wh').value)):''};if(EI>=0)S.tx[EI]=rec;else S.tx.push(rec);EI=-1;F.amt='';F.note='';F.inst=1;
 F.date=$('#dt').value;F.cat=$('#ca').value;if(!inc){F.who=$('#wh').value;F.pay=$('#pa').value}
 save();render();$('#am').focus()}
 function demoData(){
 const M=nowM(),dt=(m,d)=>{const y=Math.floor(m/12),mo=m%12;return y+'-'+String(mo+1).padStart(2,'0')+'-'+String(Math.min(d,28)).padStart(2,'0')};
 const inc={};
 [M-2,M-1,M].forEach((k,idx)=>{inc[ikey(k)]={ben:68000,es:54000,bene:idx===1?12000:0}});
 const tx=[
  {id:'d1',type:'out',date:dt(M-2,4),amt:6400,cat:'market',who:'aile',pay:'k1',inst:1,note:'Aylık büyük market'},
  {id:'d2',type:'out',date:dt(M-2,7),amt:4200,cat:'cocuk',who:'aile',pay:'k1',inst:2,note:'Defne okul kırtasiye & çanta'},
  {id:'d3',type:'out',date:dt(M-2,11),amt:7850,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep sonbahar gardırop'},
  {id:'d4',type:'out',date:dt(M-2,14),amt:2400,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d5',type:'out',date:dt(M-2,18),amt:3100,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Arkadaşlarla brunch & kahve'},
  {id:'d6',type:'out',date:dt(M-2,22),amt:2650,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Kuaför & cilt bakımı'},
  {id:'d7',type:'out',date:dt(M-2,26),amt:2900,cat:'market',who:'aile',pay:'cash',inst:1,note:'Haftalık pazar & kasap'},
  {id:'d8',type:'out',date:dt(M-1,3),amt:6900,cat:'market',who:'aile',pay:'k1',inst:1,note:'Market alışverişi'},
  {id:'d9',type:'out',date:dt(M-1,6),amt:3400,cat:'cocuk',who:'aile',pay:'k1',inst:1,note:'Emir bez & mama + kreş'},
  {id:'d10',type:'out',date:dt(M-1,9),amt:9400,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep trençkot & bot'},
  {id:'d11',type:'out',date:dt(M-1,12),amt:4600,cat:'eglence',who:'p2',pay:'k2',inst:2,note:'Hafta sonu aile kaçamağı'},
  {id:'d12',type:'out',date:dt(M-1,16),amt:2600,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d13',type:'out',date:dt(M-1,20),amt:3650,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Dışarda akşam yemeği & tatlı'},
  {id:'d14',type:'out',date:dt(M-1,24),amt:1850,cat:'giyim',who:'p1',pay:'k1',inst:1,note:'Kerem gömlek'},
  {id:'d15',type:'out',date:dt(M-1,27),amt:3200,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Kozmetik yenileme'},
  {id:'d16',type:'out',date:dt(M,2),amt:7100,cat:'market',who:'aile',pay:'k1',inst:1,note:'Mutfak alışverişi'},
  {id:'d17',type:'out',date:dt(M,5),amt:8600,cat:'giyim',who:'p2',pay:'k2',inst:3,note:'Zeynep çanta & triko'},
  {id:'d18',type:'out',date:dt(M,8),amt:3800,cat:'cocuk',who:'aile',pay:'k1',inst:1,note:'Defne yüzme kursu & Emir oyuncak'},
  {id:'d19',type:'out',date:dt(M,10),amt:2950,cat:'disari',who:'p2',pay:'k2',inst:1,note:'Kahve, pasta & öğle yemekleri'},
  {id:'d20',type:'out',date:dt(M,11),amt:2500,cat:'ulasim',who:'p1',pay:'k1',inst:1,note:'Yakıt'},
  {id:'d21',type:'out',date:dt(M,12),amt:2400,cat:'bakim',who:'p2',pay:'k2',inst:1,note:'Bakım & spa paketi'}
 ];
 return {
  people:[{id:'p1',name:'Kerem'},{id:'p2',name:'Zeynep'},{id:'aile',name:'Tüm aile'}],
  cats:mkL(NEWC),
  accts:[{id:'h1',name:'Ortak Maaş Hesabı',bal:42000,bm:ikey(M-2)}],
  defAcct:'h1',
  assets:[{name:'Kenardaki Gram Altın',tur:'Gram altın',miktar:18,kur:3050}],
  isrc:[
   {id:'ben',name:'Kerem maaş',ff:1,day:15,acct:'h1'},
   {id:'es',name:'Zeynep maaş',ff:1,day:15,acct:'h1'},
   {id:'bene',name:'Ek ders / Prim',ff:0,day:20,acct:'h1'}
  ],
  inc, incMode:'matrix', m:M, mode:'cash', extra:15000,
  cards:[
   {id:'k1',name:'Ortak Kart (Bonus)',cut:5,due:15,stmt:0,stmtDue:''},
   {id:'k2',name:'Zeynep Kart (World)',cut:12,due:22,stmt:0,stmtDue:''}
  ],
  stmts:[
   {id:'st1',card:'k1',dt:dt(M-1,15),amt:14800,asg:5920,d:2,odenen:14800},
   {id:'st2',card:'k2',dt:dt(M-1,22),amt:16900,asg:6760,d:2,odenen:16900},
   {id:'st3',card:'k1',dt:dt(M,15),amt:15400,asg:6160,d:0,odenen:0},
   {id:'st4',card:'k2',dt:dt(M,22),amt:18750,asg:7500,d:0,odenen:0}
  ],
  fixed:[
   {name:'Site Aidatı',amt:3500,cat:'konut',who:'aile',day:5,acct:'h1'},
   {name:'Elektrik + Su + Doğalgaz',amt:3400,cat:'fatura',who:'aile',day:18,acct:'h1'},
   {name:'İnternet & Telefonlar',amt:1450,cat:'fatura',who:'aile',day:20,acct:'h1'},
   {name:'Defne & Emir Kreş/Etüt',amt:9500,cat:'cocuk',who:'aile',day:10,acct:'h1'}
  ],
  yearly:[
   {name:'Araç Kasko & Trafik',amt:16500,cat:'ulasim',who:'aile',month:4,day:12,pm:'k1',inst:3},
   {name:'DASK & Konut Sigortası',amt:3200,cat:'konut',who:'aile',month:9,day:5,pm:'cash',inst:1}
  ],
  debts:[
   {name:'Ziraat Konut Kredisi',kind:'kredi',pay:28500,day:16,end:ikey(M+84),acct:'h1'},
   {name:'Garanti İhtiyaç Kredisi',kind:'kredi',pay:9200,day:18,end:ikey(M+14),acct:'h1'}
  ],
  tx
 };
}

