import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { navigation, type PageId } from "@/lib/navigation";
import { PageHeader } from "./page-header";

const emptyCopy: Record<PageId, { title: string; description: string }> = {
  dashboard: { title: "Kendi kelimelerinle başla.", description: "Dizide veya günlük hayatta karşılaştığın ilk İngilizce ifadeyi ekle." },
  add: { title: "Yeni ifadelerine yer aç.", description: "Kelime, kalıp ve cümle ekleme alanın burada yer alacak." },
  library: { title: "Henüz hiçbir kayıt yok.", description: "Karşılaştığın ifadeler, anlamları ve örnekleriyle burada bir araya gelecek." },
  learn: { title: "Pratik alanın seni bekliyor.", description: "Kendi ifadelerinle yapacağın çalışmalar burada yer alacak." },
  review: { title: "Tekrar alanın hazır.", description: "Öğrendiklerini hatırlamak için çalışma kartların burada yer alacak." },
  tutor: { title: "İngilizce pratiği için bir alan.", description: "Kendi kelimelerinle yapacağın konuşmalar burada yer alacak." },
  statistics: { title: "Her çalışma bir adım.", description: "Öğrenme ilerlemen ve çalışma alışkanlıkların burada görünür olacak." },
  settings: { title: "Sana göre bir çalışma alanı.", description: "Profilin ve öğrenme tercihlerin burada yer alacak." },
};

export function PlaceholderPage({ page }: { page: PageId }) {
  const item = navigation.find(({ id }) => id === page)!;
  const copy = emptyCopy[page];
  const showAddLink = page === "dashboard" || page === "library";
  return <>
    <PageHeader title={item.label} description={item.description} />
    <Card><CardContent><EmptyState icon={item.icon} title={copy.title} description={copy.description}
      action={showAddLink ? <ButtonLink href="/add"><Plus aria-hidden="true" />İlk kaydını ekle</ButtonLink> : undefined} />
    </CardContent></Card>
  </>;
}
