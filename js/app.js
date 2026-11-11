document.body.style.touchAction = 'manipulation';
let currentUserUID = null;
let familyCode = localStorage.getItem('kimmusrif_familyCode') || null;
let authModule = null;
let authInstance = null;
let pwaPromptEvent = null;

// Sabit Arayüzü (Menü, Üst Bar, Modal) Sadece 1 Kez Çizer
function initShell() {
    if(document.getElementById('shell-initialized')) return;
    
    const shellHTML = `
        <div id="shell-initialized" style="display:none;"></div>
        
        <header style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); position:sticky;top:0;z-index:50;">
            <div style="display:flex;align-items:center;gap:12px;">
                <button onclick="toggleMenu(true)" style="background:transparent;border:none;color:var(--ink);font-size:20px;cursor:pointer;padding:4px;margin-left:-4px; touch-action: manipulation;"><i class="fa fa-bars"></i></button>
                <h1 style="margin:0;font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-0.5px;display:flex;align-items:center;gap:8px;">
                    <i class="fa fa-wallet" style="color:var(--acc);"></i> Müsrif 
                    <span id="save-indicator"></span>
                </h1>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
                <button id="btn-logout-header" style="background:#F1F5F9;border:none;color:var(--mut);width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition: 0.2s;" title="Çıkış Yap">
                    <i class="fa fa-sign-out-alt"></i>
                </button>
            </div>
        </header>

        <div id="main-drawer" style="position:fixed;top:0;left:0;bottom:0;width:260px;background:var(--card);z-index:2000;box-shadow:4px 0 20px rgba(0,0,0,0.1);transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:flex;flex-direction:column; will-change: transform;">
            <div style="padding:20px 20px 16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);">
                <h2 style="margin:0;font-size:18px;color:var(--ink);">Menü</h2>
                <button onclick="toggleMenu(false)" style="background:transparent;border:none;font-size:20px;color:var(--mut);cursor:pointer; touch-action: manipulation;"><i class="fa fa-times"></i></button>
            </div>
            <div id="drawer-menu-items" style="flex:1; overflow-y:auto; padding: 10px 0;"></div>
            <div style="padding:16px 20px 24px 20px;border-top:1px solid var(--line);background:#F8FAFC;">
                <p style="font-size:11px;color:var(--mut);margin:0 0 10px 0;text-transform:uppercase;font-weight:800;letter-spacing:0.5px;">Ortak Kasa <span id="family-status"></span></p>
                <button onclick="showFamilyCode()" style="background:#FFF;border:1px solid var(--line);padding:12px;border-radius:14px;width:100%;text-align:center;font-weight:700;font-size:13px;color:var(--ink);cursor:pointer;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.02); touch-action: manipulation;"><i class="fa fa-share-alt" style="margin-right:6px;"></i>Kodu Paylaş</button>
                <button id="btn-family-action" onclick="joinFamily()" style="background:#FFF;border:1px solid var(--line);padding:12px;border-radius:14px;width:100%;text-align:center;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.02); touch-action: manipulation;"></button>
            </div>
        </div>
        <div id="main-overlay" onclick="toggleMenu(false)" style="position:fixed;inset:0;background:rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); z-index:1900; pointer-events:none; opacity:0; transition:opacity 0.3s; will-change: opacity; -webkit-tap-highlight-color: transparent;"></div>

        <div id="pwa-banner-container"></div>

        <div id="app-content-area" class="main-content" style="padding-bottom:100px; max-width: 800px; margin: 0 auto;"></div>

        <div id="fab-container" class="fab-container" style="display:none;">
            <button class="fab" onclick="tab=0;render()" style="touch-action: manipulation;"><i class="fa fa-plus"></i></button>
        </div>

        <nav id="bottom-nav-bar" class="bottom-nav"></nav>

        <div id="add-modal-overlay" class="modal-overlay" onclick="closeModal()"></div>
        <div id="add-modal-content" class="modal-content">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeModal()"><i class="fa fa-times"></i></button>
            <h2 id="modal-title" style="margin-top:0; margin-bottom: 24px; font-size: 22px; color: var(--ink);">Yeni Kayıt</h2>
            <div id="add-modal-body"></div>
        </div>
    `;
    document.getElementById('app').innerHTML = shellHTML;
    document.getElementById('btn-logout-header').onclick = () => { if(authModule && authInstance) authModule.signOut(authInstance); };
}

