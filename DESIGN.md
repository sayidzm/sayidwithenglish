---
name: sayidwithenglish
description: Koyu tema öncelikli, kompakt ve profesyonel kişisel İngilizce çalışma alanı.
colors:
  background: "#080c14"
  background-subtle: "#0a101a"
  surface-1: "#0d1420"
  surface-2: "#111a28"
  surface-3: "#162131"
  border: "rgb(255 255 255 / 7.5%)"
  border-strong: "rgb(255 255 255 / 13%)"
  text-primary: "#f5f7fb"
  text-secondary: "#a9b3c3"
  text-muted: "#667085"
  primary: "#4f7cff"
  primary-hover: "#628bff"
  violet: "#8867f2"
  success: "#29c997"
  warning: "#f3a83b"
  danger: "#ef646a"
  info: "#45a9ff"
  on-accent: "#080c14"
  primary-soft: "rgb(79 124 255 / 12%)"
  violet-soft: "rgb(136 103 242 / 12%)"
  success-soft: "rgb(41 201 151 / 12%)"
  warning-soft: "rgb(243 168 59 / 12%)"
  danger-soft: "rgb(239 100 106 / 12%)"
typography:
  display:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 650
  headline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-strong:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  small:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 450
    lineHeight: 1.5
  micro:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  badge: "6px"
  input: "8px"
  button: "8px"
  card: "10px"
  panel: "12px"
  modal: "14px"
  flashcard: "16px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.button}"
    padding: "0 12px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "0 12px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.button}"
    padding: "0 12px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.button}"
    padding: "0 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.input}"
    padding: "0 12px"
    height: "38px"
  badge-blue:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-hover}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.card}"
  navigation-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "0 12px"
    height: "40px"
---

# Design System: sayidwithenglish

## Overview

Görsel otorite docs/03_DESIGN_SYSTEM.md dosyasıdır. Bu kayıt mevcut shell ve primitives uygulamasını açıklar; yeni bir görsel yön belirlemez. Makine tarafından okunabilir değerler frontmatter içinde, çalışan CSS tokenları styles/tokens.css içinde yer alır.

Dokümanların belirlediği yön Linear × Vercel × Apple productivity app: koyu tema öncelikli, premium, minimal, kompakt, sakin ve bilgi yoğun bir kişisel çalışma alanı. Okunabilirlik ve işlevsellik görsel süslemenin önünde kalır. Şu an yalnız ortak kabuk ve boş sayfalar uygulanmıştır; veri ekranlarının kuralları kaynak dokümanda kalır.

**Key Characteristics:**

- Koyu lacivert yüzeyler ve ölçülü mavi vurgu.
- Kompakt navigasyon ve okunabilir tipografik hiyerarşi.
- Ortak semantic tokenlar ve tutarlı UI primitives.
- Mobilde ayrı navigasyon düzeni ve klavye ile erişilebilir kontroller.

## Colors

### Primary

Ana mavi primary ana aksiyonlarda ve monogramda kullanılır. Primary-hover hover ve aktif ikonları belirginleştirir; primary-soft aktif navigasyona yumuşak zemin sağlar. Ana aksiyon metni on-accent kullanır: koyu metin mevcut mavi zemin üzerinde daha güçlü kontrast sağlar.

### Secondary

Violet, kaynak dokümanda AI ve ikincil vurgu için ayrılmıştır; mevcut badge primitive’i bu tonu destekler. Bu aşamada AI aksiyonu veya gradient yoktur.

### Neutral

Background ana çalışma zemini; background-subtle sidebar ve alt navigasyon; surface-1 kart ve alanlar; surface-2 hover; surface-3 iç veya seçili yüzeyler içindir. Border ince ayrım, border-strong belirgin sınır sağlar. Ana metin text-primary; açıklama ve placeholder’lar text-secondary kullanır.

Text-muted kaynak değeri korunmuştur ve Text pronunciation varyantına ayrılmıştır. Görünür açıklamalar secondary kullanır. Success, warning, danger ve info anlam taşıyan durumlar içindir; bilgi yalnız renkle verilmez. Soft varyantlar aynı semantik rengin düşük opacity zeminleridir.

## Typography

Inter variable font next/font/local ile Latin ve Latin-ext dosyalarından yüklenir; fallback Arial ve sans-serif’tir. Türkçe arayüz ve İngilizce içerik aynı aileyi kullanır. Frontmatter kaynak ölçeğin tüm rollerini taşır. Display tanımlıdır, mevcut boş sayfalarda kullanılmaz. H1 sayfa başlığı; H2 boş durum başlığı; H3 dialog başlığıdır.

Text body, strong, small, caption, micro, expression, meaning ve pronunciation varyantlarını sağlar. Expression H2 boyut/ağırlığını, meaning secondary rengini, pronunciation small boyut/muted rengini kullanır. Sayfa açıklamaları en fazla 70ch; boş durum açıklamaları 48ch genişliğindedir.

