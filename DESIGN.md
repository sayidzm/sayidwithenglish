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

Görsel otorite docs/03_DESIGN_SYSTEM.md ve docs/reference/sayidwithenglish-ui-reference.png.png dosyalarıdır. Bu kayıt ortak kabuk, primitives ve sekiz dolu mock ekranın uygulanan görsel sistemini açıklar; yeni bir görsel yön belirlemez. Makine tarafından okunabilir değerler frontmatter içinde, çalışan CSS tokenları styles/tokens.css içinde yer alır.

Dokümanların belirlediği yön Linear × Vercel × Apple productivity app: koyu tema öncelikli, premium, minimal, kompakt, sakin ve bilgi yoğun bir kişisel çalışma alanı. Referansın sidebar, KPI, process listesi, kütüphane tablosu, detay, flashcard, tutor ve statistics kompozisyonları mevcut sistem üzerinde uygulanmıştır. Okunabilirlik ve işlevsellik görsel süslemenin önünde kalır; docs/03 bölüm 57 doğrultusunda metin ve padding daha rahat, mobil düzen ayrı ele alınmıştır.

**Key Characteristics:**

- Koyu lacivert yüzeyler ve ölçülü mavi vurgu.
- Kompakt navigasyon ve okunabilir tipografik hiyerarşi.
- Ortak semantic tokenlar ve tutarlı UI primitives.
- Veri yoğun masaüstü panelleri ve mobile özel kart/tek kolon düzenleri.
- Görünür keyboard focus, açıklamalı durumlar ve erişilebilir overlay kontrolleri.

## Colors

### Primary

Ana mavi primary ana aksiyonlarda, monogramda, aktivite grafiklerinde, ilerleme ve hedef göstergelerinde kullanılır. Primary-hover hover ve aktif ikonları belirginleştirir; primary-soft aktif navigasyon ve seçili durumlara yumuşak zemin sağlar. Ana aksiyon metni on-accent kullanır: koyu metin mevcut mavi zemin üzerinde daha güçlü kontrast sağlar.

### Secondary

Violet AI ve ikincil vurgu için ayrılmıştır; Sentence/B2 badge'leri ve tür dağılımı gibi ikincil veri vurgularında kullanılır. AI işleme ve tutor, ortak yüzey ve aksiyon sisteminin içinde kalır. Gradient zorunlu bir öğe değildir; kaynak sistem yalnız AI/özel accent gibi sınırlı kullanım alanlarına izin verir.

### Neutral

Background ana çalışma zemini; background-subtle sidebar, alt navigasyon ve drawer; surface-1 kart ve alanlar; surface-2 hover ve iç alanlar; surface-3 seçili/iç yüzeyler içindir. Border ince ayrım, border-strong belirgin sınır sağlar. Ana metin text-primary; açıklama ve placeholder'lar text-secondary kullanır.

Text-muted kaynak değeri korunmuştur; düşük öncelikli yardımcı metinlerde kullanılır. Görünür açıklamalar secondary kullanır. Success, warning, danger ve info anlam taşıyan durumlar içindir; bilgi yalnız renkle verilmez. Öğrenme durumlarında metin ve nokta; CEFR'de A1 neutral, A2 success, B1 blue, B2 violet, C1 warning ve C2 danger eşleşmesi bulunur. Soft varyantlar aynı semantik rengin düşük opacity zeminleridir.

## Typography

Inter variable font next/font/local ile Latin ve Latin-ext dosyalarından yüklenir; fallback Arial ve sans-serif'tir. Türkçe arayüz ve İngilizce içerik aynı aileyi kullanır. Frontmatter kaynak ölçeğin tüm rollerini taşır. Sayfa başlıkları headline, panel başlıkları title/subtitle ölçeğini kullanır; KPI değerleri ve flashcard ifadesi daha büyük görsel odak oluşturur.

Text body, strong, small, caption, micro, expression, meaning ve pronunciation varyantlarını sağlar. Kayıt ifadesi belirgin ağırlık, Türkçe anlam secondary ve telaffuz daha düşük görsel öncelik kullanır. Grafik etiketleri/legend, tablo tarihleri ve durum bağlamı caption/micro ölçeğindedir. Sayfa açıklamaları en fazla 70ch; boş durum açıklamaları 48ch genişliğindedir. İngilizce örnekler lang=en ile işaretlenir.

## Layout