// Modal Kontrolleri
window.isModalOpen = false;
window.openModal = function() {
    window.isModalOpen = true;
    document.getElementById('add-modal-overlay').classList.add('show');
    document.getElementById('add-modal-content').classList.add('show');
    renderModalContent();
}
window.closeModal = function() {
    window.isModalOpen = false;
    document.getElementById('add-modal-overlay').classList.remove('show');
    document.getElementById('add-modal-content').classList.remove('show');
    if(window.EI >= 0 && typeof window.cancelEdit === 'function') { window.cancelEdit(); }
}
window.renderModalContent = function() {
    const modalBody = document.getElementById('add-modal-body');
    if(modalBody && window.isModalOpen) {
        document.getElementById('modal-title').innerText = (window.EI >= 0) ? 'Kaydı Düzenle' : 'Yeni Kayıt';
        modalBody.innerHTML = window.vEkle();
    }
}

// Add/Edit tetikleyicilerini Modal'a bağla
const existingAdd = window.add;
if(existingAdd) {
    window.add = function() {
        existingAdd();
        closeModal();
    };
}
const existingEdit = window.edit;
if(existingEdit) {
    window.edit = function(i) {
        existingEdit(i);
        openModal();
    };
}

// Pürüzsüz Menü Açılışı
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

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaPromptEvent = e;
  render();
});
function installPWA() {
  if (pwaPromptEvent) {
    pwaPromptEvent.prompt();
    pwaPromptEvent.userChoice.then(() => { pwaPromptEvent = null; render(); });
  }
}
function joinFamily() {
  const code = prompt("Katılmak istediğiniz ailenin kodunu girin (veya ayrılmak için boş bırakın):", familyCode || "");
  if (code !== null) {
    if (code.trim() === "") { localStorage.removeItem('kimmusrif_familyCode'); familyCode = null; alert("Aileden ayrıldınız."); } 
    else { localStorage.setItem('kimmusrif_familyCode', code.trim()); familyCode = code.trim(); alert("Aileye katıldınız!"); }
    window.location.reload();
  }
}
function showFamilyCode() {
  const code = familyCode || currentUserUID;
  if(code) prompt("Eşinizin veya ailenizin bütçenize ortak olması için bu kodu kopyalayıp ona gönderin:", code);
}

