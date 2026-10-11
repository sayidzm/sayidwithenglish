# sayidwithenglish — Proje Kararları

## 1. Ürün Adı

**sayidwithenglish**

## 2. Kullanıcı Modeli

- İlk sürüm sadece tek kullanıcı için.
- Kullanıcı: Sayid.
- Multi-user ürün davranışı hedeflenmiyor.
- Ancak veri modeli temiz ve ileride çok kullanıcılı hale getirilebilir yapıda kurulmalı.

## 3. Giriş Sistemi

Basit auth sistemi:

- E-mail + şifre
- Kayıt ol
- Giriş yap
- Çıkış yap
- Beni hatırla
- Şifre sıfırlama

Google veya Apple ile giriş ilk sürümde şart değil.

## 4. Profil Alanları

Profil içinde:

- İsim
- Profil fotoğrafı
- İngilizce seviyesi
- Hedef seviye
- Günlük çalışma hedefi
- Ana dil
- Öğrenilen dil

## 5. Dil Kapsamı

İlk sürüm:

- Ana dil: Türkçe
- Öğrenilen dil: İngilizce
- Arayüz dili: Türkçe

## 6. İçerik Ekleme

İki ana yöntem:

### Hızlı Ekleme
Tek kelime, kalıp veya cümle.

### Toplu Ekleme
Kullanıcı aşağıdaki gibi alt alta içerik yapıştırabilir:

```text
figure out
I was about to call you
awkward
What's the point?
```

Tek tuş:

**AI ile İşle**

## 7. AI Sınıflandırması

AI otomatik olarak ayırmalı:

- Kelime
- Phrase
- Phrasal verb
- Idiom
- Full sentence
- Collocation
- Grammar pattern
- Slang

## 8. Her Kayıt İçin İstenen AI Çıktıları

Her kayıt için:

- Türkçe anlam
- Birden fazla anlam
- Kısa İngilizce açıklama
- 2–3 örnek cümle
- Her örneğin Türkçe çevirisi
- Telaffuz
- Sesli telaffuz
- Benzer ifadeler
- Orijinal kullanıcı girdisi
- Seviyeye uygun örnekler

## 9. Seviye Bazlı Üretim

AI örnek cümleleri kullanıcının seviyesine göre üretmeli.

Örn. B1 kullanıcıya gereksiz C2 kelimelerle örnek verilmemeli.

## 10. Kaynak Sistemi

Kaynak bilgisi opsiyonel.

Kaynak türleri:

- Dizi
- Film
- YouTube
- Kitap
- Okul
- Podcast
- Web
- Manuel
- Diğer

Dizi için opsiyonel alanlar:

- Dizi adı
- Season
- Episode

Örn:

**Young Sheldon / S2 / E4**

## 11. Medya

- Ekran görüntüsü ekleme olabilir.
- Ses klibi yükleme ilk sürümde yok.
- Sesli telaffuz sistem tarafından sağlanacak.

## 12. Library Görünümleri

Üç görünüm:

- Tablo
- Liste
- Kart

Desktop varsayılan:

**Tablo**

## 13. Library Filtreleri

- Tür
- Seviye
- Kaynak
- Tag
- Deck
- Favori
- Zor
- Öğrenildi
- Öğreniliyor
- Tarih

## 14. Deck Sistemi

Deck/klasör sistemi olacak.

Örnekler:

- Young Sheldon
- Daily English
- Phrasal Verbs
- B1
- Slang

Bir kayıt birden fazla deck'e eklenebilir.

## 15. Tag Sistemi

Tag desteği olacak.

Örnekler:

- #daily
- #important
- #conversation
- #b1
- #slang

## 16. Kayıt Durumları

- Favori
- Zor
- Öğrenildi
- Öğreniliyor

## 17. Kişisel Notlar

Her kayda kişisel not yazılabilir.

## 18. AI Çıktısını Düzenleme

AI'nın ürettiği alanlar kullanıcı tarafından değiştirilebilir.

Kullanıcının manuel düzenlediği alanlar daha sonra AI yeniden çalıştırıldığında mümkün olduğunca korunmalı.

## 19. Duplicate Davranışı

Aynı ifade tekrar eklenirse:

