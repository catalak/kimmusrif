let currentUserUID = null;
let familyCode = localStorage.getItem('kimmusrif_familyCode') || null;
let authModule = null;
let authInstance = null;
let pwaPromptEvent = null;

// PWA Yükleme Olayını Dinle
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaPromptEvent = e;
  // Arayüz render edildiğinde afişi göstereceğiz
  render();
});

function installPWA() {
  if (pwaPromptEvent) {
    pwaPromptEvent.prompt();
    pwaPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Kullanıcı PWA yüklemesini kabul etti');
      }
      pwaPromptEvent = null;
      render();
    });
  }
}

function joinFamily() {
  const code = prompt("Katılmak istediğiniz ailenin kodunu girin (veya ayrılmak için boş bırakın):", familyCode || "");
  if (code !== null) {
    if (code.trim() === "") {
      localStorage.removeItem('kimmusrif_familyCode');
      familyCode = null;
      alert("Aileden ayrıldınız. Artık kendi kişisel bütçenizi görüyorsunuz.");
    } else {
      localStorage.setItem('kimmusrif_familyCode', code.trim());
      familyCode = code.trim();
      alert("Aileye katıldınız! Verileriniz eşitleniyor...");
    }
    window.location.reload();
  }
}

function showFamilyCode() {
  const code = familyCode || currentUserUID;
  if(code) {
    prompt("Eşinizin veya ailenizin bütçenize ortak olması için bu kodu kopyalayıp ona gönderin:", code);
  }
}

let menuOpen = false;


const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

function render(){
  let iosBanner = '';
  if (isIos() && !isInStandaloneMode()) {
    iosBanner = `<div style="background:var(--card);border:1px solid var(--acc);color:var(--ink);padding:12px 16px;border-radius:12px;margin:16px;box-shadow:0 4px 12px rgba(211,47,47,0.2);display:flex;align-items:center;gap:12px;">
      <i class="fa fa-arrow-down" style="color:var(--acc);font-size:24px;"></i>
      <div style="font-size:12px;">Uygulamayı kurmak için alttaki <b>Paylaş</b> ikonuna basıp <b>'Ana Ekrana Ekle'</b>yi seçin.</div>
    </div>`;
  }

  // Alt Menü: Sadece Ana Sayfa (Özet), Ekle ve Ayarlar
  const B = [
    {t:'Görünüm', i:'fa-chart-pie', v:1},
    {t:'Ayarlar', i:'fa-cog', v:8}
  ];
  
  // Hamburger (Yan Menü) İçeriği
  const sideMenu = [
    {t:'Harcamalar', i:'fa-receipt', v:2},
    {t:'Nakit', i:'fa-water', v:3},
    {t:'Projeksiyon', i:'fa-chart-line', v:4},
    {t:'Gelirler', i:'fa-wallet', v:5},
    {t:'Kartlar', i:'fa-credit-card', v:6},
    {t:'Sabitler', i:'fa-calendar-check', v:7}
  ];
  
  // PWA İndirme Afişi
  const pwaBanner = pwaPromptEvent ? `
    <div style="background:var(--acc);color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-radius:12px;margin:16px;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
      <div style="display:flex;align-items:center;gap:12px;">
        <i class="fa fa-download" style="font-size:20px;"></i>
        <div style="display:flex;flex-direction:column;">
          <span style="font-weight:700;font-size:14px;">Uygulamayı İndir</span>
          <span style="font-size:11px;opacity:0.9;">Daha hızlı erişim için ana ekrana ekle</span>
        </div>
      </div>
      <button onclick="installPWA()" style="background:white;color:var(--acc);border:none;padding:8px 16px;border-radius:16px;font-weight:700;font-size:13px;cursor:pointer;">Yükle</button>
    </div>
  ` : '';

  // Üst Başlık (Hamburger Menülü)
  const topBar = `
<header style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:var(--bg); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); background: rgba(240, 244, 248, 0.85);;position:sticky;top:0;z-index:50;">
<div style="display:flex;align-items:center;gap:12px;">
  <button onclick="menuOpen=true;render()" style="background:transparent;border:none;color:var(--ink);font-size:20px;cursor:pointer;padding:4px;margin-left:-4px;"><i class="fa fa-bars"></i></button>
  <h1 style="margin:0;font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-0.5px;display:flex;align-items:center;gap:8px;"><i class="fa fa-wallet" style="color:var(--acc);"></i> Müsrif 
    ${ST === 'Kaydedildi' ? '<i class="fa fa-check-circle" style="color:var(--pos);font-size:18px;animation: popIn 0.3s ease-out;"></i>' : (ST ? `<span style="font-size:10px;font-weight:700;background:var(--line);padding:4px 8px;border-radius:8px;color:var(--mut);">${esc(ST)}</span>` : '')}
  </h1>
</div>
<div style="display:flex;align-items:center;gap:12px;">
  <button id="btn-logout-header" style="background:#F3F4F6;border:none;color:var(--mut);width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Çıkış Yap">
    <i class="fa fa-sign-out-alt"></i>
  </button>
</div>
</header>`;
  
  // Yan Menü Çekmecesi (Drawer)
  const drawer = `<div style="position:fixed;top:0;left:0;bottom:0;width:260px;background:white;z-index:2000;box-shadow:4px 0 20px rgba(0,0,0,0.1);transform:translateX(${menuOpen?'0':'-100%'});transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:flex;flex-direction:column;">
<div style="padding:20px 20px 16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);">
  <h2 style="margin:0;font-size:18px;">Menü</h2>
  <button onclick="menuOpen=false;render()" style="background:transparent;border:none;font-size:20px;color:var(--mut);cursor:pointer;"><i class="fa fa-times"></i></button>
</div>
<div style="flex:1; overflow-y:auto; padding: 10px 0;">
  ${sideMenu.map(item=>`<button onclick="tab=${item.v};menuOpen=false;render()" style="background:${tab===item.v?'rgba(211, 47, 47, 0.1)':'transparent'};border:none;padding:12px 24px;width:100%;text-align:left;display:flex;align-items:center;gap:14px;font-size:15px;font-weight:600;color:${tab===item.v?'var(--acc)':'#E0E0E0'};cursor:pointer;"><i class="fa ${item.i}" style="width:20px;text-align:center;"></i>${item.t}</button>`).join('')}
</div>
<div style="padding:16px 20px 24px 20px;border-top:1px solid var(--line);background:var(--card);">
  <p style="font-size:11px;color:var(--mut);margin:0 0 10px 0;text-transform:uppercase;font-weight:700;">Ortak Kasa ${familyCode?'(Aktif)':'(Kapalı)'}</p>
  <button onclick="showFamilyCode()" style="background:#fff;border:1px solid var(--line);padding:10px;border-radius:12px;width:100%;text-align:center;font-weight:600;font-size:13px;color:var(--ink);cursor:pointer;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.02);"><i class="fa fa-share-alt" style="margin-right:6px;"></i>Kodu Paylaş</button>
  <button onclick="joinFamily()" style="background:white;border:1px solid var(--line);padding:10px;border-radius:12px;width:100%;text-align:center;font-weight:600;font-size:13px;color:${familyCode?'var(--neg)':'var(--acc)'};cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.02);">${familyCode?'<i class="fa fa-user-times" style="margin-right:6px;"></i>Ortaklıktan Çık':'<i class="fa fa-users" style="margin-right:6px;"></i>Bir Koda Katıl'}</button>
</div>
</div>
<div onclick="menuOpen=false;render()" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1900;display:${menuOpen?'block':'none'};transition:opacity 0.3s;opacity:${menuOpen?'1':'0'};"></div>
`;
  
  // Alt Menü Barı (Sadece 3 Buton)
  const bottomNav = `<nav class="bottom-nav" style="justify-content:space-around;padding:10px 10px 24px 10px;">
    ${B.map((item,i)=>`<button class="nav-item ${tab===item.v?'on':''}" onclick="tab=${item.v};render()">
      <i class="fa ${item.i}"></i>
      <span>${item.t}</span>
    </button>`).join('')}
  </nav>`;
  
  // İçerik Alanı
  
  const fab = tab !== 0 ? `<div class="fab-container"><button class="fab" onclick="tab=0;render()"><i class="fa fa-plus"></i></button></div>` : '';
  const content = fab + `<div class="main-content"  style="padding-bottom:100px; max-width: 800px; margin: 0 auto;">` + pwaBanner + iosBanner + [vEkle,vOzet,vHarc,vOde,vProj,vGelir,vKart,vSabit,vAyar][tab]() + `</div>`;
  
  $('#app').innerHTML = topBar + drawer + content + bottomNav;
  
  const loBtn = document.getElementById('btn-logout-header');
  if(loBtn) loBtn.onclick = () => { if(authModule && authInstance) authModule.signOut(authInstance); };
}

