# sayidwithenglish — Proje Dokümantasyonu

Bu paket, **sayidwithenglish** projesi için şimdiye kadar birlikte netleştirdiğimiz ürün, veri, AI ve tasarım kararlarını içerir.

## Dosyalar

1. `00_PROJECT_DECISIONS.md`  
   Kullanıcı cevapları, ürün kararları, kapsam ve teknik tercihler.

2. `01_MASTER_PRD.md`  
   Ürünün kapsamlı Product Requirements Document (PRD) dokümanı.

3. `02_DATABASE_AND_AI_SCHEMA.md`  
   Veritabanı modeli, AI veri yapısı, review sistemi ve AI işleme pipeline'ı.

4. `03_DESIGN_SYSTEM.md`  
   Seçilen 4. tasarım referansını gerçek frontend kurallarına çeviren design system.

## Proje Özeti

**sayidwithenglish**, Türkçe konuşan tek bir kullanıcının gerçek hayatta karşılaştığı İngilizce kelime, ifade, phrasal verb, idiom, collocation ve cümleleri manuel olarak kaydedip AI ile işlediği; daha sonra flashcard, spaced repetition, quiz ve AI Tutor ile çalışabildiği kişisel İngilizce öğrenme platformudur.

Ana ürün döngüsü:

**Capture → Understand → Save → Practice → Review → Master**

Ana teknik yön:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Server-side AI API
- Responsive web + PWA
- Cloud sync
- Dark-mode-first premium SaaS UI
