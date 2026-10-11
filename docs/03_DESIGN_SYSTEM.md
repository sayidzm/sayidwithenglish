# sayidwithenglish — Design System v0.1

## 1. Tasarım Karakteri

**sayidwithenglish** bir eğitim oyunu değil, kişisel bir **AI learning workspace** gibi hissettirmeli.

Tasarım dili:

**Linear × Vercel × Apple productivity app**

Ana özellikler:

- Dark-first
- Premium
- Minimal
- Compact
- Intelligent
- Calm
- Data-rich

Ana tasarım referansı:

**Seçilen 4. görsel**

## 2. Ana Renk Sistemi

| Token | Değer | Kullanım |
|---|---:|---|
| `background` | `#080C14` | Ana zemin |
| `background-subtle` | `#0A101A` | İkincil zemin |
| `surface-1` | `#0D1420` | Ana kart |
| `surface-2` | `#111A28` | Hover / nested card |
| `surface-3` | `#162131` | Seçili alan |
| `border` | `rgba(255,255,255,.075)` | Normal border |
| `border-strong` | `rgba(255,255,255,.13)` | Aktif border |
| `text-primary` | `#F5F7FB` | Ana yazı |
| `text-secondary` | `#A9B3C3` | İkincil yazı |
| `text-muted` | `#667085` | Caption |
| `primary` | `#4F7CFF` | Ana mavi |
| `primary-hover` | `#628BFF` | Hover |
| `violet` | `#8867F2` | AI / secondary |
| `success` | `#29C997` | Öğrenildi |
| `warning` | `#F3A83B` | Zor |
| `danger` | `#EF646A` | Yanlış / tekrar |
| `info` | `#45A9FF` | Bilgi |

Ana accent:

**Blue**

Violet:

- AI
- secondary accent

## 3. Gradient

Sınırlı.

Örnek:

```css
linear-gradient(
  135deg,
  #4F7CFF 0%,
  #6C63F3 100%
)
```

Sadece:

- AI CTA
- özel accent
- flashcard glow

gibi yerlerde.

## 4. Typography

Ana font:

**Inter**

Alternatif:

**Geist**

Scale:

| Stil | Boyut | Weight |
|---|---:|---:|
| Display | 32px | 650 |
| H1 | 26px | 650 |
| H2 | 20px | 600 |
| H3 | 16px | 600 |
| Body | 14px | 400 |
| Body Strong | 14px | 500 |
| Small | 13px | 400 |
| Caption | 12px | 450 |
| Micro | 11px | 500 |

Body line-height:

**1.45–1.55**

## 5. İngilizce İfadeler

Expression:

- 18–22px
- 600 weight

Türkçe anlam:

- 14px
- secondary

Telaffuz:

- 12–13px
- muted

## 6. Spacing

4px grid.

```text
4
8
12
16
20
24
32
40
48
64
```

Kart padding:

**16–20px**

Desktop content:

**24–32px**

Mobile:

**16px**

## 7. Border Radius

| Component | Radius |
|---|---:|
| Badge | 6px |
| Input | 8px |
| Button | 8px |
| Card | 10px |
| Büyük panel | 12px |
| Modal | 14px |
| Flashcard | 16px |

## 8. Shadows

Normal card:

```css
box-shadow:
0 1px 2px rgba(0,0,0,.20),
0 8px 24px rgba(0,0,0,.12);
```

Drawer/modal:

```css
box-shadow:
0 24px 80px rgba(0,0,0,.45);
```

## 9. Desktop App Shell

```text
┌──────────┬───────────────────────────────────┐
│ Sidebar  │ Topbar                            │
│          ├───────────────────────────────────┤
│          │                                   │
│          │ Main Content                      │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

Sidebar:

**216px**

Collapsed:

**64px**

Topbar:

**56px**

## 10. Sidebar

Navigation:

- Ana Sayfa
- Ekle
- Kütüphane
- Öğren
- Tekrar
- AI Tutor
- İstatistikler
- Ayarlar

Item height:

**36–40px**

Icon:

**18px**

Aktif:

- soft blue bg
- blue icon
- primary text

## 11. Topbar

Sol:

Global search.

Placeholder:

> Kelime, ifade veya cümle ara...

Sağ:

- + Ekle
- notification
- avatar

## 12. Button Sistemi

### Primary
Ana mavi.

### Secondary
Dark surface + border.

### Ghost
Icon action.

### Destructive
Soft red.

Height:

- Small: 32px
- Default: 36px
- Large: 42px

## 13. AI Button

Örn:

**✨ AI ile İşle**

Blue → violet subtle gradient.

Sadece AI aksiyonlarında.

## 14. Input Sistemi

Background:

`surface-1`

Border:

`border`

Height:

**38px**

Focus:

```css
box-shadow:
0 0 0 3px rgba(79,124,255,.12);
```

## 15. Add Textarea

Minimum:

**180–220px**

Örnek placeholder:

```text
figure out
I was about to call you
What's the point?
```

Canlı count:

```text
3 ifade algılandı
```

## 16. Card Sistemi

```text
surface-1
1px border
10px radius
16–20px padding
```

Header:

```text
Haftalık Aktivite                Son 7 gün ▾
```

## 17. Dashboard Stat Card

Örnek:

```text
BUGÜNKÜ TEKRARLAR