addEventListener('beforeunload',()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()});

window.addEventListener('ortakVeriGuncellendi', (e) => {
  const yeniVeri = e.detail;
  if (yeniVeri) {
    Object.assign(S, yeniVeri); 
    render(); 
  }
});

async function initAuth() {
  const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
  authModule = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js");
  
  const firebaseConfig = {
    apiKey: "AIzaSyDxiXUHNZzsA5wa_VjJMaWuB4RyrgeibU8",
    authDomain: "kimmusrif.firebaseapp.com",
    projectId: "kimmusrif",
    storageBucket: "kimmusrif.firebasestorage.app",
    messagingSenderId: "844853880507",
    appId: "1:844853880507:web:fed0371d4facee67ec6b9e"
  };
  
  const app = fbApp.initializeApp(firebaseConfig);
  authInstance = authModule.getAuth(app);
  const provider = new authModule.GoogleAuthProvider();

  const loginBtn = document.getElementById('btn-google-login');
  if(loginBtn) {
    loginBtn.addEventListener('click', () => {
      authModule.signInWithPopup(authInstance, provider).catch(err => {
        console.error("Giriş hatası:", err);
        const errDiv = document.getElementById('login-error');
        if(errDiv) errDiv.style.display = 'block';
      });
    });
  }

  authModule.onAuthStateChanged(authInstance, async (user) => {
    if (user) {
      currentUserUID = user.uid;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-container').style.display = 'block';
      
      // Aile kodu varsa onu, yoksa kendi UID'sini kullan
      const d = await Store.load(currentUserUID, familyCode);
      S = mig(Object.assign(def(), d || {}));
      
      // Giriş yapınca varsayılan olarak sekme 1 (Özet) açılsın
      tab = 1;
      
      if(Store.active !== 'firebase') {
          try { await Store.switchTo('firebase', currentUserUID, familyCode); } catch(e){}
      }
      render();
    } else {
      currentUserUID = null;
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('app-container').style.display = 'none';
    }
  });
}

const originalSave = save;
window.save = function() {
   if(Store.active === 'firebase' && !currentUserUID) return; 
   Store.save(S, currentUserUID, familyCode);
   ST = 'Kaydedildi';
   render();
   setTimeout(() => { if(ST === 'Kaydedildi') { ST = ''; render(); } }, 2000);
};

initAuth();