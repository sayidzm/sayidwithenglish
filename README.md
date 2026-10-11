# sayidwithenglish

Türkçe konuşan Sayid için kişisel İngilizce öğrenme çalışma alanı. Mevcut uygulama, ortak responsive kabuk içinde sekiz dolu ekran ve etkileşimli mock akışlar içerir. [Master PRD](docs/01_MASTER_PRD.md) hedef ürünü; bu README ise çalışan frontend prototipini anlatır.

## Kurulum ve çalıştırma

Node.js 20.9 veya üzeri ve npm gerekir. Inter Latin ve Latin-ext font dosyaları npm paketiyle yerel olarak gelir; `next/font/local` kullanılır. `.env`, servis hesabı veya API anahtarı gerekmez.

```sh
npm ci
npm run dev
```

[localhost:3000](http://localhost:3000) üzerinde açın. `/`, `/dashboard` sayfasına yönlendirir.

| Komut | İşlev |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Önceden derlenmiş uygulamayı başlatır |
| `npm run lint` | ESLint kontrolü |
| `npm run typecheck` | Next.js route türlerini üretir ve TypeScript kontrolünü çalıştırır |
| `npm run test:e2e` | Playwright ile shell ve prototip akışlarını doğrular |

E2E testlerinden önce `npm run build` çalıştırılmalıdır. Playwright makinede kurulu Google Chrome'u kullanır; üretim sunucusunu `127.0.0.1:3100` üzerinde başlatır. Test ekranları 1440×900, 768×1024, 390×844 ve 320×720 boyutlarındadır. Test kapsamı navigasyon, yatay taşma, command palette, mobil menü, sidebar daraltma, kütüphane filtreleri/görünümleri, drawer düzenleme/focus dönüşü, mock işleme/kaydetme, desteklenmeyen giriş, tekrar ilerlemesi/odak modu, tutor yanıtları, ayarların ekranlara yansıması ve örnek alıştırmalardır.

Son tamamlanan doğrulamada lint, TypeScript ve üretim derlemesi başarılıdır. Lint sonucu 0 hata ve 0 uyarıdır. Playwright sonucu 81 başarılı ve ilgili ekran boyutuna uygulanmadığı için atlanan 7 testtir (88 test). Sonuçların ve görsel iyileştirme turlarının özeti [QA raporunda](qa/QA_REPORT.md) bulunur.

## Ekran görüntüleri

Masaüstü (1440×900) ve mobil (390×844) görünümler. `qa/final/` içindeki son capture matrisinden seçilmiştir; bu klasördeki görseller Git'e işlenir.

| Dashboard | Ekle (AI işlemiş) |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Ekle](docs/screenshots/add.png) |

| Kütüphane | Kayıt detayı (drawer) |
| --- | --- |
| ![Kütüphane](docs/screenshots/library.png) | ![Kayıt detayı](docs/screenshots/library-drawer.png) |

| Öğren | Tekrar (kart arka yüzü) |
| --- | --- |
| ![Öğren](docs/screenshots/learn.png) | ![Tekrar](docs/screenshots/review.png) |

| Tutor (düzeltme) | İstatistikler |
| --- | --- |
| ![Tutor](docs/screenshots/tutor.png) | ![İstatistikler](docs/screenshots/statistics.png) |

| Ayarlar | Mobil: dashboard / kütüphane |
| --- | --- |
| ![Ayarlar](docs/screenshots/settings.png) | ![Mobil dashboard](docs/screenshots/mobile-dashboard.png) ![Mobil kütüphane](docs/screenshots/mobile-library.png) |

## Mevcut ekranlar

