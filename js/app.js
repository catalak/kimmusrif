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
// Firebase'den ortak veri güncellendiğinde ekranı yenile
window.addEventListener('ortakVeriGuncellendi', (e) => {
  const yeniVeri = e.detail;
  if (yeniVeri) {
    App.state = yeniVeri;
    App.update(); // Ekranı ve grafikleri yeniden çizer
  }
});

let harcamaGrafigi = null;

function grafigiGuncelle() {
  const ctx = document.getElementById('harcamaGrafigi');
  // S.tx uygulamanın tüm harcamalarını (işlemlerini) tutuyor
  if (!ctx || !S || !S.tx) return;
  
  // Sadece aktif aydaki (S.m) giderleri filtrele
  const buAyGiderleri = S.tx.filter(t => t.type !== 'in' && Math.floor((new Date(t.date).getFullYear() - 2000) * 12 + new Date(t.date).getMonth()) === S.m);

  const kategoriToplami = {};
  buAyGiderleri.forEach(item => {
    // item.cat kategori ID'sini tutuyor, adını CL() fonksiyonu ile bulalım
    const catAdi = (CL().find(c => c.id === item.cat) || {name: item.cat}).name;
    kategoriToplami[catAdi] = (kategoriToplami[catAdi] || 0) + Number(item.amt);
  });

  const labels = Object.keys(kategoriToplami);
  const data = Object.values(kategoriToplami);

  if (harcamaGrafigi) {
    harcamaGrafigi.destroy();
  }

  if (data.length === 0) return;

  harcamaGrafigi = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#71B37C'],
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

// Orijinal render fonksiyonunu ezip (override), grafiği de tetiklemesini sağlıyoruz
const orijinalRender = render;
render = function() {
  orijinalRender();
  setTimeout(() => {
    // Sayfa DOM'a yerleştikten milisaniyeler sonra grafiği çizdir
    grafigiGuncelle();
  }, 50);
};

// Firebase dinleyicisi
window.addEventListener('ortakVeriGuncellendi', (e) => {
  const yeniVeri = e.detail;
  if (yeniVeri) {
    Object.assign(S, yeniVeri); // Uygulama durumunu (S) güncelle
    render(); 
  }
});
