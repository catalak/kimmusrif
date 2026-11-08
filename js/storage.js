/*
 * Depolama katmanı
 * Firebase (ES Modules - CDN) entegre edilmiştir. NPM, Webpack veya derleyici gerektirmez.
 */
const Store = (() => {
  const KEY = 'kimmusrif.veri', LEGACY = 'butce', AKEY = 'kimmusrif.depo'; 
  
  // Verdiğin Firebase kimlik bilgileri
  const firebaseConfig = {
    apiKey: "AIzaSyDxiXUHNZzsA5wa_VjJMaWuB4RyrgeibU8",
    authDomain: "kimmusrif.firebaseapp.com",
    projectId: "kimmusrif",
    storageBucket: "kimmusrif.firebasestorage.app",
    messagingSenderId: "844853880507",
    appId: "1:844853880507:web:fed0371d4facee67ec6b9e"
  };

  const adapters = {
    local: {
      name: 'Bu cihaz', ready: true,
      async load() { try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY) || 'null') } catch (e) { return null } },
      async save(state) { localStorage.setItem(KEY, JSON.stringify(state)) }
    },
    drive: { name: 'Google Drive (İptal)', ready: false, note: 'Yerine Firebase eklendi' },
    firebase: {
      name: 'Firebase (Ortak)', ready: true,
      db: null, docRef: null,
      async init() {
        if (this.db) return;
        
        // Dinamik import: index.html'i bozmadan veya npm kurmadan modülleri doğrudan çeker
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
        const { getFirestore, doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
        
        // Veritabanında "butce" koleksiyonu altında "ortak_veri" dökümanını kullanacağız
        this.docRef = doc(this.db, "butce", "ortak_veri");

        // Gerçek zamanlı (real-time) eşitleme
        onSnapshot(this.docRef, (docSnap) => {
          // Eğer değişikliği o an telefonu elinde tutan kişi (örn. sen) yaptıysa ekran zaten günceldir, pas geç
          if (docSnap.metadata.hasPendingWrites) return; 
          
          // Değişiklik karşı taraftan (örn. Selda) geldiyse window'a haber sal
          if (docSnap.exists()) {
            window.dispatchEvent(new CustomEvent('ortakVeriGuncellendi', { detail: docSnap.data().state }));
          }
        });
      },
      async load() {
        await this.init();
        const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        try {
          const snap = await getDoc(this.docRef);
          return snap.exists() ? snap.data().state : null;
        } catch(e) {
          console.error("Firebase okuma hatası:", e);
          return null;
        }
      },
      async save(state) {
        await this.init();
        const { setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        try {
          await setDoc(this.docRef, { state: state });
        } catch(e) {
          console.error("Firebase yazma hatası:", e);
        }
      }
    }
  };
  
  let active = 'local';
  try { const a = localStorage.getItem(AKEY); if (a && adapters[a] && adapters[a].ready) active = a } catch (e) {}
  
  return {
    adapters,
    get active() { return active },
    label() { return adapters[active].name },
    load() { return Promise.resolve(adapters[active].load()) },
    save(state) { return Promise.resolve(adapters[active].save(state)) },
    async switchTo(name) {
      const to = adapters[name];
      if (!to || !to.ready) throw new Error('Depo hazır değil');
      if (name === active) return;
      
      const data = await adapters[active].load();
      await to.save(data);
      active = name;
      try { localStorage.setItem(AKEY, name) } catch (e) {}
    }
  };
})();