- Uyarı ver.
- Mevcut kaydı görüntüle seçeneği sun.
- İstenirse yine de eklenebilsin.

İlk sürümde otomatik merge zorunlu değil.

## 20. Flashcard Türleri

Kullanıcı hangilerini kullanacağını seçebilmeli:

- English → Turkish
- Turkish → English
- Cümle → anlam
- Boşluk doldurma
- Dinle → seç
- Dinle → yaz
- Türkçe → İngilizce yaz
- Cümle tamamlama
- Kalıbı kullanarak cümle kur

## 21. Review Sistemi

Kart değerlendirmesi:

- Tekrar
- Zor
- İyi
- Kolay

Anki benzeri spaced repetition yaklaşımı.

Öneri:

**FSRS benzeri algoritma**

## 22. Günlük Çalışma

Sistem otomatik günlük çalışma seti oluşturmalı.

Örn:

- 10 yeni
- 28 tekrar
- Zorlandıkların

Günlük yeni kart limiti:

- 5
- 10
- 20
- Unlimited

## 23. Quiz Modu

- Çoktan seçmeli
- Yazmalı
- Boşluk doldurma
- Listening
- Karışık

AI yanlış cevapları açıklayabilmeli.

## 24. Hatalarım

Yanlış yapılan kayıtlar otomatik **Hatalarım** bölümüne düşmeli.

Bu öğeler daha sık tekrar getirilmelidir.

## 25. AI Tutor

Ayrı sayfa.

Örnek komutlar:

- Bugünkü kelimelerimle benimle konuş.
- Son 20 kaydımdan test yap.
- En zorlandığım kalıpları öğret.
- Sadece phrasal verb çalıştır.
- B1 seviyesinde diyalog oluştur.

AI düzeltme formatı:

1. Doğru cümle
2. Hata açıklaması
3. Daha doğal/native versiyon

## 26. Writing Practice

Writing practice olacak.

AI:

- grammar
- vocabulary
- naturalness

kontrolü yapmalı.

## 27. Speaking / Pronunciation

İlk sürümde tam pronunciation scoring şart değil.

Olması gerekenler:

- Sesli telaffuz
- US / UK accent seçimi
- Shadowing

## 28. Dashboard

Ana kartlar:

- Bugünkü tekrarlar
- Bugün eklenenler
- Toplam kayıt
- Zor öğeler
- Son eklenenler
- Haftalık aktivite
- Günlük hedef
- Zorlandıklarım
- Devam et

## 29. Gamification

- Minimal streak olabilir.
- XP/level sistemi ilk sürümde yok.
- Çocukça rozet sistemi yok.
- Ürün ciddi ve profesyonel kalmalı.

## 30. Raporlar

- Haftalık AI raporu
- Aylık rapor
- Seviye eğilimi
- CEFR distribution

## 31. Search

Güçlü arama:

- ifade
- Türkçe anlam
- örnek cümle
- kaynak
- tag
- deck
- kişisel not

Global command palette:

**Ctrl/Cmd + K**

## 32. Klavye Kısayolları

- `N` → yeni kayıt
- `/` → arama
- `Ctrl/Cmd + K` → command palette
- `Space` → kartı çevir
- `1–4` → review rating
- `Esc` → kapat

## 33. Responsive + Sync

Site:

- Desktop
- Tablet
- Mobile
- PWA

Veriler bulutta saklanmalı.

PC'de kaydedilen içerikler telefondan siteye girildiğinde görünmeli.

Senkronize edilecek:

- entries
- decks
- tags
- notes
- favorites
- review history
- progress
- mistakes
- AI Tutor history
- profile
- settings

## 34. Export / Backup

İlk sürümde:

- CSV
- JSON

İleride:

- Anki export

Soft delete / Trash:

- 30 gün

## 35. Tasarım Kararı

Ana tasarım referansı:

**Seçilen 4. görsel**

Tasarım yönü:

- Premium
- Dark mode first
- Apple + Linear + Vercel
- Mavi ana accent
- Violet secondary
- Minimal
- Profesyonel
- Bilgi yoğun ama okunabilir
- Çocukça değil
- Aşırı gamified değil

## 36. Teknik Yön

Önerilen stack:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Server-side AI API
- Lucide Icons
