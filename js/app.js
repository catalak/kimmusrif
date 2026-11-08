function render(){const T=['Ekle','Özet','Harcamalar','Nakit akışı','Projeksiyon','Gelirler','Kartlar & Krediler','Sabitler','Ayarlar'];
 $('#app').innerHTML=`<nav>${T.map((t,i)=>`<button class="${i===tab?'on':''}" onclick="tab=${i};render()">${t}</button>`).join('')}<span id=st class=mut style="margin-left:auto;align-self:center">${esc(ST)}</span><button style="color:var(--acc)" onclick="document.activeElement.blur();save()">Şimdi kaydet</button></nav>`+[vEkle,vOzet,vHarc,vOde,vProj,vGelir,vKart,vSabit,vAyar][tab]()}
addEventListener('beforeunload',()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()});
async function boot(){render();const d=await Store.load();S=mig(Object.assign(def(),d||{}));render()}
boot();
// Firebase'den yeni veri geldiğinde tetiklenir
window.addEventListener('ortakVeriGuncellendi', (e) => {
  const yeniVeri = e.detail;
  // Burada uygulamanın ana "state" (veri) değişkenini 'yeniVeri' ile eşitleyip
  // ekranı yeniden çizdiren (render) fonksiyonunu çağırman gerekiyor.
});