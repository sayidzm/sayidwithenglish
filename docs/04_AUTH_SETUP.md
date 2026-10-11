# Phase 2 — Supabase foundation ve auth

Bu aşama yalnız Auth ve `profiles` persistence içerir. Vocabulary, review, istatistik ve AI içerikleri mevcut mock katmanda kalır.

## Environment

`.env.example` dosyasını `.env.local` olarak kullanın:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` alanı güncel `sb_publishable_…` anahtarını veya legacy `anon` anahtarını kabul eder. Service role / secret key gerekmez ve kullanılmaz. Public değişkenler build sırasında browser bundle'a girer; deploy ortamı değiştiğinde yeniden build gerekir. `APP_URL` server-only trusted origin'dir; email ve callback yönlendirmeleri kullanıcı girdisinden/Host header'dan üretilmez. Yayına çıkarken gerçek HTTPS adresini yazın.

Bağlı `sayidwithenglish` projesinin URL ve publishable key'i connector ile alınıp Git tarafından yok sayılan `.env.local` dosyasına yerleştirildi. Anahtar kopyalamak veya SQL'i elle çalıştırmak bu checkout için gerekmez.

## Connector ile tamamlananlar

- Proje, public tablolar, migration geçmişi ve kullanıcı sayısı değişiklikten önce incelendi; başlangıç boştu.
- `profiles_auth_foundation` migration'ı bir kez uygulandı. Yerel SQL `supabase/migrations/` altında remote migration version `20261011140958` ile eşleştirilmiştir; migration tekrar uygulanmamalıdır.
- 13 profil alanı, unique `user_id`, `auth.users` FK, defaults/check constraints ve RLS doğrulandı.
- Yalnız authenticated kullanıcı için own SELECT/INSERT/UPDATE policy'leri; UPDATE ownership `USING` + `WITH CHECK` ile korunur. ID/ownership/timestamp alanları güncellenemez; anonim erişim ve DELETE izni yoktur.
- Signup trigger'ı profili otomatik oluşturur. İç trigger fonksiyonu private schema'da, boş search_path ve direct EXECUTE izinleri kaldırılmıştır. Metadata yalnız görünen ad için kullanılır.
- `updated_at` trigger'ı ve var olan/import edilen hesaplar için üzerine yazmayan bootstrap bulunur.
- Database türleri connector üzerinden üretildi; security advisor temiz çıktı.
- Transaction içinde iki geçici kullanıcıyla own SELECT/UPDATE, cross-user SELECT/UPDATE/INSERT, ownership değiştirme ve anon SELECT test edildi. ROLLBACK sonrası kullanıcı/profil sayısı başlangıç değerinde kaldı.
- Public Auth settings: email açık, signup açık, email doğrulama gerekli.

## Dashboard'da gereken ayarlar

Bağlı connector URL configuration, email template veya SMTP güncelleme aracı sunmuyor. Bu ayarlar [Supabase Auth dashboard](https://supabase.com/dashboard/project/tttrsdkwsjibqfkymgbf/auth/url-configuration) üzerinden yapılır:

1. Site URL: `http://localhost:3000`.
2. Redirect URLs: `http://localhost:3000/auth/callback` ve `http://localhost:3000/auth/callback?next=/reset-password`. Başka port/origin kullanırsanız hem APP_URL'yi hem allowlist'i aynı değerlerle güncelleyin.
3. Email provider ve Confirm email açık kalsın. Gerçek kullanıcı email'leri için SMTP yapılandırın; Supabase'in varsayılan göndericisi deneme amaçlı ve kısıtlıdır.