| Yol | Uygulanan içerik ve davranış |
| --- | --- |
| `/dashboard` | Dört KPI, haftalık aktivite/dönem seçimi, günlük hedef halkası, son eklenenler, zorlanılan ifadeler, tekrar CTA ve aktivite heatmap'i; kayıtlardan detay açılır |
| `/add` | Satır bazlı giriş ve canlı sayaç, kaynak/deck/etiket metadata'sı, altı aşamalı mock işleme, hazır sonuç önizlemeleri ve oturum içi kütüphaneye kaydetme |
| `/library` | İfade/anlam/etiket araması; tür, CEFR, durum, kaynak ve tarih filtreleri; tablo/kart/liste görünümleri; kayıt detayında ifade ve kişisel not düzenleme |
| `/learn` | Altı öğrenme modu kartı; flashcards tekrar ekranına gider; quiz, boşluk doldurma, translation ve writing için birer yerel örnek alıştırma; listening devre dışıdır |
| `/review` | İlerleme, flashcard ön/arka yüz, dört değerlendirme, oturum tamamlama/yeniden başlatma ve kabuğu gizleyen odak modu |
| `/tutor` | Hazır konuşma, düzeltme kartı, bağlam paneli, dört prompt ve metin girişine yerel hazır yanıt; yeni konuşma başlangıç örneğine döner |
| `/statistics` | Dört KPI, haftalık aktivite, öğrenilenler, CEFR/kaynak/tür dağılımları, zor kategoriler ve heatmap |
| `/settings` | Seviye, hedef, günlük limit, aksan, kart türleri ve tekrar kısayollarını oturum içinde kaydetme; koyu tema aktif, açık tema açıklaması |

Masaüstünde sidebar 216px'tir ve 64px'e daraltılabilir. Tablet genişliklerinde (640–1023px) sidebar sabit 64px olur. Mobilde (<640px) beş öğeli alt navigasyon ve tüm sekiz sayfayı açan üst menü bulunur. Topbar 56px yüksekliğindedir. Dar ekranlarda KPI'lar iki kolon, kütüphane kayıtları kart, detay paneli ekran genişliğinde, işleme ve tutor panelleri tek kolon olur.

Arama düğmesi veya `Ctrl/Cmd + K`, yalnız sayfa adlarını filtreleyen hızlı erişim penceresini açar. Ok tuşları, Enter ve Escape desteklenir. Kayıt araması `/library` içinde yapılır. Bildirim menüsü boş durum gösterir; profil bağlantısı Ayarlar'a gider. Sayid profili statik UI bilgisidir. Tekrar ekranında `Space` anlamı açar, `1–4` açılmış kartı değerlendirir; form/bağlantı/düğme odağında ve açık dialog'da bu genel tekrar kısayolları devreye girmez. `N` ve `/` ürün kısayolları uygulanmamıştır.

## Mock veri ve uygulama sınırları

`lib/mock-data.ts` on ayrıntılı örnek kayıt ve 342 kayıtlık örnek toplamla birlikte grafik, dağılım, konuşma ve alıştırma fixture'larını merkezi olarak tutar. 342 gerçek veya yüklenmiş satır değildir; filtreler on örnek ve bu oturumda eklenen kayıtlar üzerinde çalışır. Toplam/eklenen KPI'ları yeni kayıtlara göre artar. Grafikler, doğruluk, seri, öğrenilen ve zor kayıt toplamları gerçek kullanıcı olaylarından hesaplanmaz; örnek fixture'lardır. Dashboard'un 24 tekrar değeri ile review oturumunun 12'den başlayan ilerlemesi ayrı örneklerdir.

`PrototypeProvider` eklenen kayıtları, ifade/not değişikliklerini, ayarları, tekrar sayacını ve odak modunu React belleğinde tutar. Bunlar uygulama içindeki sayfa geçişlerinde korunur; tam yeniden yükleme başlangıç örneklerini geri getirir. Form taslakları, filtreler, tutor konuşması ve alıştırma yanıtları ilgili ekranın yerel durumudur.

Ekle akışı yalnız hazır kayıtlarla eşleşen ifadeleri zenginleştirir. Desteklenmeyen giriş için hazır örnek bulunamadığını bildirir; tamamen desteklenmeyen girişte sonuç sayısı sıfırdır ve kaydetme aksiyonu gösterilmez. Gerçek AI çağrısı yapılmaz. Tutor yanıtları ve düzeltmesi hazır metinlerdir; writing otomatik dil değerlendirmesi yapmaz. Mod kartlarındaki soru/kart sayıları örnek UI içeriğidir; quiz, cloze, translation ve writing tam bir çok sorulu öğrenme motoru değildir.

