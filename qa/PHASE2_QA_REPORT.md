# Phase 2 — Auth/profil doğrulaması

Tarih: 2026-10-11. Kapsam: gerçek Supabase Auth ve `profiles`; vocabulary/review/AI mevcut mock katmanda korunur. Kurulum ve dosya envanteri: [04_AUTH_SETUP.md](../docs/04_AUTH_SETUP.md).

## Teknik doğrulama

- ESLint: başarılı, 0 hata/uyarı.
- TypeScript: `next typegen && tsc --noEmit` başarılı.
- Production build: gerçek Supabase public URL/key environment'ıyla başarılı; Cache Components, App Router ve proxy korunur.
- Playwright: dört viewport'ta 116 test; 109 başarılı, 7 ilgili viewport'a uygulanmadığı için skip, 0 başarısız (3.2 dakika). Auth, session refresh, password recovery, forged cookie, safe redirect, profile persistence ve mevcut shell/prototip akışları kapsanır.
- Testler ayrı `.next-auth-e2e` build'i ve loopback HTTP Auth/PostgREST fixture'ını kullanır. Production uygulamada auth bypass/test session endpoint'i yoktur. Fixture testinin geçmesi canlı email tesliminin kanıtı değildir.
- `npm audit --omit=dev`: runtime bağımlılıklarında 0 advisory. Mevcut ESLint/fast-glob/micromatch/braces dev zincirinde 5 high advisory vardır; önerilen otomatik çözüm Next ESLint paketini eski major'a düşürdüğü için uygulanmadı.

## Gerçek Supabase doğrulaması

- Mevcut `sayidwithenglish` projesi önceden incelendi; public tablolar ve migration geçmişi başlangıçta boştu.
- Tek `profiles_auth_foundation` migration'ı uygulandı; remote version `20261011140958` ile yerel SQL adı eşleşir.
- 13 sütun, `auth.users` FK/cascade, unique user_id, defaults/check constraints, enabled RLS, own SELECT/INSERT/UPDATE ve kısıtlı UPDATE kolonları doğrulandı.
- Private bootstrap ve updated_at trigger'ları, revoked direct EXECUTE ve boş search_path doğrulandı. Metadata authorization için kullanılmaz.
- İki geçici kullanıcılı transaction'da own SELECT/UPDATE, cross-user SELECT/UPDATE/INSERT, user_id değiştirme ve anonim SELECT kontrol edildi. ROLLBACK sonrası auth users/profiles başlangıç sayısında kaldı; kalıcı test hesabı eklenmedi.
- Security advisor: boş lints. Public Auth settings: email/signup açık, email doğrulama gerekli. Public SDK ile anonim profil erişimi reddi ve yanlış giriş `invalid_credentials` doğrulandı.
- Connector Auth URL, SMTP veya email-template güncellemesi desteklemiyor; bu ayarlar değiştirilmedi.

## Güncel görsel kapsam

Tam 71 PNG, dört viewport: 1440×900, 768×1024, 390×844, 320×720. Uzun ekranlarda full-page capture kullanılır.

- `qa/auth/`: login, login-error, register, register-success, forgot-password, reset-invalid, reset-password, settings-profile × 4 = 32.
- `qa/screenshots/`: sekiz workspace route × 4 = 32; dört palette, iki mobil menü, bir desktop collapse = 39.
- `qa/validate-auth-captures.mjs` PNG imzası, boyut ve app/components/lib/styles kaynak güncelliğini doğrular; `qa/phase2-capture-manifest.json` tam dosya listesini kaydeder. Capture çıktıları/manifest Git tarafından yok sayılır.
- Phase 1 `qa/final/`, `docs/screenshots/` ve `QA_REPORT.md` tarihsel kanıttır; Phase 2 görsel onayı bunlara dayanmaz.

İlk capture'larda stream edilen Suspense fallback ve yerleşmemiş CSS bulundu. Test helper artık load, fallback yokluğu, form/profil alanı, fontlar ve üç kararlı layout ölçümünü bekler. Tam matris yeniden çekildi. Image viewer'ın varsayılan küçültmesi desktop dashboard'u kırpılmış gösterdi; original detail ile x1398 sağ sınırı doğrulandı, ürün kusuru değildi.

Görsel düzeltmeler: tablet collapse kontrolünde CSS specificity artırıldı; dar mobil metadata summary'ye token gap/wrap eklendi; mobil review kontrolleri belgelenen iki kolona geçti. Tablet görünürlük ve review çakışma kontrolleri testlere eklendi. Renk/type/spacing tokenları, desktop kompozisyon ve mock içerik korunur.

## Nihai bağımsız inceleme

Son kaynak üzerinde iki yeni, bağımsız read-only reviewer tüm 71 güncel PNG'yi original detail ile açtı. Pass A (design-system/işlev/güvenlik): **PASS, HIGH confidence, blocking yok**. Pass B (görsel/responsive): **PASS, HIGH confidence, blocking yok**. İki karar aynı son kaynak ve capture matrisi üzerindedir.

| Boyut | Karar | Kanıt |
| --- | --- | --- |
| Gerçek design system / DOM | İyi | Mevcut Card/Input/Button ve semantic tokenlar; screenshot ile sahte UI yok |
| Auth/profil işlevleri | İyi | Gerçek Supabase API yolları, server DAL ve RLS; fixture yalnız ayrı test build'inde |
| Responsive shell | İyi | Dört viewport ve tüm route'lar; tablet/mobil üç bulgu giderildi |
| Görsel tutarlılık / Türkçe | İyi | İki reviewer tüm 71 capture'ı açtı; auth clipping/glyph/fallback kusuru yok |
| Capture bütünlüğü | İyi | PNG imzaları, boyutlar ve kaynak güncelliği validator + bağımsız inceleme ile doğrulandı |

Pass B, Phase 2 öncesinden kalan düşük öncelikli bir sınıra işaret etti: 320px'te bazı native select'lerde seçili metin kısalır (aksan/dönem). Bu, auth/profil eklemesinin getirdiği bir regresyon değildir; sonraki dar ekran polish'inde kısa label veya kontrol genişliğiyle iyileştirilebilir.

## Kalan sınırlar

- Dashboard localhost Site URL/callback allowlist ve gerçek kullanıcı email'leri için SMTP kurulumu manuel gerekir; kesin değerler kurulum dokümanındadır.
- Gerçek inbox'ta register/confirm/recovery bağlantısı açma doğrulanmadı. Sonraki önerilen adım bu ayarlardan sonra kendi email adresiyle canlı auth smoke akışıdır.
- Avatar URL saklanır; upload/Storage yoktur. Kart türleri/kısayollar, vocabulary ve review geçmişi hâlâ oturum içi mock'tur.
- Phase 3'e geçilmedi.