4px spacing grid kullanılır. Desktop sidebar 216px, daraltılmış sidebar 64px, sticky topbar 56px'tir. Navigasyon satırları 40px; sidebar ikonları 18px ve stroke 1.75'tir. İçerik padding'i 24px; 1440px ve üzerinde 32px olur.

640–1023px tablet aralığında sidebar sabit 64px'tir. 640px altında sidebar gizlenir; 64px alt navigasyona safe-area payı eklenir. Alt navigasyon Ana Sayfa, Kütüphane, Ekle, Tekrar, Tutor'u içerir; üst menü tüm sekiz route'u açar. Mobil içerik yatayda 16px padding ve altta navigasyon boşluğu kullanır. Mobil üst kontroller en az 44px yüksekliğindedir.

Dashboard dört KPI ile başlar; haftalık aktivite ve hedef, sonra son eklenenler ve zorlanılan ifadeler, devam CTA'sı ve küçük heatmap gelir. Dar ekranlarda KPI iki kolona, ana paneller tek kolona iner; tekrar CTA'sı üstte görünür. Ekle giriş/metadata ve process/önizleme panellerini yaklaşık 61/39 oranında böler; kaynak dokümandaki 65/35 yaklaşımını responsive minimumlarla uygular. Tutor yaklaşık 70/30 konuşma/bağlam ayrımı kullanır. Ekle ve tutor 900px altında tek kolona geçer.

Kütüphane masaüstü tablosu 48px satırlarla kompakt kalır. Kart ve liste alternatifleri vardır; tablet tablosunda daha düşük öncelikli kolonlar gizlenir. Mobilde tablo yerine kayıt kartları kullanılır. Detay sağdan 464px drawer olarak açılır; mobilde kullanılabilir ekran genişliğini kaplar. Başlık/footer sabit alanlar, uzun detay içeriği kaydırılabilir gövdedir.

Tekrar kartı ortalanır: masaüstünde en fazla 560px genişlik ve en az 330px yükseklik. Dört değerlendirme altında yer alır. Mobil kart genişliği kullanılabilir alana uyar ve değerlendirmeler iki kolona iner. Odak modunda sidebar, topbar ve alt navigasyon gizlenir. Öğrenme modları masaüstünde üç kolon, dar ekranda iki, mobilde bir kolon olur; Ayarlar bölümleri ortak panel içinde hizalı formlar kullanır.

## Elevation & Depth

Phase 2 auth ekranları aynı Inter, Card, Input ve Button primitive'lerini kullanır. Ortalanmış panel en fazla 400px genişliktedir; 20px başlık, 24px desktop/20px mobile iç padding, ince border ve semantik hata/başarı yüzeyleri korunur. Ayrı bir landing-page veya yeni renk sistemi eklenmemiştir. Ayarlar mevcut panel düzeninde profil alanlarını ve çıkış aksiyonunu içerir; shell profil adını gerçek kayıttan alır.

Derinlik yakın tonlu yüzeyler ve ince border ile kurulur. Kart gölgesi hafif, dropdown/dialog/drawer gölgesi daha geniştir. Tam gölge değerleri sidecar extensions.shadows alanında ve CSS tokenlarında kayıtlıdır. Drawer arkasındaki koyu overlay odağı kayda taşır. Input focus ring'i üç piksellik yumuşak mavi çevredir; global keyboard focus ayrıca görünür outline taşır.

Hareket süresi 150ms ve easing cubic-bezier(.2, .8, .2, 1)'dir. Geçişler hover rengi, border ve switch thumb hareketinde kullanılır. Prefers-reduced-motion geçişleri ve animasyonları kapatır. AI process listesinde tamamlandı/geçerli/bekliyor ayrımı ikon, metin ve tonla yapılır.

## Shapes

Badge ve tooltip köşeleri sıkı; button ve input köşeleri ortak; kart ve panel köşeleri kademeli olarak daha yumuşaktır. Modal kendi radius tokenını kullanır. Flashcard mevcut flashcard radius tokenını kullanır; avatar şekli de aynı tokena dayanır. Grafik ve ilerleme göstergelerinde basit bar, halka ve küçük heatmap hücreleri kullanılır. Kaynak sistem dışı radius veya sayfaya özel button biçimi eklenmez.

## Components