Tekrar değerlendirmesi sayacı ilerletir ve sonraki örnek kartı açar. Gösterilen aralıklar örnek metindir; gerçek SRS zamanlaması, due queue veya kalıcı review geçmişi yoktur. Ayarlar seviye bağlamına, hedeflere ve tekrar kısayollarına yansır; aksan, kart türleri ve yeni öğe limiti kaydedilebilir tercihlerdir, henüz ses üretimini veya öğrenme motorunu yönetmez.

Backend, auth, veritabanı, Supabase, storage, bulut senkronizasyonu ve gerçek AI/TTS entegrasyonu yoktur. Telaffuz ses düğmeleri ve listening devre dışıdır. Yalnız koyu tema uygulanmıştır. Deck/tag yönetimi, silme/export, PWA/offline, kalıcı saklama ve açık/sistem teması sonraki kapsamdır.

## Mimari

Next.js App Router, TypeScript, React, Tailwind CSS 4, CSS Modules, Lucide ve Radix UI kullanılır. Mevcut shell ve primitives genişletilmiştir; mimari ve paket bağımlılıkları bu geçişte değiştirilmemiştir.

| Konum | Sorumluluk |
| --- | --- |
| `app/layout.tsx`, `app/page.tsx` | Türkçe document, yerel Inter, metadata ve dashboard yönlendirmesi |
| `app/(workspace)/layout.tsx` | PrototypeProvider ve ortak AppShell |
| `app/(workspace)/*/page.tsx` | Sekiz ekran bileşenini açan route'lar |
| `components/layout/` | Shell, sidebar, topbar, mobil navigasyon, palette ve PageHeader |
| `components/ui/` | Button/Input/Badge/Card ve ortak Radix overlay primitives |
| `components/workspace/` | Sekiz ekran, ortak mock provider ve ekran stilleri |
| `components/data/` | StatCard, ChartCard, aktivite grafiği, hedef, heatmap ve bar görselleri |
| `components/vocabulary/` | Tür/seviye/durum badge'leri, tablo/kart/satır ve detay drawer'ı |
| `components/learning/`, `components/ai/` | Flashcard/değerlendirme, işleme/sonuç, tutor mesajı/düzeltme |
| `lib/` | Merkezi mock içerik/türler, mobil hook, navigasyon ve class yardımcıları |
| `styles/tokens.css` | docs/03 kaynaklı değişmeyen semantic tokenlar |
| `tests/`, `qa/` | Playwright akışları ve ekran görüntüsü capture/validation araçları |

Overlay bileşenlerinde Radix UI; ikonlarda Lucide kullanılır. Drawer Escape ile kapanır, focus'u içeride tutar ve açan elemana geri verir. Tailwind Turbopack loader kuralı yalnız `globals.css` için çalışır; CSS Modules Next.js'in yerel işleyicisinde kalır.

## Görsel doğrulama

Görsel otorite [docs/03_DESIGN_SYSTEM.md](docs/03_DESIGN_SYSTEM.md) ve [seçilen referans görseldir](docs/reference/sayidwithenglish-ui-reference.png.png). Kompakt sidebar, dashboard KPI düzeni, Ekle process listesi, profesyonel kütüphane tablosu, güçlü detay hiyerarşisi, ortalanmış flashcard, tutor chat/bağlam ve sade statistics kompozisyonu bu kaynaklardan alınmıştır. Referans perspektifli bir fotoğraf kolajıdır; birebir piksel eşitliği ölçütü olarak kullanılamaz. docs/03 bölüm 57 doğrultusunda yerel Inter, okunabilir metin, daha rahat padding ve mobile özel düzen uygulanmıştır.

