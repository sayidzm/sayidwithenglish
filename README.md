# sayidwithenglish

Türkçe konuşan Sayid için kişisel İngilizce öğrenme çalışma alanı. Bu aşama yalnızca responsive uygulama kabuğunu, sekiz boş sayfayı ve ortak UI bileşenlerini içerir. Ürünün tam hedef kapsamı [Master PRD](docs/01_MASTER_PRD.md) içinde tanımlıdır.

## Kurulum ve çalıştırma

Node.js 20.9 veya üzeri ve npm gerekir. Inter Latin ve Latin-ext font dosyaları npm paketiyle yerel olarak gelir; `next/font/local` kullanılır. Bu aşama için `.env`, servis hesabı veya API anahtarı gerekmez.

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
| `npm run test:e2e` | Playwright ile shell ve navigasyon kontrolleri |

E2E testlerinden önce `npm run build` çalıştırılmalıdır. Playwright makinede kurulu Google Chrome'u kullanır; üretim sunucusunu `127.0.0.1:3100` üzerinde başlatır. Ekranlar 1440×900, 768×1024, 390×844 ve 320×720 boyutlarındadır. Test kapsamı route'lar, aktif navigasyon, yatay taşma, command palette, mobil menü, sidebar daraltma ve temel klavye davranışlarıdır. Ekran görüntüleri Git tarafından yok sayılan `qa/screenshots/` dizinine; başarısız test izleri `test-results/` altına yazılır.

Bu aşamanın son doğrulamasında lint ve üretim derlemesi başarılı; E2E sonucu 47 başarılı, 5 ekran türüne uygulanmadığı için atlanan testtir. `node qa/validate-captures.mjs` tam ekran görüntüsü matrisini kontrol eder ve Git tarafından yok sayılan `qa/capture-manifest.json` dosyasını üretir. Bu kontrol, taze 39 görüntünün varlığını, boyutlarını ve dosya imzalarını doğrulamıştır.

## Mevcut arayüz

| Yol | Sayfa |
| --- | --- |
| `/dashboard` | Ana Sayfa |
| `/add` | Ekle |
| `/library` | Kütüphane |
| `/learn` | Öğren |
| `/review` | Tekrar |
| `/tutor` | AI Tutor |
| `/statistics` | İstatistikler |
| `/settings` | Ayarlar |

Her sayfa başlık, açıklama ve dürüst bir boş durum gösterir. Ana Sayfa ve Kütüphane üzerindeki ilk kayıt bağlantıları `/add` sayfasına gider; henüz kayıt oluşturmaz.

Masaüstünde sidebar 216px'tir ve 64px'e daraltılabilir. Durum aynı kabuk içindeki sayfa geçişlerinde korunur; yeniden yüklemede sıfırlanır. Tablet genişliklerinde (640–1023px) sidebar sabit 64px olur. Mobilde (<640px) beş öğeli alt navigasyon ve sekiz sayfanın tamamını açan üst menü bulunur. Topbar 56px yüksekliğindedir.

Arama düğmesi veya `Ctrl/Cmd + K`, yalnız sayfa adlarını filtreleyen hızlı erişim penceresini açar. Ok tuşları, Enter ve Escape desteklenir. Kelime, anlam veya kullanıcı kayıtlarında arama henüz yoktur. Bildirim menüsü boş durum gösterir; profil bağlantısı Ayarlar'a gider. Görünen Sayid profili statik UI bilgisidir.

## Mimari

Next.js App Router, TypeScript, React, Tailwind CSS 4, CSS Modules, Lucide ve Radix UI kullanılır.

| Konum | Sorumluluk |
| --- | --- |
| `app/layout.tsx` | Türkçe document, yerel Inter, metadata |
| `app/page.tsx` | `/dashboard` yönlendirmesi |
| `app/(workspace)/layout.tsx` | Ortak AppShell |
| `app/(workspace)/*/page.tsx` | Sekiz statik boş route |
| `app/globals.css` | Tailwind, token importu ve temel stiller |
| `components/layout/` | Shell, sidebar, topbar, mobil navigasyon, palette, PageHeader, boş sayfa |
| `components/ui/` | Ortak UI primitives |
| `lib/navigation.ts` | Ortak sayfa ve mobil navigasyon tanımı |
| `lib/cn.ts` | CSS sınıf birleştirme |
| `styles/tokens.css` | docs/03 kaynaklı semantic tokenlar |
| `tests/` | Playwright kontrolleri |