24 / 30
%80 tamamlandı
```

Hiyerarşi:

- icon
- muted label
- büyük değer
- secondary context

## 18. Dashboard Grid

Desktop >1280px:

- üst satır 4 KPI
- alt satır weekly activity + daily goal
- sonra recent items + weak items

## 19. Chart Tasarımı

- düşük opacity grid
- küçük legend
- blue/violet/emerald
- sade tooltip

## 20. Kütüphane

Üst alan:

```text
Kütüphane                     342 kayıt

[ Ara...                         ] [Filtrele]

[Tümü] [Kelime] [İfade] [Phrasal Verb] ...
```

## 21. Library Table

Kolonlar:

```text
□
İfade
Tür
Türkçe anlam
Seviye
Durum
Kaynak
Eklenme
⋯
```

Row:

**44–48px**

Hover:

`surface-2`

Selected:

soft blue.

## 22. Badge Sistemi

Tür badge:

soft violet/blue.

CEFR renkleri:

- A1 grey
- A2 teal
- B1 blue
- B2 violet
- C1 amber
- C2 rose

Durum:

- Öğrenildi
- Öğreniliyor
- Zor
- Yeni

## 23. Detail Drawer

Desktop:

**420–480px**

Sağdan açılır.

Header:

```text
figure out         ☆   ⋯   ×
Phrasal Verb · B1
```

Section'lar:

- Türkçe Anlam
- Kısa Açıklama
- Telaffuz
- Örnek Cümleler
- Benzer İfadeler
- Kaynak
- Notlar

## 24. Example Sentence Component

```text
01

I finally figured out the problem.

Sonunda problemi çözdüm.

                            🔊
```

## 25. Add / AI Processing

Desktop layout:

```text
┌───────────────────────┬─────────────────┐
│ Manual Input          │ AI Preview      │
│ metadata              │ classification  │
│ [ AI ile İşle ]       │ processing      │
└───────────────────────┴─────────────────┘
```

Yaklaşık:

**65 / 35**

## 26. AI Loading

Spinner yerine aşamalar:

```text
4 / 6

✓ İfadeyi analiz et
✓ Türkçe anlam oluştur
✓ Açıklama oluştur
● Örnek cümleler oluşturuluyor
○ Benzer ifadeler
○ Flashcard
```

## 27. Flashcard

Desktop yaklaşık:

**560 × 330px**

Front:

```text
Phrasal Verb · B1

figure out

/ˈfɪɡər aʊt/

🔊
```

Back:

```text
anlamak
çözmek
bir yolunu bulmak

I finally figured out the problem.
```

## 28. Review Controls

```text
Tekrar        Zor         İyi         Kolay
<1 dk         3 gün       7 gün       21 gün
```

Renkler:

- soft red
- amber
- blue
- green

## 29. Review Focus Mode

Sidebar minimize olabilir.

Üstte:

```text
12 / 30               Oturumu Bitir
━━━━━━━━━━━━━━
```

## 30. AI Tutor

Desktop:

- Chat 70%
- Context 30%

Context:

- Bugünkü kelimeler
- Zorlandıkların
- Aktif deck
- Seviye
- AI'nın kullandığı kelimeler

## 31. Correction Card

```text
Senin cümlen
I figure out it yesterday.

Düzeltme
I figured it out yesterday.

Daha doğal
I worked it out yesterday.
```

## 32. Statistics

KPI:

- Toplam kayıt
- Doğru oranı
- Öğrenilen
- Seri

Charts:

- activity trend
- level distribution
- item type
- difficulty

## 33. Empty States

Cartoon yok.

Örn:

```text
Henüz hiçbir kayıt yok.

Dizide veya günlük hayatta karşılaştığın
ilk İngilizce ifadeyi ekle.

[ İlk kaydını ekle ]
```

## 34. Skeleton

- dashboard card skeleton
- library row skeleton
- entry detail skeleton
- AI processing skeleton

## 35. Toast

Desktop:

bottom-right.

Örnek:

- 5 kayıt kaydedildi
- Bu ifade zaten mevcut
- AI işlemi tamamlanamadı

## 36. Modal

Az kullanılmalı.

- Quick Add
- Delete confirmation

Detay:

drawer tercih edilir.

## 37. Command Palette

`Ctrl + K`

Örn:

```text
Ne arıyorsun?

