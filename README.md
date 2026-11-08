# Kim Müsrif

*Kim harcadı, nereye gitti, ay sonu ne kalıyor?*

Aile bütçesini ay ay takip etmek için yazılmış, sunucusuz çalışan bir web uygulaması. Gelir, gider, kredi kartı ekstreleri, krediler, hesaplar ve borçlar tek yerde. Telefonda ve bilgisayarda tarayıcıdan açılır, istenirse ana ekrana eklenir.

> Bu proje, Claude ile adım adım geliştirildi. Tasarım kararları ve kullanım ihtiyaçları bana, kodun büyük kısmı yapay zekâ destekli yazıldı ve elle test edildi.

## Neler yapıyor

- **Ekle:** Hızlı harcama girişi (tutar, kategori, kime, nakit ya da kart, taksit, hesap).
- **Kredi kartı mantığı:** Hesap kesim ve son ödeme günleri, taksitler, ay ay ekstreler, asgari ödeme, ödenen tutar. Harcama ayı ile nakdin çıktığı ay ayrı hesaplanır.
- **Harcamalar:** Kategori × kişi dağılımı, yüzdeler ve kısa anlatıcı notlar.
- **Nakit akışı:** Ayın gelir ve ödemeleri gün sırasıyla, günlük bakiye ve "gelir ödemeleri karşılamıyor" uyarısı.
- **Projeksiyon:** Önümüzdeki 12 ay için gelir, kesin ödemeler, nakit, borç ve net varlık, hesap ve borç özetleriyle.
- **Gelirler, sabit giderler, yıllık giderler, krediler:** Tarih aralıklı, zamlı, yıla göre tutarlı.
- **Hesaplar ve varlıklar:** Birden çok banka hesabı, altın ve döviz.
- **Ayarlar:** Kişiler, kategoriler, kartlar ve hesaplar kullanıcı tarafından düzenlenir. Kayıtlar numarayla tutulduğu için bir ismi değiştirmek geçmişi bozmaz.
- **Yedek:** Tüm veriyi `.txt` dosyası olarak indirip geri yükleme.

Tahmini rakamlar (ekstresi girilmemiş kartlar) silik gösterilir ve toplamlara girmez, ekstre girilince kesinleşir.

## Çalıştırma

Derleme gerekmez, saf HTML, CSS ve JavaScript.

```bash
# depoyu klonla, sonra bir statik sunucu ile aç
python3 -m http.server 8000
# tarayıcıda http://localhost:8000
```

`index.html` dosyasını doğrudan çift tıklayarak da açabilirsin.

## GitHub Pages ile yayınlama

1. Depoyu GitHub'a gönder.
2. Depo sayfasında **Settings → Pages**.
3. **Source** olarak `Deploy from a branch`, branch olarak `main` ve `/ (root)` seç.
4. Birkaç dakika sonra `https://<kullanıcı-adı>.github.io/<depo-adı>/` adresinde yayında olur.

> Depoyu herkese açık yaparsan içine gerçek veri koyma. Kod açıktır, veri ise kullanıcının kendi cihazında durur.

## Klasör yapısı

```
index.html            sayfa iskeleti
css/style.css         görünüm
js/storage.js         depolama katmanı (Store ve adapter'lar)
js/core.js            sabitler, veri modeli, hesaplamalar
js/views.js           sekmeler ve ekranlar
js/app.js             çizim ve açılış
versions/             önceki sürümler (dönüm noktalarında saklanır)
docs/                 notlar ve yol haritası
```

Betikler sırayla yüklenir (`storage → core → views → app`) ve ortak global kapsamı paylaşır. Bilinçli olarak modül veya derleme aracı yok, basit kalsın diye.

## Depolama katmanı

Uygulama veriyi yalnızca `Store` üzerinden okur ve yazar. Altındaki depo bir **adapter** olarak takılır:

| Depo | Durum |
|---|---|
| Bu cihaz (tarayıcı hafızası) | Hazır |
| Google Drive (kullanıcının kendi hesabı) | Planlı |
| Firebase (ortak kullanım) | Planlı |

Depo değiştirildiğinde mevcut veri yeni depoya kopyalanır, eskisi silinmez. Yeni bir depo eklemek için `js/storage.js` içine `name`, `ready`, `load()` ve `save(state)` sağlayan bir nesne eklemek yeterli.

## Veri ve gizlilik

- Veri şimdilik yalnızca kullanıcının tarayıcısında durur. Hiçbir sunucuya gönderilmez. Tarayıcı hafızasında `kimmusrif.veri` anahtarıyla saklanır (eski `butce` anahtarı varsa oradan okunur).
- Tarayıcı verisi temizlenirse silinir, bu yüzden Ayarlar → Yedek ile düzenli dosya indirilmesi önerilir.
- Tutarlar bankadan çekilmez, elle girilir. Açık bankacılık bağlantısı yoktur.

## Bilinen sınırlar

- Faiz hesaplanmaz. Asgari ödemede kalan borç faizsiz taşınır.
- Hafta sonu ve tatil nedeniyle kayan ödeme günleri hesaba katılmaz.
- Bakiyeler ay bazında hesaplanır, gün içi hareket görünmez.
- Tek kullanıcılı. Ortak kullanım, değişiklik onayı ve bildirim yol haritasında.

## Yol haritası

Ayrıntı için [docs/YOL-HARITASI.md](docs/YOL-HARITASI.md).

## Sürümler

`versions/v1-claude-tek-dosya/`: Claude içinde yayınlanan ilk, tek dosyalık sürüm. Geçmişi göstermek için olduğu gibi saklanıyor.