UI katmanı `Button`, `ButtonLink`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Badge`, `Card`/`CardHeader`/`CardContent`, `Skeleton`, `Tooltip`, `Dropdown`, `Dialog`, `EmptyState` ve `Text` bileşenlerinden oluşur. Overlay bileşenlerinde Radix UI; ikonlarda Lucide (1.75 stroke) kullanılır. Yeni sayfalar ortak primitives ve tokenlar üzerine kurulmalıdır.

Tailwind Turbopack loader kuralı yalnız `globals.css` için çalışır. CSS Modules Next.js'in yerel işleyicisinde kalır; wildcard loader kuralı module class eşlemelerini bozduğu için kullanılmaz.

## Bu aşamanın sınırları

Backend, Supabase, veritabanı, auth, storage, AI API veya AI taklidi bulunmaz. Kayıt ekleme/düzenleme, kütüphane tabloları/filtreleri, deck/tag yönetimi, flashcard, spaced repetition, quiz, tutor chat, istatistik hesaplama ve ayar kaydetme henüz uygulanmamıştır. Veri saklama, bulut senkronizasyonu, PWA/offline, TTS, export ve tema değiştirme de bu aşamanın dışındadır. Yalnız koyu tema uygulanmıştır.

PRD'deki `N`, `/`, `Space` ve `1–4` ürün kısayolları henüz yoktur. Mevcut kısayol `Ctrl/Cmd + K`; açık dialog/menu için Escape'tir. Skeleton bir primitive olarak bulunur; veri yükleme akışı yoktur.

## Kaynak dokümanlar

Ürün ve tasarım kararlarının asıl otoritesi `docs/` içindedir. README yalnız mevcut uygulama durumunu anlatır.

- [Proje kararları](docs/00_PROJECT_DECISIONS.md)
- [Master PRD](docs/01_MASTER_PRD.md)
- [Gelecek veritabanı ve AI şeması](docs/02_DATABASE_AND_AI_SCHEMA.md)
- [Tasarım sistemi](docs/03_DESIGN_SYSTEM.md)
- [Ürün özeti](PRODUCT.md)
- [Uygulanan görsel sistem](DESIGN.md) ve [Impeccable sidecar](.impeccable/design.json)

Next.js kodunu değiştirmeden önce `AGENTS.md` uyarısını ve kullanılan sürümün `node_modules/next/dist/docs/` altındaki ilgili kılavuzlarını okuyun.

## Dosya envanteri

Bu frontend aşamasında değişen veya eklenen dosyalar aşağıda gruplanmıştır. `docs/*.md` kaynakları değiştirilmemiştir.

| Grup | Dosyalar |
| --- | --- |
| Kök uygulama | `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/icon.svg`; starter `app/favicon.ico` silinerek SVG ikonla değiştirilmiştir |
| Workspace route'ları | `app/(workspace)/layout.tsx`, `app/(workspace)/dashboard/page.tsx`, `app/(workspace)/add/page.tsx`, `app/(workspace)/library/page.tsx`, `app/(workspace)/learn/page.tsx`, `app/(workspace)/review/page.tsx`, `app/(workspace)/tutor/page.tsx`, `app/(workspace)/statistics/page.tsx`, `app/(workspace)/settings/page.tsx` |
| Layout bileşenleri | `components/layout/app-shell.tsx`, `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`, `components/layout/bottom-navigation.tsx`, `components/layout/command-palette.tsx`, `components/layout/page-header.tsx`, `components/layout/placeholder-page.tsx`, `components/layout/shell.module.css` |
| UI bileşenleri | `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/switch.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`, `components/ui/skeleton.tsx`, `components/ui/tooltip.tsx`, `components/ui/dropdown.tsx`, `components/ui/dialog.tsx`, `components/ui/empty-state.tsx`, `components/ui/text.tsx`, `components/ui/ui.module.css`, `components/ui/empty-state.module.css`, `components/ui/text.module.css` |
| Yardımcılar ve tokenlar | `lib/navigation.ts`, `lib/cn.ts`, `styles/tokens.css` |
| Paketler ve yapılandırma | `package.json`, `package-lock.json`, `next.config.ts`, `.gitignore`, `playwright.config.ts` |
| Test ve QA | `tests/app-shell.spec.ts`, `qa/validate-captures.mjs` |
| Dokümantasyon | `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` |

`qa/screenshots/` ve `qa/capture-manifest.json` üretilen, Git tarafından yok sayılan QA çıktılarıdır.

Sonraki mantıklı adım Ekle sayfasına hızlı/toplu metin girişi, opsiyonel metadata ve yerel ifade sayacı eklemektir. Bu adım da veri saklama, backend ve AI olmadan UI kapsamında ele alınabilir.