Button ve ButtonLink primary, secondary, ghost, destructive varyantlarını paylaşır. Küçük/default/büyük yükseklikler 32/36/42px'tir. Default yatay padding 12px; büyük button 16px'tir. Disabled opacity düşer; focus outline korunur. Destructive hover danger zemini ve koyu on-accent metni kullanır. ReviewControls aynı Button primitive'ini dört semantik renk ve altında aralık metni ile birleştirir.

Input surface-1 ve ince border kullanır; hover border'ı güçlendirir, focus mavi border/ring ekler, aria-invalid danger border gösterir. Textarea primitive'i minimum 200px ve dikey yeniden boyutlanabilir; ekran içi not/yazma alanları amaçlarına göre daha kısa olabilir. Mobil input metni 16px olur. Checkbox native kontrol; Switch kontrollü button'dur ve role=switch/aria-checked kullanır. Form kontrollerine caller tarafından erişilebilir etiket sağlanmalıdır.

Card ortak yüzey, border, radius ve gölgeyi taşır. CardHeader ve CardContent padding'i 20px'tir; başlıktan sonra gelen içerik üst padding'i kaldırır. Ekran panelleri aynı tokenlarla kuruludur. StatCard ikon, küçük etiket, güçlü değer ve açıklama; ChartCard başlık, bağlam ve görseli birleştirir. Aktivite barları, günlük hedef/öğrenilen halkaları, dağılım barları ve heatmap bu ortak kart dili içinde kalır. Grafiklerde metinsel erişilebilir ad/değerler bulunur; interaktif tooltip veya zoom sistemi uygulanmamıştır.

Badge neutral, blue, violet, success, warning ve danger tonlarını destekler. EntryTypeBadge, LevelBadge ve LearningStatusBadge içerik sınıflamasını tutarlı taşır. Kütüphane tablo/kartlarında ifade ve anlam başta; tür, seviye ve durum sonraki hiyerarşidedir. Drawer anlam, açıklama, numaralı çift dilli örnekler, benzer ifadeler, kaynak/bağlam, deck/etiket ve kişisel not bölümlerini ayırır. Telaffuzun ses aksiyonu disabled ve açıklamalıdır.

Flashcard ön yüzünde tür/seviye, ifade, IPA ve anlamı açma aksiyonu; arka yüzde Türkçe anlam ve çift dilli örnek bulunur. Kart çevrilme animasyonu yerine içerik durumu değişir. AIProcessingPanel altı aşamayı ikon/metinle sıralar; AIResultCard ifade, sınıflama, anlam, açıklama ve örneği gösterir. TutorMessage rol/isim ayrımı kullanır; CorrectionCard orijinal, düzeltme, neden ve daha doğal ifadeyi ayrı satırlarda sunar.

Navigation aktif sayfayı aria-current=page, yumuşak mavi zemin ve belirgin ikonla gösterir. Dar sidebar'da isimlere tooltip ile ulaşılır. Mobil navigasyon beş kolondur; merkez Ekle aksiyonu mavi zeminlidir. Tooltip, Dropdown, Dialog ve detay drawer Radix UI kullanır. Dialog/drawer focus'u içeride tutar, Escape ile kapanır ve açan elemana geri verir. Command palette yalnız sayfa adlarını filtreler; kayıt araması kütüphane alanındadır. EmptyState Lucide ikonu, başlık, kısa açıklama ve isteğe bağlı aksiyon taşır; filtre sonucu bulunmadığında temizleme aksiyonu sunulur. Skeleton statik surface-3 bloğudur.

## Do's and Don'ts

### Do:

- Do kaynak doküman ve semantic tokenlarla yeni ekranları kur.
- Do açıklamalarda secondary metni ve görünür keyboard focus'u koru.
- Do ikon aksiyonlarını erişilebilir ad ve uygun tooltip ile sun.
- Do mobil navigasyonu ve safe-area boşluklarını koru.
- Do durumları renk yanında anlaşılır metinle ilet.
- Do veri yoğun masaüstü düzenini mobilde kart ve tek kolon yerleşime dönüştür.

### Don't:

- Don't rastgele renk, gradient, radius veya sayfaya özel button stili ekle.
- Don't aşırı glow, yaygın glassmorphism veya çocukça gamification kullan.
- Don't emoji'yi ana UI ikonu olarak kullan.
- Don't mock sonuçları veya örnek veri toplamlarını gerçek AI/kalıcı ürün davranışı gibi sun.