Varsayılan email template'lerindeki `{{ .ConfirmationURL }}` aynı browser'da PKCE callback akışını destekler. Farklı browser/cihazdan bağlantı açılmasını desteklemek için [email template'lerde](https://supabase.com/dashboard/project/tttrsdkwsjibqfkymgbf/auth/templates) token-hash bağlantıları kullanılabilir:

Confirm signup:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup">Email adresimi doğrula</a>
```

Reset password:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Şifremi sıfırla</a>
```

Callback hem PKCE `code` hem tek kullanımlık `token_hash` doğrular. Hatalı/süresi dolan bağlantılar Türkçe hata mesajına döner. Reset sayfası ve server action, Supabase tarafından doğrulanmış kullanıcı gerektirir. Başarılı şifre değişimi mevcut browser oturumunu kapatır ve yeniden giriş ister.

## SSR ve güvenlik sınırları

Next.js 16 `proxy.ts`, Supabase `getClaims()` ile oturum yeniler ve cookie'leri request/response'a aktarır. Server DAL ayrıca `getUser()` ile kullanıcıyı doğrular. Her profil mutation'ı tekrar authenticate olur; DB sahipliği RLS ile uygulanır. Cookie adapter request başına kurulur; session global state veya server-wide cache içinde tutulmaz.

Mevcut Cache Components korunmuştur. SSR helper, üçüncü taraf Auth SDK'nın saat okumasından önce `connection()` çağırır; request-time içerik Suspense altında çalışır. Auth response'ları `private, no-store` kullanır. HTTPS origin'de cookie Secure'dür, SameSite=Lax ve path=/ korunur. Browser SSR client cookie erişimi için SDK'nın standart yaklaşımı kullanılır.

Profil adı, URL ve öğrenme tercihleri Supabase'e kaydedilir; kart türleri/kısayollar ve vocabulary hâlâ oturum içi mock'tur. Avatar URL saklanır; upload/Storage bu aşamada yoktur. Arayüz profil için baş harf avatarını kullanır.

## Test kapsamı ve sınırlar

`npm run test:e2e` izole `.next-auth-e2e` build'i ve yalnız loopback'te çalışan yerel HTTP Auth/PostgREST contract fixture'ı kurar. Production uygulamada auth bypass veya test session yolu yoktur. Mevcut shell/prototip testleri UI üzerinden giriş yapar; canlı projeye test hesabı eklemez veya profil yazmaz.

Auth testleri kayıt validation/confirmation, giriş hataları, return URL, refresh ve expired-session yenileme, korumalı sekiz route, forged cookie, logout, recovery PKCE/token-hash, geçersiz/tekrar kullanılan link, yeni şifre ve kalıcı profil davranışını kapsar. SQL/RLS testleri ayrıca gerçek bağlı Supabase projesinde çalıştırılmıştır.

SMTP delivery ve gerçek gelen kutusundaki bağlantıya tıklama otomatik olarak doğrulanmadı. Dashboard ayarları tamamlandıktan sonra kendi email adresinizle register → doğrula → login → reload → forgot/reset → logout smoke akışını çalıştırın.

## Phase 2 dosya envanteri

| Grup | Eklenen/değişen dosyalar |
| --- | --- |
| Supabase foundation | Yeni `lib/supabase/client.ts`, `server.ts`, `proxy.ts`, `env.ts`, `database.types.ts`; kök `proxy.ts`; `.env.example`; `supabase/migrations/20261011140958_profiles_auth_foundation.sql` |
| Auth DAL/actions | Yeni `lib/auth/actions.ts`, `session.ts`, `state.ts`, `errors.ts`, `origin.ts`, `redirect.ts` |
| Profil | Yeni `lib/profile/profile.ts`, `actions.ts` |
| Auth route/UI | Yeni `app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`; `app/auth/callback/route.ts`; `app/error.tsx`; `components/auth/auth-page.tsx`, `auth-form.tsx`, `logout-button.tsx`, `auth.module.css` |
| Mevcut ekranlar | Değişen `app/(workspace)/layout.tsx`, `settings/page.tsx`; `components/workspace/prototype-provider.tsx`, `settings.tsx`, `workspace.module.css`; `components/layout/app-shell.tsx`, `sidebar.tsx`, `topbar.tsx`, `shell.module.css` |
| Test/QA | Yeni `tests/auth.spec.ts`, `fixtures.ts`, `support/auth-api.mjs`, `support/start-server.mjs`, `support/settle-page.ts`; değişen `tests/app-shell.spec.ts`, `prototype.spec.ts`, `playwright.config.ts`; yeni `qa/validate-auth-captures.mjs`, `qa/PHASE2_QA_REPORT.md` |
| Config/dokümantasyon | Değişen `.gitignore`, `package.json`, `package-lock.json`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `README.md`, `PRODUCT.md`, `DESIGN.md`; yeni bu dosya |

`.env.local` ve capture/test çıktıları Git'e girmez. Tasarım tokenları, vocabulary mock verisi ve diğer altı ekran bileşeni değiştirilmedi. QA sırasında tablet collapse kontrolünün görünürlüğü, 320px metadata aralığı ve mobil review kontrollerinin belgelenen iki kolon düzeni düzeltildi.

Güncel resmi kaynaklar: [Next.js SSR client ve proxy](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [email/password ve reset](https://supabase.com/docs/guides/auth/passwords), [email template'leri](https://supabase.com/docs/guides/auth/auth-email-templates).
