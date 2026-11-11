// Mobildeki 300ms tıklama gecikmesini (tap delay) iptal eder, anında tepki verir.
document.body.style.touchAction = 'manipulation';

let currentUserUID = null;
let familyCode = localStorage.getItem('kimmusrif_familyCode') || null;
let authModule = null;
let authInstance = null;
let pwaPromptEvent = null;

// PWA Yükleme Olayını Dinle
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaPromptEvent = e;
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

// Menüyü sayfayı yenilemeden (re-render yapmadan) CSS ile pürüzsüz açıp kapatan fonksiyon
window.toggleMenu = function(state) {
  const drawerEl = document.getElementById('main-drawer');
  const overlayEl = document.getElementById('main-overlay');
  if(drawerEl && overlayEl) {
    if(state) {
      drawerEl.style.transform = 'translateX(0)';
      overlayEl.style.pointerEvents = 'auto';
      overlayEl.style.opacity = '1';
    } else {
      drawerEl.style.transform = 'translateX(-100%)';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.style.opacity = '0';
    }
  }
};

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

  const B = [
    {t:'Görünüm', i:'fa-chart-pie', v:1},
    {t:'Ayarlar', i:'fa-cog', v:8}
  ];
  
  const sideMenu = [
    {t:'Harcamalar', i:'fa-receipt', v:2},
    {t:'Nakit', i:'fa-water', v:3},
    {t:'Projeksiyon', i:'fa-chart-line', v:4},
    {t:'Gelirler', i:'fa-wallet', v:5},
    {t:'Kartlar', i:'fa-credit-card', v:6},
    {t:'Sabitler', i:'fa-calendar-check', v:7}
  ];
  
  const pwaBanner = pwaPromptEvent ? `
    <div style="background:var(--acc);color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-radius:12px;margin:16px;box-shadow:0 4px 12px rgba(211,47,47,0.3);">
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

  // HEADER - Sadece yeşil tik kaldı, uzun metin silindi. Hamburger butonu artık toggleMenu çağırıyor.
  const topBar = `
<header style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px; background: rgba(18, 18, 18, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); position:sticky;top:0;z-index:50;">
<div style="display:flex;align-items:center;gap:12px;">
  <button onclick="toggleMenu(true)" style="background:transparent;border:none;color:var(--ink);font-size:20px;cursor:pointer;padding:4px;margin-left:-4px; touch-action: manipulation;"><i class="fa fa-bars"></i></button>
  <h1 style="margin:0;font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-0.5px;display:flex;align-items:center;gap:8px;"><i class="fa fa-wallet" style="color:var(--acc);"></i> Müsrif 
    ${ST === 'Kaydedildi' ? '<i class="fa fa-check-circle" style="color:var(--pos);font-size:18px;animation: popIn 0.3s ease-out;"></i>' : ''}
  </h1>
</div>
<div style="display:flex;align-items:center;gap:12px;">
  <button id="btn-logout-header" style="background:#2C2C2C;border:none;color:var(--mut);width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition: 0.2s;" title="Çıkış Yap">
    <i class="fa fa-sign-out-alt"></i>
  </button>
</div>
</header>`;
  
  // DRAWER - CSS ile kontrol ediliyor. DOM yıkılmıyor.
  const drawer = `<div id="main-drawer" style="position:fixed;top:0;left:0;bottom:0;width:260px;background:var(--card);z-index:2000;box-shadow:4px 0 20px rgba(0,0,0,0.5);transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:flex;flex-direction:column; will-change: transform;">
<div style="padding:20px 20px 16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);">
  <h2 style="margin:0;font-size:18px;color:var(--ink);">Menü</h2>
  <button onclick="toggleMenu(false)" style="background:transparent;border:none;font-size:20px;color:var(--mut);cursor:pointer; touch-action: manipulation;"><i class="fa fa-times"></i></button>
</div>
<div style="flex:1; overflow-y:auto; padding: 10px 0;">
  ${sideMenu.map(item=>`<button onclick="tab=${item.v}; render();" style="background:${tab===item.v?'rgba(211, 47, 47, 0.1)':'transparent'};border:none;padding:12px 24px;width:100%;text-align:left;display:flex;align-items:center;gap:14px;font-size:15px;font-weight:600;color:${tab===item.v?'var(--acc)':'var(--mut)'};cursor:pointer; touch-action: manipulation;"><i class="fa ${item.i}" style="width:20px;text-align:center;"></i>${item.t}</button>`).join('')}
</div>
<div style="padding:16px 20px 24px 20px;border-top:1px solid var(--line);background:#151515;">
  <p style="font-size:11px;color:var(--mut);margin:0 0 10px 0;text-transform:uppercase;font-weight:700;">Ortak Kasa ${familyCode?'(Aktif)':'(Kapalı)'}</p>
  <button onclick="showFamilyCode()" style="background:#2C2C2C;border:1px solid var(--line);padding:10px;border-radius:12px;width:100%;text-align:center;font-weight:600;font-size:13px;color:var(--ink);cursor:pointer;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.2); touch-action: manipulation;"><i class="fa fa-share-alt" style="margin-right:6px;"></i>Kodu Paylaş</button>
  <button onclick="joinFamily()" style="background:#2C2C2C;border:1px solid var(--line);padding:10px;border-radius:12px;width:100%;text-align:center;font-weight:600;font-size:13px;color:${familyCode?'var(--neg)':'var(--acc)'};cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.2); touch-action: manipulation;">${familyCode?'<i class="fa fa-user-times" style="margin-right:6px;"></i>Ortaklıktan Çık':'<i class="fa fa-users" style="margin-right:6px;"></i>Bir Koda Katıl'}</button>
</div>
</div>
<div id="main-overlay" onclick="toggleMenu(false)" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1900; pointer-events:none; opacity:0; transition:opacity 0.3s; will-change: opacity; -webkit-tap-highlight-color: transparent;"></div>
`;
  
  // Alt Menü
  const bottomNav = `<nav class="bottom-nav" style="justify-content:space-around;padding:10px 10px 24px 10px; background: rgba(30, 30, 30, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid var(--line);">
    ${B.map((item,i)=>`<button class="nav-item ${tab===item.v?'on':''}" onclick="tab=${item.v};render()" style="touch-action: manipulation;">
      <i class="fa ${item.i}"></i>
      <span>${item.t}</span>
    </button>`).join('')}
  </nav>`;
  
  // İçerik Alanı
  const fab = tab !== 0 ? `<div class="fab-container"><button class="fab" onclick="tab=0;render()" style="touch-action: manipulation;"><i class="fa fa-plus"></i></button></div>` : '';
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
      
      const d = await Store.load(currentUserUID, familyCode);
      S = mig(Object.assign(def(), d || {}));
      
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