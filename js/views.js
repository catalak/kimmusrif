const mpick=()=>`<div class=row><input type=month style="width:auto" value="${Math.floor(S.m/12)}-${String(S.m%12+1).padStart(2,'0')}" onchange="S.m=mkd(this.value+'-01');save();render()"></div>`;
const debtAll=()=>sum(S.stmts.map(x=>Math.max(0,x.amt-sPaid(x))))+sum(S.debts.filter(d=>d.kind!=='kredi').map(dTL));
function noteOzet(M,c){const n=[],net=c.inc-c.cash;
 if(!c.inc&&!c.spend&&!c.cash)return['Bu ay için henüz kayıt yok. Ekle sekmesinden harcama, Gelirler sekmesinden gelir girince burada özet belirir.'];
 if(!c.inc)n.push('Bu ay için gelir girilmemiş, o yüzden “kalan” rakamı gerçeği göstermiyor olabilir. Gelirler sekmesinden maaşını ve varsa ek gelirleri yazarsan tablo oturur.');
 else{n.push(`Bu ay ${TL(c.inc)} gelirin var. Kesinleşen ödemeler ${TL(c.cash)}, geriye yaklaşık ${TL(net)} kalıyor.`);
  if(net<0)n.push(`Ödemeler gelirin ${TL(-net)} üstünde görünüyor. Bu aya ikramiye ya da ek bir gelir bekliyorsan Gelirler sekmesine yazmak durumu değiştirir. Yoksa taksit ve ertelenebilir kalemlere bir göz atmak iyi olur.`);
  if(c.fixed>0)n.push(`Kira, aidat ve kredi gibi sabit ödemeler gelirinin yaklaşık %${Math.round(c.fixed/c.inc*100)}’ini alıyor.`)}
 if(c.est>0.5)n.push(`Ekstresi henüz girilmemiş kartlar da var. Onlar için yaklaşık ${TL(c.est)} daha çıkabilir, bu da kalanı yaklaşık ${TL(net-c.est)} yapar. Ekstreyi girince tahmin kesinleşir.`);
 const p=calc(M-1).spend;if(p>0&&c.spend>0){const d=Math.round((c.spend-p)/p*100);if(Math.abs(d)>=10)n.push(`Harcaman geçen aya göre yaklaşık %${Math.abs(d)} ${d>0?'daha fazla':'daha az'} (${TL(p)} → ${TL(c.spend)}).`)}
 const db=debtAll();if(net>0&&db>0){const mo=Math.ceil(db/net);n.push(`Geriye kalan tutarı (${TL(net)}) borçlarına ayırırsan, toplam ${TL(db)} borç yaklaşık ${mo} ayda erir. Faiz ve yeni harcamalar bu hesaba dahil değil.`)}
 return n}
function noteHarc(M,c){const n=[],tsp=c.spend;if(!tsp)return n;
 const sm=a=>{const o={};a.forEach(i=>o[i.cat]=(o[i.cat]||0)+i.a);return o},cur=sm(c.items),prv=sm(calc(M-1).items),top=Object.entries(cur).sort((a,b)=>b[1]-a[1]);
 n.push(`Bu ay ${TL(tsp)} harcama yapılmış. En büyük kalem ${cn(top[0][0])} (%${Math.round(top[0][1]/tsp*100)})${top[1]?`, ardından ${cn(top[1][0])} (%${Math.round(top[1][1]/tsp*100)})`:''}.`);
 if(Object.keys(prv).length){const df=Object.keys({...cur,...prv}).map(k=>[k,(cur[k]||0)-(prv[k]||0)]).filter(x=>Math.abs(x[1])>=100).sort((a,b)=>b[1]-a[1]);
  const up=df[0]&&df[0][1]>0?df[0]:null,dn=df.length&&df[df.length-1][1]<0?df[df.length-1]:null;
  if(up||dn)n.push('Geçen aya göre '+[up?`en çok artan ${cn(up[0])} (+${TL(up[1])})`:'',dn?`en çok azalan ${cn(dn[0])} (−${TL(-dn[1])})`:''].filter(Boolean).join(', ')+'.')}
 const ort=sum(c.items.filter(i=>i.who==='aile').map(i=>i.a));if(ort>0&&ort<tsp)n.push(`Harcamanın %${Math.round(ort/tsp*100)}’i ortak giderlerden (kira, market gibi), kalanı kişilere ait.`);
 return n}
