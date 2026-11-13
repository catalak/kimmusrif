/*
 * Depolama katmanı
 * Firebase (ES Modules - CDN) entegre edilmiştir. NPM, Webpack veya derleyici gerektirmez.
 */
const Store = (() => {
  const KEY = 'kimmusrif.veri', LEGACY = 'butce', AKEY = 'kimmusrif.depo'; 
  
  const firebaseConfig = {
    apiKey: "AIzaSyDxiXUHNZzsA5wa_VjJMaWuB4RyrgeibU8",
    authDomain: "kimmusrif.firebaseapp.com",
    projectId: "kimmusrif",
    storageBucket: "kimmusrif.firebasestorage.app",
    messagingSenderId: "844853880507",
    appId: "1:844853880507:web:fed0371d4facee67ec6b9e"
  };

  let unsubSnapshot = null;

  const adapters = {
    local: {
      name: 'Bu cihaz', ready: true,
      async load() { try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY) || 'null') } catch (e) { return null } },
      async save(state) { localStorage.setItem(KEY, JSON.stringify(state)) }
    },
    firebase: {
      name: 'Firebase (Bulut)', ready: true,
      db: null, docRef: null, currentDocId: null,
      async init(uid, familyCode=null) {
        if (!uid || uid === 'misafir_kullanici') {
          throw new Error('Misafir modunda bulut depolama kullanılamaz.');
        }
        const targetDocId = familyCode || uid;
        if (this.db && this.currentDocId === targetDocId) return;

        const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
        const { getFirestore, doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        this.db = getFirestore(app);
        this.currentDocId = targetDocId;
        this.docRef = doc(this.db, "butce", targetDocId);

        if (unsubSnapshot) unsubSnapshot();
        unsubSnapshot = onSnapshot(this.docRef, (docSnap) => {
          if (docSnap.metadata.hasPendingWrites) return; 
          if (docSnap.exists()) {
            window.dispatchEvent(new CustomEvent('ortakVeriGuncellendi', { detail: docSnap.data().state }));
          }
        });
      },
      async load(uid, familyCode=null) {
        await this.init(uid, familyCode);
        const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        try {
          const snap = await getDoc(this.docRef);
          return snap.exists() ? snap.data().state : null;
        } catch(e) {
          console.error("Firebase okuma hatası:", e);
          return null;
        }
      },
      async save(state, uid, familyCode=null) {
        await this.init(uid, familyCode);
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
    load(uid, fc) { return Promise.resolve(adapters[active].load(uid, fc)) },
    save(state, uid, fc) { return Promise.resolve(adapters[active].save(state, uid, fc)) },
    async switchTo(name, uid=null, fc=null) {
      const to = adapters[name];
      if (!to || !to.ready) throw new Error('Depo hazır değil');
      if (name === active) return;
      
      const currentUid = uid || (typeof currentUserUID !== 'undefined' ? currentUserUID : null);
      const currentFc = fc || (typeof familyCode !== 'undefined' ? familyCode : null);

      if (name === 'firebase' && (!currentUid || currentUid === 'misafir_kullanici')) {
        throw new Error('Bulut depolama için Google ile giriş yapmalısınız.');
      }

      const data = await adapters[active].load(currentUid, currentFc);
      if (data) await to.save(data, currentUid, currentFc);
      active = name;
      try { localStorage.setItem(AKEY, name) } catch (e) {}
    }
  };
})();