import { BookOpen, ChartNoAxesCombined, GraduationCap, House, MessageSquare, Plus, RotateCcw, Settings } from "lucide-react";

export const navigation = [
  { id: "dashboard", href: "/dashboard", label: "Ana Sayfa", mobileLabel: "Ana Sayfa", icon: House, description: "Kendi kelimelerinle, daha derin, daha kalıcı öğren." },
  { id: "add", href: "/add", label: "Ekle", mobileLabel: "Ekle", icon: Plus, description: "Karşılaştığın İngilizceyi kendi çalışma alanına taşı." },
  { id: "library", href: "/library", label: "Kütüphane", mobileLabel: "Kütüphane", icon: BookOpen, description: "Kelimelerin, ifadelerin ve cümlelerin tek bir yerde." },
  { id: "learn", href: "/learn", label: "Öğren", mobileLabel: "Öğren", icon: GraduationCap, description: "Kendi ifadelerinle pratik yap, öğrendiklerini kullan." },
  { id: "review", href: "/review", label: "Tekrar", mobileLabel: "Tekrar", icon: RotateCcw, description: "Doğru zamanda tekrar et, daha kalıcı öğren." },
  { id: "tutor", href: "/tutor", label: "AI Tutor", mobileLabel: "Tutor", icon: MessageSquare, description: "Kendi kelimelerin etrafında şekillenen İngilizce pratiği." },
  { id: "statistics", href: "/statistics", label: "İstatistikler", mobileLabel: "İstatistikler", icon: ChartNoAxesCombined, description: "Öğrenme yolculuğuna daha yakından bak." },
  { id: "settings", href: "/settings", label: "Ayarlar", mobileLabel: "Ayarlar", icon: Settings, description: "Çalışma alanını kendi öğrenme alışkanlıklarına göre düzenle." },
] as const;

export type PageId = (typeof navigation)[number]["id"];
export const mobileNavigation = [navigation[0], navigation[2], navigation[1], navigation[4], navigation[5]] as const;

export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