const notesHtml=a=>a.length?`<div class=notes>${a.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:'';
function vOzet(){const M=S.m,c=calc(M),net=c.inc-c.cash,yy=sum(S.yearly.map(y=>yA(y,Math.floor(M/12))))/12;
 return `<div class=sec>${mpick()}<div class=stats><div><span>Gelir</span><b>${TL(c.inc)}</b></div><div><span>Ödemeler (kesinleşen)</span><b>${TL(c.cash)}</b></div>
 <div><span>Kalan</span><b class="${net<0?'neg':'pos'}">${TL(net)}</b></div></div>
 <div class=stats style="margin-top:16px"><div><span>Harcama (yapılan alışveriş)</span><b>${TL(c.spend)}</b></div><div><span>Harcamanın gelire oranı</span><b>${c.inc?'%'+Math.round(c.spend/c.inc*100):'-'}</b></div></div>
 ${notesHtml(noteOzet(M,c))}
 <p class=mut><b>Ödemeler</b> kira, aidat, kredi, kart ekstresi gibi hesaptan çıkan paralardır (Ödemeler sekmesi). <b>Harcama</b> alışverişi yaptığın ayda, taksitli de olsa tam tutardır (Harcamalar sekmesi). İkisi aynı para değil, bu yüzden ayrı gösteriliyor.${yy?` Yıllık giderler için her ay ayırman gereken: ${TL(yy)}.`:''}</p></div>`}

function vHarc(){const M=S.m,c=calc(M),it=c.items,tsp=c.spend,pc=a=>tsp?'%'+Math.round(a/tsp*100):'-',cats=CL().filter(k=>it.some(i=>i.cat===k.id));
 const tot=k=>sum(it.filter(i=>i.cat===k).map(i=>i.a)),mx=Math.max(1,...cats.map(k=>tot(k.id))),who=w=>sum(it.filter(i=>i.who===w).map(i=>i.a));
 return `<div class=sec>${mpick()}<h2>Ne nereye gidiyor (${ml(M)})</h2>
 <p class=mut>Alışverişi yaptığın ayda tam tutarla sayılır, taksitli olsa da. Yuvarlak tahmini rakamlar burada olabilir. Hesaptan çıkan net ödemeler Ödemeler sekmesinde.</p>
 ${cats.length?`<div class=wrap><table><thead><tr><th>Kategori</th>${PL().map(p=>`<th>${esc(p.name)}</th>`).join('')}<th>Toplam</th><th>Pay</th><th style="width:120px"></th></tr></thead><tbody>
 ${cats.map(k=>`<tr><td>${esc(k.name)}</td>${PL().map(p=>{const a=sum(it.filter(i=>i.cat===k.id&&i.who===p.id).map(i=>i.a));return `<td>${a?TL(a):'<span class=mut>-</span>'}</td>`}).join('')}<td><b>${TL(tot(k.id))}</b></td><td class=mut>${pc(tot(k.id))}</td><td><div class=bar style="width:${tot(k.id)/mx*100}%"></div></td></tr>`).join('')}</tbody>
 <tfoot><tr><td>Toplam</td>${PL().map(p=>`<td>${TL(who(p.id))}</td>`).join('')}<td>${TL(tsp)}</td><td>${tsp?'%100':''}</td><td></td></tr><tr class=mut><td>Pay</td>${PL().map(p=>`<td>${pc(who(p.id))}</td>`).join('')}<td></td><td></td><td></td></tr></tfoot></table></div>${notesHtml(noteHarc(M,c))}`:'<p class=mut>Bu ay için kayıt yok. Ekle sekmesinden harcama gir.</p>'}</div>`}

const A=o=>o&&o.acct&&S.accts.some(a=>a.id===o.acct)?o.acct:S.defAcct;
const aName=id=>{const a=S.accts.find(x=>x.id===id);return a?a.name:''};
const resAcct=w=>{const p=PL().find(x=>x.id===w);return p&&p.acct&&S.accts.some(a=>a.id===p.acct)?p.acct:S.defAcct};
const acSel=(k,i,v)=>S.accts.length>1?`<select title="Hesap" style="width:130px" onchange="U('${k}',${i},'acct',this.value)">${optI(S.accts,A({acct:v}))}</select>`:'';
function cashRows(M){const rows=[],Y=Math.floor(M/12);
 S.fixed.filter(f=>on(f,M)).forEach(f=>rows.push({d:+f.day||0,n:f.name||cn(f.cat),a:f.amt,t:'Sabit',k:1,ac:A(f)}));
 S.debts.filter(d=>d.kind==='kredi'&&loanOn(d,M)).forEach(d=>rows.push({d:+d.day||0,n:d.name,a:d.pay,t:'Kredi taksiti',k:1,ac:A(d)}));
 S.yearly.filter(y=>y.month-1===M%12&&(!y.pm||y.pm==='cash')).forEach(y=>rows.push({d:+y.day||0,n:y.name,a:yA(y,Y),t:'Yıllık',k:1,ac:A(y)}));
 S.cards.forEach(cd=>{const st=S.stmts.filter(x=>x.card===cd.id&&mkd(x.dt)===M&&(x.amt>0||x.odenen>0));
  st.forEach(x=>rows.push({d:+x.dt.slice(8),n:cd.name+' ekstresi',a:sPaid(x)||x.amt,t:x.d===2?'Ödenen':(x.d===1?'Asgari ödenen':(x.d===3?'Kısmen ödenen':'Ekstre')),k:1,ac:A(x)}));
  {const tp=cardTah(cd,M);if(tp>0.5)rows.push({d:+cd.due,n:cd.name+' (tahmini: devreden + harcamalar, faiz hariç)',a:tp,t:'Tahmini',k:0,ac:S.defAcct})}});
 const by={};S.tx.filter(t=>t.type!=='in'&&t.pay==='cash'&&mkd(t.date)===M).forEach(t=>{const x=A(t);by[x]=(by[x]||0)+t.amt});
 Object.keys(by).forEach(x=>rows.push({d:99,n:'Nakit harcamalar'+(S.accts.length>1?' ('+aName(x)+')':''),a:by[x],t:'Nakit',k:1,ac:x}));
 S.isrc.forEach(x=>{const a=iv(M,x.id);if(a>0)rows.push({d:+x.day||1,n:x.name,a,t:'Gelir',k:2,ac:A(x)})});
 S.tx.filter(t=>t.type==='in'&&mkd(t.date)===M).forEach(t=>rows.push({d:+t.date.slice(8),n:t.cat,a:t.amt,t:'Gelir',k:2,ac:A(t)}));
 return rows}
const flowA=(id,k)=>sum(cashRows(k).filter(r=>r.ac===id&&r.k>0).map(r=>r.k===2?r.a:-r.a));
const bmK=a=>ymk(a.bm||today.slice(0,7));
const balEnd=(a,M)=>{const s0=bmK(a);if(M<s0-1)return 0;let b=a.bal||0;for(let k=s0;k<=M;k++)b+=flowA(a.id,k);return b};
const startBal=M=>sum(S.accts.map(a=>bmK(a)<=M?balEnd(a,M-1):0));
function vOde(){const M=S.m,c=calc(M),rows=cashRows(M);
 rows.sort((a,b)=>(a.d||1)-(b.d||1)||(b.k===2)-(a.k===2));
 const hasB=S.accts.some(a=>a.bal),sb=hasB?startBal(M):0;let bal=sb,minB=sb,first=null;rows.forEach(r=>{if(r.k===2)bal+=r.a;else if(r.k===1){bal-=r.a;if(bal<0&&!first)first=r;if(bal<minB)minB=bal}r.b=r.k===0?null:bal});
 const kes=sum(rows.filter(r=>r.k===1).map(r=>r.a)),tah=sum(rows.filter(r=>r.k===0).map(r=>r.a)),gel=sum(rows.filter(r=>r.k===2).map(r=>r.a)),net=gel-kes,w=[];
 if(net<0)w.push(`Bu ay gelirler ödemeleri karşılamıyor, fark yaklaşık ${TL(-net)}.${hasB?(sb+net>=0?' Hesaplarındaki bakiye bu farkı karşılıyor.':' Hesaplarındaki bakiye de bu farkı karşılamıyor.'):''}`);
 else if(first)w.push(`Ay toplamında gelir yetiyor ama ${first.d>=99?'ay içinde':(first.d||1)+' '+MN[M%12]+' civarında'} o güne kadar gelen gelir ödemelere yetmiyor (en düşük bakiye ${TL(minB)}). ${hasB?'Ay başı bakiyen '+TL(sb)+' olarak hesaba katıldı.':'Ay başı bakiyesi 0 varsayıldı.'} Hesabında bu tutar yoksa ödeme ya da maaş günlerine bir bak.`);
 return `<div class=sec>${mpick()}<h2>${ml(M)} nakit akışı</h2>${notesHtml(w)}
 <p class=mut>Gelirler ve hesaptan çıkan paralar gün sırasıyla. Kira, aidat, kredi, kesilmiş ekstre ve nakit harcamalar kesin sayılır. Ekstresi girilmemiş kartların tahmini tutarı silik görünür ve toplama girmez. Gelir günlerini Gelirler sekmesinde belirlersin.</p>
 ${rows.length?`<div class=wrap><table><thead><tr><th>Gün</th><th style="text-align:left">Kalem</th><th style="text-align:left">Tür</th><th>Tutar</th><th>Bakiye</th></tr></thead><tbody>
 ${hasB?`<tr class=mut><td></td><td style="text-align:left">Ay başı bakiye</td><td></td><td></td><td>${TL(sb)}</td></tr>`:''}${rows.map(r=>`<tr class="${r.k===0?'mut':''}"><td>${r.d&&r.d<99?r.d+' '+MN[M%12]:'-'}</td><td style="text-align:left">${esc(r.n)}</td><td style="text-align:left">${r.t}</td><td>${r.k===2?'<b class=pos>+'+TL(r.a)+'</b>':(r.k?'<b>−'+TL(r.a)+'</b>':'~'+TL(r.a))}</td><td class="${r.b<0?'neg':'mut'}">${r.b===null?'':TL(r.b)}</td></tr>`).join('')}</tbody>
 <tfoot><tr><td></td><td style="text-align:left">Gelir</td><td></td><td>${TL(gel)}</td><td></td></tr><tr><td></td><td style="text-align:left">Kesin ödemeler</td><td></td><td>${TL(kes)}</td><td></td></tr><tr><td></td><td style="text-align:left">Net</td><td></td><td class="${net<0?'neg':'pos'}">${TL(net)}</td><td></td></tr></tfoot></table></div>
 <p class=mut>${tah>0.5?`Kart tahminleri toplama dahil değil: ~${TL(tah)}. Tahminle birlikte net: ${TL(net-tah)}.`:'Tüm rakamlar kesinleşmiş.'}</p>`:'<p class=mut>Bu ay için kayıt yok.</p>'}</div>`}

function vEkle(){const inc=F.type==='in',M=S.m;
 const list=S.tx.map((t,i)=>({t,i})).filter(x=>mkd(x.t.date)===M||mkd(x.t.date)===M-1).sort((a,b)=>b.t.date.localeCompare(a.t.date));
 return `<div class=sec><h2>${EI>=0?'Kaydı düzenle':'Yeni kayıt'}</h2><div class=grid>
 
 <div><label>Tarih</label><input id=dt type=date value="${F.date}"></div>
 <div><label>Tutar (₺)</label><input id=am type=number step=any inputmode=decimal value="${F.amt||''}" onkeydown="if(event.key==='Enter')add()"></div>
 <div><label>Kategori</label><select id=ca>${inc?opt(INC,F.cat||INC[0]):optI(CL(),F.cat||(CL()[0]||{}).id)}</select></div>
 ${inc?'':`<div><label>Kime</label><select id=wh onchange="snap();F.acct=null;render()">${optI(PL(),F.who)}</select></div>
 <div><label>Ödeme</label><select id=pa onchange="snap();F.pay=this.value;render()"><option value=cash>Nakit</option>${S.cards.map(c=>`<option value="${c.id}"${F.pay===c.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
 ${F.pay==='cash'&&S.accts.length>1?`<div><label>Hesap</label><select id=ac>${optI(S.accts,F.acct||resAcct(F.who))}</select></div>`:''}${F.pay!=='cash'?`<div><label>Taksit sayısı</label><input id=in type=number min=1 value="${F.inst||1}"></div>`:''}`}
 <div><label>Not</label><input id=nt value="${esc(F.note||'')}"></div><div class=row><button class="b p" onclick="add()">${EI>=0?'Güncelle':'Kaydet'}</button>${EI>=0?'<button class=b onclick="cancelEdit()">Vazgeç</button>':''}</div></div></div>
 <div class=sec>${mpick()}<h2>${ml(M-1)} ve ${ml(M)} kayıtları</h2>${list.length?`<div class=wrap><table><tbody>${list.map(({t,i})=>`<tr><td>${t.date.slice(8)}.${t.date.slice(5,7)}</td><td>${esc(cn(t.cat))}</td><td>${t.type==='in'?'':esc(wn(t.who))}</td><td>${esc(pn(t.pay))}${t.inst>1?' · '+t.inst+' taksit':''}</td><td class=mut>${esc(t.note)}</td><td class="${t.type==='in'?'pos':''}">${t.type==='in'?'+':''}${TL(t.amt)}</td><td style="white-space:nowrap"><button class=b onclick="edit(${i})">Düzenle</button> <button class=b onclick="del('tx',${i})" aria-label="Sil">Sil</button></td></tr>`).join('')}</tbody></table></div>`:'<p class=mut>Henüz kayıt yok.</p>'}</div>`}

function vKart(){
 const dueTot=sum(S.stmts.map(x=>Math.max(0,x.amt-sPaid(x)))),min=dueTot*.4,oth=sum(S.debts.filter(d=>d.kind!=='kredi').map(dTL)),ln=sum(S.debts.filter(d=>d.kind==='kredi').map(loanLeft)),tot=dueTot+oth;
 const net=calc(S.m);const sur=net.inc-net.cash;
 const mo=S.extra>0&&tot>0?Math.ceil(tot/S.extra):0,n=new Date(2026,10+mo,1);
 return `<div class=sec>${mpick()}<h2>Kart ekstreleri (${ml(S.m)} ödemeleri)</h2><p class=mut>Kart eklemek, adını veya son ödeme gününü değiştirmek için Ayarlar sekmesine bak.</p>${(()=>{const ms=S.stmts.filter(x=>mkd(x.dt)===S.m&&x.amt>0),tp=sum(ms.map(x=>x.amt)),pd2=sum(ms.map(sPaid));return `<div class=stats style="margin-bottom:14px"><div><span>Toplam ekstre</span><b>${TL(tp)}</b></div><div><span>Ödenen</span><b>${TL(pd2)}</b></div><div><span>Kalan</span><b>${TL(Math.max(0,tp-pd2))}</b></div><div><span>Asgari toplamı</span><b>${TL(sum(ms.map(x=>x.asg||x.amt*.4)))}</b></div></div>`})()}
 ${S.cards.map(c=>{const x=S.stmts.find(y=>y.card===c.id&&mkd(y.dt)===S.m&&(y.amt>0||y.odenen>0||y.d>0))||{dt:defDt(c,S.m),amt:0,asg:0,d:0,odenen:0},kal=Math.max(0,x.amt-sPaid(x)),est=cardEst(c,S.m),o=sum(AX().filter(t=>t.pay===c.id&&t.type!=='in').flatMap(inst).filter(y=>y.sm===cardNm(c)).map(y=>y.a)),l=sum(AX().filter(t=>t.pay===c.id&&t.type!=='in').flatMap(inst).filter(y=>y.sm>cardNm(c)&&y.sm<=cardNm(c)+12).map(y=>y.a));
 return `<div class=cardbox><div class=chead><b>${esc(c.name)}</b><span class=mut>Kalan <b>${TL(kal)}</b></span></div>
 <div class=grid3><div><label>Son ödeme tarihi</label><input type=date value="${x.dt}" onchange="sset('${c.id}','dt',this.value)"></div>
 <div><label>Ekstre tutarı</label><input type=number step=any value="${x.amt||''}" onchange="sset('${c.id}','amt',this.value)"></div>
 <div><label>Asgari (otomatik, değiştirebilirsin)</label><input type=number step=any value="${x.asg||''}" placeholder="${Math.round(x.amt*.4)||''}" onchange="sset('${c.id}','asg',this.value)"></div>${S.accts.length>1?`<div><label>Ödenecek hesap</label><select onchange="sset('${c.id}','acct',this.value)">${optI(S.accts,A(x))}</select></div>`:''}</div>
 <div class=seg>${[['Ödenmedi',0],['Asgari ödendi',1],['Tamamı ödendi',2]].map(([t,v])=>`<button class="${x.d===v?'on':''}" onclick="sset('${c.id}','d',${v})">${t}</button>`).join('')}</div>
 <p class=mut style="margin:10px 0 0">${x.d===3?`Kısmen ödenen: ${TL(x.odenen)} · `:''}${x.amt>0?'':`Ekstre girilmediyse tahmini: ~${TL(est+carry(c,S.m))} (devreden ${TL(carry(c,S.m))} + harcamalar ${TL(est)}, faiz hariç) · `}Sonraki ekstreye girecek: ${TL(o)} · Sonraki aylara taksit: ${TL(l)}</p></div>`}).join('')}</div>
 <div class=sec><h2>Krediler</h2><p class=mut>Taksit her ay Ödemeler'e kendiliğinden gelir. Kalan taksit sayısını yazman yeter, son taksit ayı hesaplanır ve her ay bir azalır.</p>
 ${S.debts.map((d,i)=>({d,i})).filter(x=>x.d.kind==='kredi').map(({d,i})=>{const n=loanN(d);return `<div class=cardbox><div class=chead><b>${esc(d.name)}</b><span class=mut>${n?`Son taksit ${ml(ymk(d.end))} · Kalan ${TL(d.pay*n)}`:'Kalan taksit sayısını gir'}</span></div>
 <div class=grid3><div><label>Banka / kredi adı</label><input value="${esc(d.name)}" onchange="U('debts',${i},'name',this.value,1)"></div><div><label>Aylık taksit</label><input type=number step=any value="${d.pay||''}" onchange="U('debts',${i},'pay',this.value,1)"></div><div><label>Ayın kaçında ödeniyor</label><input type=number min=1 max=31 value="${d.day||''}" onchange="U('debts',${i},'day',this.value)"></div><div><label>Kalan taksit sayısı</label><input type=number min=0 value="${n||''}" onchange="lsetLeft(${i},this.value)"></div>${S.accts.length>1?`<div><label>Ödendiği hesap</label><select onchange="U('debts',${i},'acct',this.value)">${optI(S.accts,A(d))}</select></div>`:''}</div>
 <button class=b onclick="del('debts',${i})">Sil</button></div>`}).join('')}
 <button class=b onclick="S.debts.push({name:'Yeni kredi',kind:'kredi',pay:0,day:0,end:''});save();render()">Kredi ekle</button></div>
 <div class=sec><h2>Borç listesi</h2><p class=mut>TL, dolar, euro veya altın borçlarını yaz. Dövizde miktarı ve bugünkü kuru gir, TL karşılığı kendisi hesaplanır. Kuru ara sıra güncelle.</p>
 ${S.debts.map((d,i)=>({d,i})).filter(x=>x.d.kind!=='kredi').map(({d,i})=>{const tl=!d.tur||d.tur==='TL',age=d.kt?Math.round((new Date(today)-new Date(d.kt))/864e5):null;return `<div class=cardbox><div class=chead><b>${esc(d.name)}</b><span class=mut>= <b>${TL(dTL(d))}</b></span></div>
 <div class=grid3><div><label>Ad</label><input value="${esc(d.name)}" onchange="U('debts',${i},'name',this.value,1)"></div><div><label>Tür</label><select onchange="U('debts',${i},'tur',this.value,1)">${['TL','Dolar','Euro','Gram altın'].map(t=>`<option${(d.tur||'TL')===t?' selected':''}>${t}</option>`).join('')}</select></div><div><label>Miktar${tl?' (₺)':''}</label><input type=number step=any value="${d.miktar||''}" onchange="U('debts',${i},'miktar',this.value,1)"></div>${tl?'':`<div><label>Kur (₺)</label><input type=number step=any value="${d.kur||''}" onchange="U('debts',${i},'kur',this.value,1)"></div>`}</div>
 ${tl?'':`<p class=mut style="margin:8px 0 0">${age===null?'Kuru girince TL karşılığı hesaplanır.':(age>30?`Bu kuru ${age} gündür güncellemedin.`:`Kur son güncelleme: ${d.kt.split('-').reverse().join('.')}`)}</p>`}
 <div style="margin-top:8px"><button class=b onclick="del('debts',${i})">Sil</button><label style="display:inline-flex;gap:6px;align-items:center;margin-left:12px;color:var(--ink);font-size:14px"><input type=checkbox style="width:auto" ${d.uz?'checked':''} onchange="S.debts[${i}].uz=this.checked?1:0;save();render()">Uzun vadeli</label></div></div>`}).join('')}
 <button class=b onclick="S.debts.push({name:'Yeni borç',kind:'serbest',tur:'TL',miktar:0,kur:1});save();render()">Borç ekle</button></div>
 <div class=sec><h2>Borç bitiş tahmini</h2>
 <div class=stats><div><span>Kart ekstreleri</span><b>${TL(dueTot)}</b></div><div><span>Kart asgari (%40)</span><b>${TL(min)}</b></div><div><span>Borç listesi</span><b>${TL(oth)}</b></div><div><span>Planlı krediler (taksitle gider)</span><b>${TL(ln)}</b></div><div><span>Toplam borç</span><b>${TL(tot)}</b></div></div>
 <div class=row style="margin-top:14px"><div style="width:220px"><label>Aylık borca ayırdığın tutar</label><input type=number step=any value="${S.extra||''}" onchange="S.extra=parseFloat(this.value)||0;save();render()"></div>
 <button class=b onclick="S.extra=Math.max(0,Math.round(${sur}));save();render()">${ml(S.m)} kalanını kullan (${TL(sur)})</button></div>
 ${mo?`<div class=big>${mo} ay</div><p class=mut>Tahmini bitiş: ${MN[n.getMonth()]} ${n.getFullYear()}. Faiz ve yeni harcama hesaba katılmaz.</p>`:'<p class=mut>Bir tutar girince kaç ayda biteceği görünür.</p>'}</div>`}

const dTL=d=>(!d.tur||d.tur==='TL')?(d.miktar!==undefined?d.miktar:(d.balance||0)):(d.miktar||0)*(d.kur||0);
const loanN=d=>d.end?Math.max(0,ymk(d.end)-nowM()+1):0;
function lsetLeft(i,v){const n=Math.max(0,parseInt(v)||0);S.debts[i].end=n?ikey(nowM()+n-1):'';save();render()}
function lst(k,ym){return `${S[k].map((f,i)=>`<div class=row><input style="flex:2;min-width:120px" value="${esc(f.name)}" placeholder="Ad" onchange="U('${k}',${i},'name',this.value)">
 <input style="flex:1;min-width:100px" type=number step=any value="${k==='yearly'?yA(f,YY()):f.amt}" onchange="${k==='yearly'?`yset(${i},this.value)`:`U('${k}',${i},'amt',this.value)`}">
 <select style="flex:1;min-width:110px" onchange="U('${k}',${i},'cat',this.value)">${optI(CL(),f.cat)}</select>
 <select style="flex:1;min-width:100px" onchange="U('${k}',${i},'who',this.value)">${optI(PL(),f.who)}</select>
 ${ym?`<select style="width:110px" onchange="U('${k}',${i},'month',this.value)">${MN.map((m,j)=>`<option value=${j+1}${f.month===j+1?' selected':''}>${m}</option>`).join('')}</select><input type=number min=1 max=28 title="Ödeme günü" placeholder="Gün" style="width:70px" value="${f.day||''}" onchange="U('yearly',${i},'day',this.value)"><select style="width:120px" title="Ödeme" onchange="U('yearly',${i},'pm',this.value)"><option value=cash>Nakit</option>${S.cards.map(c=>`<option value="${c.id}"${f.pm===c.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select><input type=number min=1 title="Taksit sayısı" placeholder="Taksit" style="width:80px" value="${f.inst||''}" onchange="U('yearly',${i},'inst',this.value)">`:''}
 ${acSel(k,i,f.acct)}${k==='fixed'?`<input type=number min=1 max=31 title="Ayın kaçında ödeniyor" placeholder="Gün" style="width:70px" value="${f.day||''}" onchange="U('fixed',${i},'day',this.value)"><button class=b onclick="zam(${i})">Zam</button>`:''}<button class=b onclick="del('${k}',${i})">Sil</button></div>${k==='fixed'?`<details style="margin:-2px 0 12px"><summary class=mut style="cursor:pointer;font-size:13px">Başlangıç ve bitiş ayı${f.from||f.to?' · '+(f.from||'…')+' → '+(f.to||'süresiz'):''}</summary><div class=row style="margin-top:6px"><label>Başlangıç</label><input type=month style="width:150px" value="${f.from||''}" onchange="U('fixed',${i},'from',this.value,1)"><label>Bitiş (boşsa süresiz)</label><input type=month style="width:150px" min="${f.from||''}" value="${f.to||''}" onchange="U('fixed',${i},'to',this.value,1)"></div></details>`:''}`).join('')}
 <button class=b onclick="S.${k}.push({name:'',amt:0,cat:dcat('${ym?'vergi':'konut'}'),who:'aile'${ym?',month:1':''}});save();render()">Ekle</button>`}
const useN=(f,id)=>['tx','fixed','yearly'].reduce((a,k)=>a+S[k].filter(t=>t[f]===id).length,0);
function rn(l,i,v){v=String(v).trim();if(!v){render();return}if(S[l].some((x,j)=>j!==i&&x.name.toLowerCase()===v.toLowerCase())){render();stat('Bu ad zaten var');return}S[l][i].name=v;save();render()}
function pAdd(){S.people.push({id:'p'+Date.now(),name:'Yeni kişi'});save();render()}
function pDel(id){if(id==='aile')return;let n=0;['tx','fixed','yearly'].forEach(k=>S[k].forEach(t=>{if(t.who===id){t.who='aile';n++}}));S.people=S.people.filter(p=>p.id!==id);save();render();stat(n?n+' kayıt Tüm aile’ye aktarıldı':'Silindi')}
function cAdd(){S.cats.push({id:'c'+Date.now(),name:'Yeni kategori'});save();render()}
function cDel(id){if(id==='borc'||id==='diger')return;let n=0;['tx','fixed','yearly'].forEach(k=>S[k].forEach(t=>{if(t.cat===id){t.cat='diger';n++}}));S.cats=S.cats.filter(c=>c.id!==id);save();render();stat(n?n+' kayıt Diğer’e aktarıldı':'Silindi')}
function kAdd(){S.cards.push({id:'k'+Date.now(),name:'Yeni kart',due:15,cut:5});save();render()}
function kDel(id){const n=S.tx.filter(t=>t.pay===id).length+S.stmts.filter(x=>x.card===id).length+S.yearly.filter(y=>y.pm===id).length;if(n){stat('Bu kartta '+n+' kayıt var, önce onları sil ya da başka karta al');return}S.cards=S.cards.filter(c=>c.id!==id);save();render()}
const hesapSec=()=>{const ends=S.accts.map(a=>({a,e:balEnd(a,nowM())}));return `<div class=sec><h2>Hesaplar</h2><p class=mut>Banka hesaplarını ekle. Bakiyeyi, seçtiğin ayın başındaki tutar olarak yaz. Sonrası gelir ve ödemelerden hesaplanır. Nakit harcamalar, sabit giderler ve ekstre ödemeleri seçtiğin hesaptan düşer.</p>
 ${ends.map(({a,e},i)=>`<div class=row><input style="flex:2;min-width:150px" value="${esc(a.name)}" onchange="U('accts',${i},'name',this.value,1)"><input type=number step=any style="width:130px" title="Bakiye" placeholder="Bakiye" value="${a.bal||''}" onchange="U('accts',${i},'bal',this.value,1)"><input type=month style="width:150px" title="Bu bakiye hangi ayın başındaki" value="${a.bm||''}" onchange="U('accts',${i},'bm',this.value,1)"><label style="display:flex;gap:6px;align-items:center;color:var(--ink);font-size:14px"><input type=radio name=defa style="width:auto" ${S.defAcct===a.id?'checked':''} onchange="S.defAcct='${a.id}';save();render()">Varsayılan</label><span class=mut>Ay sonu ${TL(e)}</span><button class=b onclick="aDel('${a.id}')">Sil</button></div>`).join('')}
 <button class=b onclick="aAdd()">Hesap ekle</button></div>
 ${S.accts.length>1?`<div class=sec><h2>Nakit harcama hangi hesaptan düşsün?</h2><p class=mut>Kişi bazında seç. Boş bırakırsan varsayılan hesap kullanılır. Ekle ekranında her harcamada değiştirebilirsin.</p>${PL().map((p,i)=>`<div class=row><span style="min-width:120px">${esc(p.name)}</span><select style="flex:1" onchange="S.people[${i}].acct=this.value;save()"><option value="">Varsayılan hesap</option>${optI(S.accts,p.acct)}</select></div>`).join('')}</div>`:''}
 <div class=sec><h2>Diğer varlıklar</h2><p class=mut>Altın, döviz gibi. Miktarı ve bugünkü kuru yaz, TL karşılığı hesaplanır.</p>
 ${S.assets.map((d,i)=>{const tl=!d.tur||d.tur==='TL';return `<div class=row><input style="flex:2;min-width:140px" value="${esc(d.name)}" onchange="U('assets',${i},'name',this.value,1)"><select style="width:120px" onchange="U('assets',${i},'tur',this.value,1)">${['TL','Dolar','Euro','Gram altın'].map(t=>`<option${(d.tur||'TL')===t?' selected':''}>${t}</option>`).join('')}</select><input type=number step=any style="width:110px" placeholder="Miktar" value="${d.miktar||''}" onchange="U('assets',${i},'miktar',this.value,1)">${tl?'':`<input type=number step=any style="width:110px" placeholder="Kur (₺)" value="${d.kur||''}" onchange="U('assets',${i},'kur',this.value,1)">`}<span class=mut>= ${TL(dTL(d))}</span><button class=b onclick="del('assets',${i})">Sil</button></div>`}).join('')}
 <button class=b onclick="S.assets.push({name:'Yeni varlık',tur:'Gram altın',miktar:0,kur:0});save();render()">Varlık ekle</button></div>`};
const depoSec=()=>`<div class=sec><h2>Veri depolama</h2><p class=mut>Verin şu an <b>${esc(Store.label())}</b> üzerinde tutuluyor: yalnızca bu tarayıcıda, kimsenin sunucusunda değil. Tarayıcı verisini temizlersen silinir, o yüzden düzenli yedek al. Diğer depolar hazır olunca buradan seçip mevcut verini kopyalayabileceksin.</p>
 ${Object.entries(Store.adapters).map(([k,a])=>`<div class=row><label style="display:flex;gap:8px;align-items:center;color:var(--ink);font-size:15px"><input type=radio name=depo style="width:auto" ${Store.active===k?'checked':''} ${a.ready?'':'disabled'} onchange="useStore('${k}')">${esc(a.name)}</label><span class=mut>${a.ready?(Store.active===k?'Aktif':''):esc(a.note||'Yakında')}</span></div>`).join('')}</div>`;
async function useStore(k){try{await Store.switchTo(k);stat('Depo değiştirildi: '+Store.label());render()}catch(e){stat('Depo değiştirilemedi')}}
function vAyar(){return `<div class=sec><h2>Kişiler</h2><p class=mut>Harcamanın kime ait olduğunu bu liste belirler. Adı değiştirirsen eski kayıtlar da yeni adla görünür. Birini silersen kayıtları Tüm aile’ye aktarılır.</p>
 ${PL().map((p,i)=>`<div class=row><input style="flex:1;min-width:160px" value="${esc(p.name)}" onchange="rn('people',${i},this.value)"><span class=mut style="width:80px">${useN('who',p.id)} kayıt</span>${p.id==='aile'?'<span class=mut style="width:64px;text-align:center">sabit</span>':`<button class=b style="width:64px" onclick="pDel('${p.id}')">Sil</button>`}</div>`).join('')}
 <button class=b onclick="pAdd()">Kişi ekle</button></div>
 <div class=sec><h2>Kategoriler</h2><p class=mut>Harcamaların kategorileri. Adı değiştirirsen eski kayıtlar da yeni adla görünür. Birini silersen kayıtları Diğer’e aktarılır. Borç-taksit ve Diğer sabittir.</p>
 ${CL().map((c,i)=>`<div class=row><input style="flex:1;min-width:160px" value="${esc(c.name)}" onchange="rn('cats',${i},this.value)"><span class=mut style="width:80px">${useN('cat',c.id)} kayıt</span>${c.id==='borc'||c.id==='diger'?'<span class=mut style="width:64px;text-align:center">sabit</span>':`<button class=b style="width:64px" onclick="cDel('${c.id}')">Sil</button>`}</div>`).join('')}
 <button class=b onclick="cAdd()">Kategori ekle</button></div>
 ${hesapSec()}
 <div class=sec><h2>Kredi kartları</h2><p class=mut>Kartın adı ve son ödeme günü. Hesap kesim günü son ödeme gününden 10 gün önce olarak otomatik hesaplanır. Ekstreleri Kartlar & Krediler sekmesinde girersin.</p>
 ${S.cards.map((c,i)=>`<div class=row><input style="flex:1;min-width:160px" value="${esc(c.name)}" onchange="U('cards',${i},'name',this.value,1)"><input type=number min=1 max=31 style="width:170px" title="Son ödeme günü" placeholder="Son ödeme günü" value="${c.due||''}" onchange="U('cards',${i},'due',this.value)"><button class=b style="width:64px" onclick="kDel('${c.id}')">Sil</button></div>`).join('')}
 <button class=b onclick="kAdd()">Kart ekle</button></div>
 ${depoSec()}
 <div class=sec><h2>Yedek</h2><p class=mut>Bütün verini bir dosya olarak indirebilirsin. Yeni sürüme geçerken ya da bir şey ters giderse aynı dosyayı geri yüklersin.</p>
 <div class=row><button class="b p" onclick="bkSave()">Yedeği dosya olarak indir (.txt)</button><label class=b style="cursor:pointer;font-size:15px">Yedek dosyasından yükle<input type=file accept=".txt,.json,text/plain" style="display:none" onchange="bkFile(this.files[0])"></label></div>
 <details style="margin-top:10px"><summary class=mut style="cursor:pointer">Metin olarak göster ya da yapıştır</summary><div class=row style="margin-top:8px"><button class=b onclick="bk()">Yedeği göster</button><button class=b onclick="bkCopy()">Panoya kopyala</button></div>
 <textarea id=bkt rows=6 style="width:100%;font:12px monospace;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:5px;padding:8px" placeholder="Yedek metni burada görünür. Yüklemek için yedeği buraya yapıştır."></textarea>
 <div class=row style="margin-top:8px"><button class=b onclick="bkLoad()">Yapıştırılan yedeği yükle</button></div></details></div>`}
function vSabit(){return `<div class=sec><h2>Her ay tekrarlayan giderler</h2><p class=mut>Kira, aidat, kurs gibi. Her ay otomatik gelir, tekrar girmezsin. Ayın kaçında ödendiğini Gün kutusuna yaz, Ödemeler sekmesinde o güne göre sıralanır. Zam gelince Zam düğmesine bas: satır kopyalanır, eskisi bu ay biter, yenisi gelecek aydan başlar, sonra yeni tutarı düzeltirsin. Başlangıç ve bitiş ayını satırın altındaki ayrıntıdan değiştirebilirsin.</p>${lst('fixed')}</div>
 <div class=sec><h2>Yılda bir gelen giderler</h2><p class=mut>MTV, DASK, emlak vergisi, gelir vergisi gibi. Seçtiğin ay ve günde ödenir, her yıl kendiliğinden gelir. Kartla ve taksitle ödersen ekstreye ve sonraki aylara da yansır, bu yüzden Ekle sekmesine ayrıca girme. Tutar değişince buradan güncelle. Özet’te aylık karşılığı hesaplanır.</p><div class=row><button class=b onclick="S.yy=YY()-1;save();render()">‹</button><b>${YY()}</b><button class=b onclick="S.yy=YY()+1;save();render()">›</button><span class=mut>Tutarlar bu yıl için gösterilir ve girilir. Başka bir yıla geçip tutarı değiştirirsen önceki yıllar olduğu gibi kalır.</span></div>
 ${lst('yearly',1)}</div>`}

function vProj(){const s0=nowM(),rows=[],oth=sum(S.assets.map(dTL)),lns=S.debts.filter(d=>d.kind==='kredi'&&d.pay>0),bl=S.debts.filter(d=>d.kind!=='kredi');
 const nrem=(d,k)=>d.end?Math.max(0,ymk(d.end)-k):0;
 const kart=k=>sum(S.stmts.filter(x=>x.amt>0).map(x=>mkd(x.dt)>k?x.amt:Math.max(0,x.amt-(sPaid(x)||x.amt))));
 const debt=k=>sum(lns.map(d=>d.pay*nrem(d,k)))+sum(bl.map(dTL))+kart(k);
 const longD=k=>sum(lns.map(d=>d.pay*Math.max(0,nrem(d,k)-12)))+sum(bl.filter(d=>d.uz).map(dTL));
 let ti=0,tk=0,te=0;
 for(let k=s0;k<s0+12;k++){const c=calc(k),nb=sum(S.accts.map(a=>balEnd(a,k))),db=debt(k);ti+=c.inc;tk+=c.cash;te+=c.est;rows.push({k,inc:c.inc,kes:c.cash,est:c.est,net:c.inc-c.cash,nb,db,nv:nb+oth-db})}
 const f=rows[0],l=rows[11],tn=ti-tk,low=rows.reduce((a,b)=>b.nb<a.nb?b:a),dd=f.db-l.db,dn=l.nv-f.nv,sg=v=>(v>=0?'+':'−')+TL(Math.abs(v)),nt=[];
 nt.push(`Önümüzdeki 12 ayda ${TL(ti)} gelir ve ${TL(tk)} kesinleşmiş ödeme görünüyor. Fark yaklaşık ${TL(Math.abs(tn))} ${tn>=0?'artı':'eksi'}.`);
 nt.push(`Hesaplarındaki toplam nakit bu ay sonu yaklaşık ${TL(f.nb)}, 12 ay sonunda ${TL(l.nb)} olması bekleniyor.`);
 if(f.db>0)nt.push(dd>0?`Toplam borç (faiz hariç) ${TL(f.db)} seviyesinden ${TL(l.db)} seviyesine iniyor, yani 12 ayda yaklaşık ${TL(dd)} eriyor.${longD(s0+11)>0?` Kalan borcun ${TL(longD(s0+11))} kadarı 12 aydan sonraya uzanan uzun vadeli kısım.`:''}`:`Toplam borç (faiz hariç) ${TL(f.db)} civarında, bu dönemde azalmıyor görünüyor.`);
 nt.push(`Net varlığın ${TL(f.nv)} seviyesinden ${TL(l.nv)} seviyesine ${dn>=0?'çıkıyor':'düşüyor'} (${sg(dn)}). Uzun vadeli krediler dahil bütün borçlar düşüldüğü için bu rakam eksi olabilir, asıl önemli olan yönü.`);
 if(low.nb<0)nt.push(`${ml(low.k)} ayında hesaplarındaki toplam nakit eksiye (${TL(low.nb)}) düşüyor görünüyor. Maaş ya da ek gelir günlerini, o aydaki büyük ödemeleri bir kontrol etmek iyi olur.`);
 else nt.push(`Nakit en düşük ${ml(low.k)} ayında (${TL(low.nb)}).`);
 nt.push(`Gelecek aylarda kart ekstreleri henüz girilmediği için kesin ödemeler olduğundan düşük görünebilir.${te>0.5?` Ekstresi girilmemiş kartların tahmini ödemeleri (${TL(te)}) hesaba dahil değil.`:''}`);
 const cl=v=>v<0?' class=neg':'',st='style="font-size:19px"';
 const vi=[...S.accts.map(a=>[a.name,balEnd(a,s0),balEnd(a,s0+11)]),...S.assets.map(a=>[a.name,dTL(a),dTL(a)])];
 const bi=[...(kart(s0)||kart(s0+11)?[['Kart ekstreleri',kart(s0),kart(s0+11)]]:[]),...lns.map(d=>[d.name,d.pay*nrem(d,s0),d.pay*nrem(d,s0+11)]),...bl.map(d=>[d.name+(d.uz?' (uzun vadeli)':''),dTL(d),dTL(d)])];
 const tt=(a,j)=>sum(a.map(x=>x[j])),t2=(ti2,it,e)=>`<div><h3 style="margin-top:0">${ti2}</h3><table><thead><tr><th></th><th>Bu ay sonu</th><th>12 ay sonu</th></tr></thead><tbody>${it.map(x=>`<tr><td>${esc(x[0])}</td><td>${TL(x[1])}</td><td>${TL(x[2])}</td></tr>`).join('')||'<tr><td class=mut>Henüz yok</td><td></td><td></td></tr>'}</tbody><tfoot><tr><td>Toplam</td><td>${TL(tt(it,1))}</td><td>${TL(tt(it,2))}</td></tr></tfoot></table></div>`;
 const uz0=longD(s0);
 return `<div class=sec><h2>Önümüzdeki 12 ay (${ml(s0)} – ${ml(s0+11)})</h2>
 <div class=stats><div><span>Gelir (12 ay)</span><b>${TL(ti)}</b></div><div><span>Kesin ödemeler</span><b>${TL(tk)}</b></div><div><span>Kâr / zarar</span><b class="${tn<0?'neg':'pos'}">${sg(tn)}</b></div></div>
 <div class=stats style="margin-top:18px"><div><span>Nakit: bu ay sonu → 12 ay sonu</span><b ${st}>${TL(f.nb)} → ${TL(l.nb)}</b></div><div><span>Borç: bu ay sonu → 12 ay sonu</span><b ${st}>${TL(f.db)} → ${TL(l.db)}</b></div><div><span>Net varlık değişimi (12 ay)</span><b ${st} class="${dn<0?'neg':'pos'}">${sg(dn)}</b></div></div>
 ${notesHtml(nt)}</div>
 <div class=sec><div class=grid style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:start;gap:24px">${t2('Varlıklarım',vi)}${t2('Borçlarım',bi)}</div><p class=mut style="margin-top:10px">Borçların şu anki dağılımı: kısa vadeli (12 ay içinde ödenecek) ${TL(tt(bi,1)-uz0)}, uzun vadeli ${TL(uz0)}. Hesapları, altın ve dövizi Ayarlar sekmesinden düzenlersin.</p></div>
 <div class=sec><div class=wrap><table class=sm><thead><tr><th>Ay</th><th>Gelir</th><th>Kesin ödemeler</th><th>Tahmini kart</th><th>Net</th><th>Nakit (ay sonu)</th><th>Borç (ay sonu)</th><th>Net varlık</th></tr></thead><tbody>
 ${rows.map(r=>`<tr><td>${ml(r.k)}</td><td>${TL(r.inc)}</td><td>${TL(r.kes)}</td><td class=mut>${r.est>0.5?'~'+TL(r.est):'-'}</td><td${cl(r.net)}><b>${TL(r.net)}</b></td><td${cl(r.nb)}>${TL(r.nb)}</td><td>${TL(r.db)}</td><td${cl(r.nv)}>${TL(r.nv)}</td></tr>`).join('')}</tbody>
 <tfoot><tr><td>Toplam</td><td>${TL(ti)}</td><td>${TL(tk)}</td><td class=mut>${te>0.5?'~'+TL(te):'-'}</td><td${cl(tn)}>${TL(tn)}</td><td></td><td></td><td></td></tr></tfoot></table></div>
 <p class=mut style="margin-top:10px">Net = gelir − kesin ödemeler. Nakit = hesap bakiyeleri + her ayın neti. Borç: kalan kredi taksitleri, borç listesi ve ödenmemiş ekstreler (faiz hariç). Net varlık = nakit + diğer varlıklar − borç. Tahmini kart sütunu hesaplara dahil değildir. Hesaplar ve varlıklar Ayarlar sekmesinde.</p></div>`}

function aAdd(){S.accts.push({id:'h'+Date.now(),name:'Yeni hesap',bal:0,bm:today.slice(0,7)});save();render()}
function aDel(id){if(S.accts.length<=1){stat('En az bir hesap olmalı');return}S.accts=S.accts.filter(a=>a.id!==id);if(S.defAcct===id)S.defAcct=S.accts[0].id;save();render()}

let harcamaGrafigi = null;

export function grafigiGuncelle(state) {
  const ctx = document.getElementById('harcamaGrafigi');
  if (!ctx || !state || !state.gecmis) return;

  const kategoriToplami = {};
  state.gecmis.forEach(item => {
    // Sadece giderleri topla
    if (item.tutar < 0) {
      kategoriToplami[item.kategori] = (kategoriToplami[item.kategori] || 0) + Math.abs(item.tutar);
    }
  });

  const labels = Object.keys(kategoriToplami);
  const data = Object.values(kategoriToplami);

  if (harcamaGrafigi) {
    harcamaGrafigi.destroy();
  }

  // Veri yoksa grafiği çizme
  if (data.length === 0) return;

  harcamaGrafigi = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#71B37C'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