İki görsel iyileştirme turunun çıktıları `qa/round-0/` ve `qa/round-1/` altında; son 42 görüntü `qa/final/` altındadır (bu klasörler Git tarafından yok sayılır; README'de görünen seçki `docs/screenshots/` altında versionlanır). Son matris sekiz route'u 1440×900 ve 390×844'te, uzun sayfaları tam boy ve Ekle sonuçları, drawer/not, flashcard arka yüz ile tutor düzeltmesini içerir. Capture manifest'i yatay taşma ölçümleri ve browser page error kayıtlarını da tutar. Playwright'ın dört boyutlu shell matrisi `qa/screenshots/` altında 39 görüntü üretir.

Üretim sunucusu `127.0.0.1:3100` üzerinde çalışırken `node qa/capture-prototype.mjs final` son prototip matrisini yeniden oluşturur. Ardından `node qa/validate-captures.mjs` toplam 81 PNG'nin imzasını, viewport/tam sayfa boyutlarını ve kaynak dosyalara göre güncelliğini doğrular; `qa/capture-manifest.json` üretir. Bu dosyalar, capture klasörleri, Playwright raporları ve test izleri Git tarafından yok sayılır. Capture doğrulaması görsel tasarım onayı yerine geçmez.

## Kaynak dokümanlar

Ürün ve tasarım kararlarının asıl otoritesi `docs/` içindedir. Bu geçişte `docs/00`, `docs/01` ve `docs/03` değiştirilmemiştir.

- [Proje kararları](docs/00_PROJECT_DECISIONS.md)
- [Master PRD](docs/01_MASTER_PRD.md)
- [Gelecek veritabanı ve AI şeması](docs/02_DATABASE_AND_AI_SCHEMA.md)
- [Tasarım sistemi](docs/03_DESIGN_SYSTEM.md)
- [Ürün özeti](PRODUCT.md)
- [Uygulanan görsel sistem](DESIGN.md) ve [Impeccable sidecar](.impeccable/design.json)

Next.js kodunu değiştirmeden önce `AGENTS.md` uyarısını ve kullanılan sürümün `node_modules/next/dist/docs/` altındaki ilgili kılavuzlarını okuyun.

## Bu geçişin dosya envanteri

Aşağıdaki liste, önceki kabuk/boş sayfa aşamasından dolu mock frontend'e geçişte eklenen veya değiştirilen dosyalardır. Önceden bulunan kök layout, primitives, tokenlar ve paket dosyaları bu listede yeniden değişmiş gibi sunulmaz.

| Grup | Dosyalar |
| --- | --- |
| Değişen workspace route'ları | `app/(workspace)/layout.tsx`, `app/(workspace)/dashboard/page.tsx`, `app/(workspace)/add/page.tsx`, `app/(workspace)/library/page.tsx`, `app/(workspace)/learn/page.tsx`, `app/(workspace)/review/page.tsx`, `app/(workspace)/tutor/page.tsx`, `app/(workspace)/statistics/page.tsx`, `app/(workspace)/settings/page.tsx` |
| Değişen shell/UI stilleri | `components/layout/app-shell.tsx`, `components/layout/shell.module.css`, `components/ui/ui.module.css` |
| Yeni ekranlar ve provider | `components/workspace/dashboard.tsx`, `components/workspace/add.tsx`, `components/workspace/library.tsx`, `components/workspace/learn.tsx`, `components/workspace/review.tsx`, `components/workspace/tutor.tsx`, `components/workspace/statistics.tsx`, `components/workspace/settings.tsx`, `components/workspace/prototype-provider.tsx`, `components/workspace/workspace.module.css` |
| Yeni domain bileşenleri | `components/data/visualizations.tsx`, `components/vocabulary/entry-badges.tsx`, `components/vocabulary/entry-detail-drawer.tsx`, `components/vocabulary/entry-table.tsx`, `components/learning/flashcard.tsx`, `components/ai/processing.tsx`, `components/ai/tutor-message.tsx` |
| Yeni yardımcılar | `lib/mock-data.ts`, `lib/use-is-mobile.ts` |
| Test ve QA | Yeni `tests/prototype.spec.ts`, `qa/capture-prototype.mjs`, `qa/compare-reference.mjs`, `qa/QA_REPORT.md`; güncellenen `qa/validate-captures.mjs` ve `.gitignore` |
| Dokümantasyon | Güncellenen `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`; `AGENTS.md` içinde Next.js dev'in eklediği agent feedback bloğu |

`package.json`, `package-lock.json` ve tasarım tokenları bu geçişte değişmemiştir.
