/*
 * Depolama katmanı
 * Uygulama veriyi yalnızca Store üzerinden okur ve yazar. Altındaki depo (adapter)
 * değiştirilebilir: şu an "Bu cihaz" (tarayıcı) hazır, Google Drive ve Firebase planlanıyor.
 *
 * Bir adapter şu arayüzü sağlar:
 *   name   : ekranda görünen ad
 *   ready  : kullanıma hazır mı
 *   load() : Promise<state | null>
 *   save(state) : Promise<void>
 */
const Store=(()=>{
  const KEY='kimmusrif.veri',LEGACY='butce',AKEY='kimmusrif.depo'; // anahtarlar uygulamaya özel: aynı github.io adresindeki diğer projelerle karışmasın
  const adapters={
    local:{
      name:'Bu cihaz',ready:true,
      async load(){try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY)||'null')}catch(e){return null}}, // eski anahtar (butce) varsa oradan okur
      // localStorage yazımı eşzamanlı yapılır; sayfa kapanırken bile kaybolmaz.
      async save(state){localStorage.setItem(KEY,JSON.stringify(state))}
    },
    drive:{name:'Google Drive',ready:false,note:'Yakında'},
    firebase:{name:'Firebase (ortak kullanım)',ready:false,note:'Yakında'}
  };
  let active='local';
  try{const a=localStorage.getItem(AKEY);if(a&&adapters[a]&&adapters[a].ready)active=a}catch(e){}
  return{
    adapters,
    get active(){return active},
    label(){return adapters[active].name},
    load(){return Promise.resolve(adapters[active].load())},
    save(state){return Promise.resolve(adapters[active].save(state))},
    // Depo değiştirirken mevcut veri yeni depoya kopyalanır, eskisi silinmez.
    async switchTo(name){
      const to=adapters[name];
      if(!to||!to.ready)throw new Error('Depo hazır değil');
      if(name===active)return;
      const data=await adapters[active].load();
      await to.save(data);
      active=name;
      try{localStorage.setItem(AKEY,name)}catch(e){}
    }
  };
})();