## Layout

4px spacing grid kullanılır. Desktop sidebar 216px, daraltılmış sidebar 64px, sticky topbar 56px’tir. Navigasyon satırları 40px; sidebar ikonları 18px ve stroke 1.75’tir. İçerik padding’i 24px; 1440px ve üzerinde 32px olur.

640–1023px tablet aralığında sidebar sabit 64px’tir. 640px altında sidebar gizlenir; 64px alt navigasyona safe-area payı eklenir. Alt navigasyon Ana Sayfa, Kütüphane, Ekle, Tekrar, Tutor’u içerir; üst menü tüm sekiz route’u açar. Mobil içerik yatayda 16px padding ve altta navigasyon boşluğu kullanır. Mobil üst kontroller en az 44px yüksekliğindedir.

PageHeader başlık, açıklama ve isteğe bağlı aksiyon alanını birleştirir; mobilde dikey yerleşir. Gelecek KPI gridleri, tablolar ve tutor panelleri bu aşamada uygulanmamıştır.

## Elevation & Depth

Derinlik yakın tonlu yüzeyler ve ince border ile kurulur. Kart gölgesi hafif, dropdown/dialog gölgesi daha geniştir. Tam gölge değerleri sidecar extensions.shadows alanında ve CSS tokenlarında kayıtlıdır. Input focus ring’i üç piksellik yumuşak mavi çevredir; global keyboard focus ayrıca görünür outline taşır.

Hareket süresi 150ms ve easing cubic-bezier(.2, .8, .2, 1)’dir. Geçişler hover rengi, border ve switch thumb hareketinde kullanılır. Prefers-reduced-motion geçişleri ve animasyonları kapatır.

## Shapes

Badge ve tooltip köşeleri sıkı; button ve input köşeleri ortak; kart ve panel köşeleri kademeli olarak daha yumuşaktır. Modal kendi radius tokenını kullanır. Flashcard radius tokenı mevcut avatar şeklinin de kaynağıdır; flashcard bileşeni henüz yoktur. Kaynak sistem dışı radius veya sayfaya özel button biçimi eklenmez.

## Components

Button ve ButtonLink primary, secondary, ghost, destructive varyantlarını paylaşır. Küçük/default/büyük yükseklikler 32/36/42px’tir. Default yatay padding 12px; büyük button 16px’tir. Disabled opacity düşer; focus outline korunur. Destructive hover danger zemini ve koyu on-accent metni kullanır.

Input surface-1 ve ince border kullanır; hover border’ı güçlendirir, focus mavi border/ring ekler, aria-invalid danger border gösterir. Textarea minimum 200px ve dikey yeniden boyutlanabilir. Mobil input metni 16px olur. Checkbox native kontrol; Switch kontrollü button’dur ve role=switch/aria-checked kullanır. Form kontrollerine caller tarafından erişilebilir etiket sağlanmalıdır.

Card ortak yüzey, border, radius ve gölgeyi taşır. CardHeader ve CardContent padding’i 20px’tir; başlıktan sonra gelen içerik üst padding’i kaldırır. Badge neutral, blue, violet, success, warning ve danger tonlarını destekler. Skeleton statik surface-3 bloğudur.

Navigation aktif sayfayı aria-current=page, yumuşak mavi zemin ve belirgin ikonla gösterir. Dar sidebar’da isimlere tooltip ile ulaşılır. Mobil navigasyon beş kolondur; merkez Ekle aksiyonu mavi zeminlidir.

Tooltip, Dropdown ve Dialog Radix UI kullanır. Dialog focus’u içeride tutar, Escape ile kapanır ve açan elemana geri verir. Command palette yalnız sayfa adlarını filtreler; kayıt araması yoktur. EmptyState Lucide ikonu, başlık, kısa açıklama ve isteğe bağlı aksiyon taşır; maskot veya illüstrasyon içermez.

## Do's and Don'ts

### Do:

- Do kaynak doküman ve semantic tokenlarla yeni ekranları kur.
- Do açıklamalarda secondary metni ve görünür keyboard focus’u koru.
- Do ikon aksiyonlarını erişilebilir ad ve uygun tooltip ile sun.
- Do mobil navigasyonu ve safe-area boşluklarını koru.
- Do durumları renk yanında anlaşılır metinle ilet.

### Don't:

- Don’t rastgele renk, gradient, radius veya sayfaya özel button stili ekle.
- Don’t aşırı glow, yaygın glassmorphism veya çocukça gamification kullan.
- Don’t emoji’yi ana UI ikonu olarak kullan.
- Don’t boş route’ları tamamlanmış veri veya AI özellikleri olarak sun.
