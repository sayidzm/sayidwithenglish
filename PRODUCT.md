# sayidwithenglish — Ürün bağlamı

Bu dosya kısa bir bağlam özetidir. Ürün kararlarında [Proje Kararları](docs/00_PROJECT_DECISIONS.md) ve [Master PRD](docs/01_MASTER_PRD.md), görsel kararlarda [Tasarım Sistemi](docs/03_DESIGN_SYSTEM.md) asıl kaynaklardır. Gelecek veri ve AI davranışı [Database + AI Schema](docs/02_DATABASE_AND_AI_SCHEMA.md) içinde tanımlıdır.

İlk kullanıcı Sayid'dir. Arayüz ve ana dil Türkçe, öğrenilen dil İngilizcedir. Amaç, kullanıcının günlük hayatta karşılaştığı İngilizceyi kendi öğrenme içeriğine dönüştürmektir. Ana motto: **Kendi kelimelerinle, daha derin, daha kalıcı öğren.**

Hedef ürün döngüsü **Capture → Understand → Save → Practice → Review → Master** şeklindedir. Ürün; içerik toplama, kullanıcı tarafından düzenlenebilir AI zenginleştirme, kişisel kütüphane, öğrenme/tekrar oturumları ve AI Tutor etrafında çalışacaktır.

Mevcut frontend bu döngüyü sekiz dolu ekranla görünür kılar: dashboard, Ekle, Kütüphane, Öğren, Tekrar, AI Tutor, İstatistikler ve Ayarlar. Phase 2 ile gerçek Supabase email/password authentication, kalıcı session, email doğrulama/şifre sıfırlama ve korumalı uygulama route'ları eklenmiştir. Profil ve öğrenme tercihleri Supabase'de kullanıcıya özel RLS ile kalıcıdır. Hazır vocabulary, örnek flashcard, tutor ve alıştırmalar hâlâ mock'tur; ortak provider bunları sayfa geçişleri boyunca bellekte tutar, yeniden yükleme örnek başlangıca döner.

On ayrıntılı örnek kayıt ile 342 kayıtlık örnek toplam birbirinden ayrıdır. Grafikler ve çoğu KPI fixture'dır. AI işleme ve tutor hazır içerik kullanır; gerçek AI veya SRS motoru değildir. Vocabulary persistence, review backend, Storage, bulut vocabulary senkronizasyonu, TTS ve sesli alıştırma bu aşamaya dahil değildir. Aksan/kart türü gibi bazı tercihler gelecekteki davranışın UI'sını gösterir. Auth kurulumu ve gerçek email teslimi için gereken dashboard ayarları [Phase 2 kurulumunda](docs/04_AUTH_SETUP.md) açıklanır.

Görsel yön koyu tema öncelikli, minimal, kompakt, profesyonel ve okunabilir çalışma alanıdır. Seçilen referans ile docs/03'teki kompozisyon korunur; metin/padding okunabilirliği ve mobile özel düzen kaynak dokümanın yönüne göre iyileştirilir. Çocukça gamification, aşırı gradient, neon cyberpunk ve yaygın glassmorphism bu yönle uyuşmaz.

Kurulum, kesin uygulama sınırları, doğrulama ve bu geçişin dosya envanteri [README.md](README.md) içinde; uygulanan görsel sistem ve değişmeyen normative tokenlar [DESIGN.md](DESIGN.md) içinde yer alır.