// Sadece aktif sekmeyi ve buton renklerini değiştiren fonksiyon
function renderShellState() {
    const sideMenu = [
        {t:'Harcamalar', i:'fa-receipt', v:2},
        {t:'Nakit', i:'fa-water', v:3},
        {t:'Projeksiyon', i:'fa-chart-line', v:4},
        {t:'Gelirler', i:'fa-wallet', v:5},
        {t:'Kartlar', i:'fa-credit-card', v:6},
        {t:'Sabitler', i:'fa-calendar-check', v:7}
    ];
    document.getElementById('drawer-menu-items').innerHTML = sideMenu.map(item=>
        `<button onclick="tab=${item.v}; toggleMenu(false); render();" style="background:${tab===item.v?'rgba(59, 130, 246, 0.12)':'transparent'};border:none;padding:12px 24px;width:100%;text-align:left;display:flex;align-items:center;gap:14px;font-size:15px;font-weight:700;color:${tab===item.v?'var(--acc)':'var(--mut)'};cursor:pointer; touch-action: manipulation;"><i class="fa ${item.i}" style="width:20px;text-align:center;"></i>${item.t}</button>`
    ).join('');

    const B = [{t:'Görünüm', i:'fa-chart-pie', v:1}, {t:'Ayarlar', i:'fa-cog', v:8}];
    document.getElementById('bottom-nav-bar').innerHTML = B.map(item=>
        `<button class="nav-item ${tab===item.v?'on':''}" onclick="tab=${item.v};render()" style="touch-action: manipulation;">
          <i class="fa ${item.i}"></i>
          <span>${item.t}</span>
        </button>`
    ).join('');

    document.getElementById('fab-container').style.display = (tab !== 0 && tab !== undefined) ? 'block' : 'none';

    document.getElementById('family-status').innerText = familyCode ? '(Aktif)' : '(Kapalı)';
    const btnFam = document.getElementById('btn-family-action');
    if (familyCode) {
        btnFam.innerHTML = '<i class="fa fa-user-times" style="margin-right:6px;"></i>Ortaklıktan Çık';
        btnFam.style.color = 'var(--neg)';
    } else {
        btnFam.innerHTML = '<i class="fa fa-users" style="margin-right:6px;"></i>Bir Koda Katıl';
        btnFam.style.color = 'var(--acc)';
    }

    document.getElementById('save-indicator').innerHTML = ST === 'Kaydedildi' ? '<i class="fa fa-check-circle" style="color:var(--pos);font-size:18px;animation: popIn 0.3s ease-out;"></i>' : '';
    
    document.getElementById('pwa-banner-container').innerHTML = pwaPromptEvent ? `
    <div style="background:var(--acc);color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-radius:12px;margin:16px;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
      <div style="display:flex;align-items:center;gap:12px;">
        <i class="fa fa-download" style="font-size:20px;"></i>
        <div style="display:flex;flex-direction:column;">
          <span style="font-weight:700;font-size:14px;">Uygulamayı İndir</span>
          <span style="font-size:11px;opacity:0.9;">Daha hızlı erişim için ana ekrana ekle</span>
        </div>
      </div>
      <button onclick="installPWA()" style="background:white;color:var(--acc);border:none;padding:8px 16px;border-radius:16px;font-weight:700;font-size:13px;cursor:pointer; touch-action: manipulation;">Yükle</button>
    </div>` : '';
}

// Ana Render (Artık sadece #app-content-area divinin içini yeniler, menü bozulmaz)
function render(){
    initShell();

    if (tab === 0) {
        tab = window.previousTab || 1; 
        openModal();
    } else {
        window.previousTab = tab;
    }

    renderShellState();

    const viewsArr = [window.vEkle, window.vOzet, window.vHarc, window.vOde, window.vProj, window.vGelir, window.vKart, window.vSabit, window.vAyar];
    const viewFn = (tab >= 0 && tab <= 8 && typeof viewsArr[tab] === 'function') ? viewsArr[tab]() : '';
    
    document.getElementById('app-content-area').innerHTML = viewFn;
}

window.addEventListener('ortakVeriGuncellendi', (e) => {
  if (e.detail) { Object.assign(S, e.detail); render(); }
});

async function initAuth() {
  const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
  authModule = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js");
  
  const app = fbApp.initializeApp({
    apiKey: "AIzaSyDxiXUHNZzsA5wa_VjJMaWuB4RyrgeibU8",
    authDomain: "kimmusrif.firebaseapp.com",
    projectId: "kimmusrif"
  });
  authInstance = authModule.getAuth(app);
  const provider = new authModule.GoogleAuthProvider();

  const loginBtn = document.getElementById('btn-google-login');
  if(loginBtn) {
    loginBtn.addEventListener('click', () => {
      authModule.signInWithPopup(authInstance, provider).catch(err => {
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
   setTimeout(() => { if(ST === 'Kaydedildi') { ST = ''; renderShellState(); } }, 2000);
};

initAuth();