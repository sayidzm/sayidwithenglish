export function authError(error: { code?: string; status?: number } | null) {
  if (
    error?.status === 429 ||
    error?.code === "over_email_send_rate_limit" ||
    error?.code === "over_request_rate_limit"
  )
    return "Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.";
  switch (error?.code) {
    case "invalid_credentials":
      return "Email veya şifre hatalı. Bilgilerini kontrol et.";
    case "email_not_confirmed":
      return "Önce email adresini doğrula. Gelen kutunu kontrol et.";
    case "weak_password":
      return "Şifren yeterince güçlü değil. Daha uzun ve farklı karakterler içeren bir şifre seç.";
    case "same_password":
      return "Yeni şifren önceki şifrenden farklı olmalı.";
    case "signup_disabled":
      return "Yeni kayıtlar şu anda kapalı.";
    case "user_already_exists":
      return "Bu email ile kayıt tamamlanamadı. Giriş yapmayı veya şifre sıfırlamayı dene.";
    default:
      return "İşlem tamamlanamadı. Bağlantını kontrol edip tekrar dene.";
  }
}