> figure

figure out
figure something out

──────────

Yeni kayıt ekle
Kütüphaneye git
Tekrara başla
AI Tutor'u aç
```

## 38. Hover / Transition

Duration:

**120–180ms**

Easing:

```css
cubic-bezier(.2,.8,.2,1)
```

## 39. Accessibility

- body min 13–14px
- contrast yeterli
- focus outline korunmalı
- sadece renkle bilgi verilmemeli
- icon button tooltip
- keyboard navigation

## 40. Responsive Breakpoints

```text
Mobile: < 640px
Tablet: 640–1023px
Desktop: 1024–1439px
Large: ≥ 1440px
```

## 41. Tablet

- collapsed sidebar / drawer
- 4 kolon → 2 kolon
- library bazı kolonları gizler
- drawer yaklaşık %45 ekran

## 42. Mobile

Bottom nav:

```text
Ana Sayfa
Kütüphane
+
Tekrar
Tutor
```

Desktop UI küçültülmeyecek; mobile özel layout.

## 43. Mobile Home

- 2×2 KPI veya horizontal
- Bugünkü tekrar CTA
- Son eklenenler
- Zorlandıkların
- grafikler aşağıda

## 44. Mobile Library

Table yok.

List card varsayılan.

Tap → full-screen detail sheet.

## 45. Mobile Add

- büyük textarea
- metadata collapsed
- sticky AI button olabilir

## 46. Mobile Flashcards

- full-screen'e yakın
- kart width ~%90
- rating buttons 2×2 veya horizontal

## 47. Light Mode

İlk sürüm dark default.

Ama semantic tokens kullanılmalı.

```text
background
surface
text
border
primary
```

## 48. Icon Sistemi

**Lucide Icons**

Stroke:

**1.75–2px**

## 49. Image Kullanımı

Az.

Sadece:

- profil
- source screenshot
- kullanıcı görseli

gibi gerekli alanlarda.

## 50. Logo

Minimal:

**S** monogram.

Blue/violet.

Wordmark:

**sayidwithenglish**

## 51. Semantic Tokenlar

```text
bg-background
bg-surface
bg-surface-hover
text-primary
text-secondary
text-muted
border-default
border-strong
primary
success
warning
danger
```

## 52. Tailwind Component Mantığı

Örn:

```tsx
<Card>
  <CardHeader />
  <CardContent />
</Card>
```

Badge:

```tsx
<EntryTypeBadge />
<LevelBadge />
<LearningStatusBadge />
```

## 53. Responsive Shell

Desktop:

```text
Sidebar + Main
```

Mobile:

```text
Main + BottomNavigation
```

## 54. Component Hierarchy

### PRIMITIVES
- Button
- Input
- Textarea
- Badge
- Tooltip
- Dropdown
- Checkbox
- Switch

### LAYOUT
- AppShell
- Sidebar
- Topbar
- PageHeader

### DATA
- StatCard
- DataTable
- ChartCard
- Progress

### VOCABULARY
- EntryCard
- EntryRow
- EntryDetail
- MeaningList
- ExampleSentence
- Pronunciation
- SourceBadge

### LEARNING
- Flashcard
- ReviewButton
- QuizQuestion
- StudyProgress

### AI
- AIInput
- AIProcessing
- AIResult
- TutorMessage
- CorrectionCard

## 55. Tasarım Kalite Kuralları

Kodlayan AI için:

- No random gradients.
- No random colors.
- No arbitrary border radiuses.
- No inconsistent card padding.
- No page-specific button styles.
- No oversized headings.
- No childish gamification.
- No excessive glow.
- No glassmorphism everywhere.
- No emojis as primary UI icons.

## 56. Referans Görselden Korunacaklar

- Sol kompakt sidebar
- Dashboard KPI düzeni
- AI Ekle ekranındaki process listesi
- Professional library table
- Güçlü entry detail hiyerarşisi
- Ortalanmış flashcard
- AI Tutor chat + context
- Sade statistics dashboard

## 57. Gerçek Üründe İyileştirilecekler

- Fontlar biraz büyütülecek.
- Padding artırılacak.
- Blue aşırı kullanılmayacak.
- Daha fazla whitespace.
- Mobile özel tasarlanacak.
- Accessibility daha ciddi uygulanacak.

## 58. Tasarım Hedefi

Uygulama şu hissi vermeli:

> “Bu, küçük bir kişisel proje değil; gerçek bir premium SaaS ürünü.”

Ama işlevsellik görsel güzelliğin önünde kalmalı.
