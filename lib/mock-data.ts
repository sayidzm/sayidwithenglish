export type EntryType = "Phrasal Verb" | "Word" | "Phrase" | "Sentence";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type LearningStatus = "Yeni" | "Öğreniliyor" | "Öğrenildi" | "Zor";
export type Example = { english: string; turkish: string };
export type Entry = {
  id: string;
  expression: string;
  type: EntryType;
  level: Level;
  status: LearningStatus;
  meanings: string[];
  definition: string;
  ipa: string;
  pronunciationReadable?: string;
  originalInput?: string;
  examples: Example[];
  similar: string[];
  source: string;
  sourceType: string;
  sourceSentence: string;
  date: string;
  decks: string[];
  tags: string[];
  note: string;
};

const createEntry = (
  entry: Omit<Entry, "decks" | "tags" | "note"> &
    Partial<Pick<Entry, "decks" | "tags" | "note">>,
): Entry => ({
  decks: ["Günlük İngilizce"],
  tags: ["günlük hayat"],
  note: "",
  ...entry,
});
export const mockEntries: Entry[] = [
  createEntry({
    id: "figure-out",
    expression: "figure out",
    type: "Phrasal Verb",
    level: "B1",
    status: "Öğreniliyor",
    meanings: ["anlamak", "çözmek", "bir yolunu bulmak"],
    definition: "To understand or solve something by thinking about it.",
    ipa: "/ˈfɪɡər aʊt/",
    examples: [
      {
        english: "I finally figured out how to fix the problem.",
        turkish: "Sonunda sorunu nasıl çözeceğimi buldum.",
      },
      {
        english: "We need to figure out what happened.",
        turkish: "Ne olduğunu anlamamız gerekiyor.",
      },
    ],
    similar: ["work out", "find out", "solve"],
    source: "Friends · S02 E05",
    sourceType: "Dizi",
    sourceSentence: "I'll figure it out. I always do.",
    date: "2026-10-11",
    decks: ["Günlük İngilizce", "Friends"],
    tags: ["problem çözme", "phrasal verb"],
    note: "Work out ile benzer; figure out daha çok düşünerek anlamak için kullanılıyor.",
  }),
  createEntry({
    id: "whats-the-point",
    expression: "What's the point?",
    type: "Phrase",
    level: "B1",
    status: "Zor",
    meanings: ["Ne anlamı var?", "Ne işe yarar?"],
    definition: "Used to ask why something is useful or worth doing.",
    ipa: "/wʌts ðə pɔɪnt/",
    examples: [
      {
        english: "What's the point of waiting any longer?",
        turkish: "Daha fazla beklemenin ne anlamı var?",
      },
    ],
    similar: ["Why bother?", "What for?"],
    source: "The Office · S03 E02",
    sourceType: "Dizi",
    sourceSentence: "What's the point if nobody listens?",
    date: "2026-10-11",
    tags: ["konuşma kalıbı"],
  }),
  createEntry({
    id: "awkward",
    expression: "awkward",
    type: "Word",
    level: "B2",
    status: "Yeni",
    meanings: ["tuhaf", "rahatsız edici", "beceriksiz"],
    definition: "Making you feel embarrassed or uncomfortable.",
    ipa: "/ˈɔːkwərd/",
    examples: [
      {
        english: "There was an awkward silence after the question.",
        turkish: "Sorudan sonra rahatsız edici bir sessizlik oldu.",
      },
    ],
    similar: ["uncomfortable", "embarrassing"],
    source: "YouTube · English with Lucy",
    sourceType: "Video",
    sourceSentence: "It can feel awkward at first.",
    date: "2026-10-11",
  }),
  createEntry({
    id: "supposed-to",
    expression: "be supposed to",
    type: "Phrase",
    level: "B1",
    status: "Öğreniliyor",
    meanings: ["-mesi beklenmek", "-mesi gerekmek"],
    definition: "To be expected or required to do something.",
    ipa: "/bi səˈpoʊzd tuː/",
    examples: [
      {
        english: "We're supposed to be there by nine.",
        turkish: "Saat dokuza kadar orada olmamız gerekiyor.",
      },
    ],
    similar: ["be expected to", "should"],
    source: "Friends · S01 E08",
    sourceType: "Dizi",
    sourceSentence: "You're supposed to tell me these things.",
    date: "2026-10-10",
  }),
  createEntry({
    id: "didnt-mean",
    expression: "I didn't mean to...",
    type: "Sentence",
    level: "B1",
    status: "Öğrenildi",
    meanings: ["... yapmak istememiştim", "Niyetim ... değildi"],
    definition: "Used to explain that an action was not intentional.",
    ipa: "/aɪ ˈdɪdnt miːn tuː/",
    examples: [
      {
        english: "I didn't mean to hurt your feelings.",
        turkish: "Duygularını incitmek istememiştim.",
      },
    ],
    similar: ["It wasn't my intention", "I didn't intend to"],
    source: "Günlük konuşma",
    sourceType: "Manuel",
    sourceSentence: "I didn't mean to interrupt.",
    date: "2026-10-10",
  }),
  createEntry({
    id: "work-out",
    expression: "work out",
    type: "Phrasal Verb",
    level: "B1",
    status: "Zor",
    meanings: ["çözmek", "yoluna girmek", "egzersiz yapmak"],
    definition: "To find a solution, develop successfully, or exercise.",
    ipa: "/wɜːrk aʊt/",
    examples: [
      {
        english: "Don't worry. Everything will work out.",
        turkish: "Merak etme. Her şey yoluna girecek.",
      },
    ],
    similar: ["figure out", "resolve"],
    source: "Podcast · All Ears English",
    sourceType: "Podcast",
    sourceSentence: "Let's work out the details together.",
    date: "2026-10-09",
  }),
  createEntry({
    id: "apparently",
    expression: "apparently",
    type: "Word",
    level: "B2",
    status: "Öğreniliyor",
    meanings: ["görünüşe göre", "anlaşılan"],
    definition: "According to what you have heard or seen.",
    ipa: "/əˈpærəntli/",
    examples: [
      {
        english: "Apparently, the meeting has been cancelled.",
        turkish: "Görünüşe göre toplantı iptal edilmiş.",
      },
    ],
    similar: ["seemingly", "it seems"],
    source: "BBC · 6 Minute English",
    sourceType: "Podcast",
    sourceSentence: "Apparently, it happens more often than you think.",
    date: "2026-10-08",
  }),
  createEntry({
    id: "make-sense",
    expression: "make sense",
    type: "Phrase",
    level: "A2",
    status: "Öğrenildi",
    meanings: ["mantıklı olmak", "anlamlı olmak"],
    definition: "To be clear and easy to understand.",
    ipa: "/meɪk sens/",
    examples: [
      {
        english: "Your explanation makes sense now.",
        turkish: "Açıklaman şimdi mantıklı geliyor.",
      },
    ],
    similar: ["be logical", "be clear"],
    source: "Günlük konuşma",
    sourceType: "Manuel",
    sourceSentence: "That makes perfect sense.",
    date: "2026-10-07",
  }),
  createEntry({
    id: "about-to",
    expression: "I was about to call you",
    type: "Sentence",
    level: "B1",
    status: "Yeni",
    meanings: ["Tam seni aramak üzereydim"],
    definition: "Used when something was going to happen very soon.",
    ipa: "/aɪ wəz əˈbaʊt tə kɔːl juː/",
    examples: [
      {
        english: "I was about to call you when you arrived.",
        turkish: "Sen geldiğinde tam seni aramak üzereydim.",
      },
    ],
    similar: ["be going to", "be on the point of"],
    source: "Friends · S02 E05",
    sourceType: "Dizi",
    sourceSentence: "Hey! I was about to call you.",
    date: "2026-10-11",
  }),
  createEntry({
    id: "take-account",
    expression: "take into account",
    type: "Phrase",
    level: "B2",
    status: "Öğreniliyor",
    meanings: ["dikkate almak", "göz önünde bulundurmak"],
    definition: "To consider something when making a decision.",
    ipa: "/teɪk ˌɪntu əˈkaʊnt/",
    examples: [
      {
        english: "We should take the weather into account.",
        turkish: "Hava durumunu göz önünde bulundurmalıyız.",
      },
    ],
    similar: ["consider", "bear in mind"],
    source: "BBC · Worklife",
    sourceType: "Makale",
    sourceSentence: "Take all the costs into account.",
    date: "2026-10-06",
  }),
];
export const entryTypes: EntryType[] = [
  "Word",
  "Phrase",
  "Phrasal Verb",
  "Sentence",
];
export const levels: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const statuses: LearningStatus[] = [
  "Yeni",
  "Öğreniliyor",
  "Öğrenildi",
  "Zor",
];
export const weeklyActivity = [
  { day: "Pzt", reviews: 18, learned: 5 },
  { day: "Sal", reviews: 14, learned: 4 },
  { day: "Çar", reviews: 25, learned: 8 },
  { day: "Per", reviews: 20, learned: 6 },
  { day: "Cum", reviews: 32, learned: 10 },
  { day: "Cmt", reviews: 21, learned: 7 },
  { day: "Paz", reviews: 24, learned: 5 },
];
export const overview = {
  reviews: 24,
  reviewGoal: 30,
  added: 5,
  total: 342,
  difficult: 18,
  learned: 218,
  accuracy: 87,
  streak: 12,
};
export const previousWeeklyActivity = [
  { day: "Pzt", reviews: 12, learned: 3 },
  { day: "Sal", reviews: 18, learned: 5 },
  { day: "Çar", reviews: 15, learned: 4 },
  { day: "Per", reviews: 22, learned: 6 },
  { day: "Cum", reviews: 17, learned: 5 },
  { day: "Cmt", reviews: 19, learned: 7 },
  { day: "Paz", reviews: 16, learned: 5 },
];
export const flashcardTypes = [
  { id: "en_to_tr", label: "İngilizce → Türkçe" },
  { id: "tr_to_en", label: "Türkçe → İngilizce" },
  { id: "meaning", label: "Tanımdan ifade" },
  { id: "cloze", label: "Boşluk doldurma" },
  { id: "sentence_completion", label: "Cümle tamamlama" },
  { id: "translation", label: "Çeviri" },
  { id: "production", label: "Cümle kurma" },
] as const;
export const cefrDistribution = [
  { label: "A1", value: 32 },
  { label: "A2", value: 68 },
  { label: "B1", value: 142 },
  { label: "B2", value: 78 },
  { label: "C1", value: 18 },
  { label: "C2", value: 4 },
];
export const sourceDistribution = [
  { label: "Diziler", value: 42 },
  { label: "Videolar", value: 25 },
  { label: "Podcast", value: 18 },
  { label: "Diğer", value: 15 },
];
export const difficultCategories = [
  { label: "Phrasal verbs", value: 9 },
  { label: "Konuşma kalıpları", value: 5 },
  { label: "Kelimeler", value: 3 },
  { label: "Cümleler", value: 1 },
];
export const typeDistribution = [
  { label: "Word", value: 146 },
  { label: "Phrase", value: 98 },
  { label: "Phrasal Verb", value: 72 },
  { label: "Sentence", value: 26 },
];
export const activityHeatmap = Array.from(
  { length: 84 },
  (_, i) => (i * 7 + Math.floor(i / 9)) % 5,
);
export const addExamples = [
  "figure out",
  "I was about to call you",
  "awkward",
  "What's the point?",
];
export const processingStages = [
  "İfadeyi analiz et",
  "Türkçe anlam oluştur",
  "Açıklama oluştur",
  "Örnek cümleler oluştur",
  "Benzer ifadeler",
  "Flashcard hazırla",
];
export const tutorPrompts = [
  "Bugünkü kelimelerimle benimle konuş",
  "Son 20 kaydımdan test yap",
  "Zorlandığım kalıpları öğret",
  "B1 seviyesinde diyalog oluştur",
];
export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  correction?: boolean;
};
export const initialConversation: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Merhaba Sayid! Bugün ‘figure out’, ‘awkward’ ve ‘make sense’ ile kısa bir konuşma yapalım. Tell me about a problem you solved recently.",
  },
  {
    id: "answer",
    role: "user",
    text: "Yesterday I figure out how to fix my laptop. It was a little awkward but now it make sense.",
  },
  {
    id: "correction",
    role: "assistant",
    text: "Güzel bir başlangıç! Anlatmak istediğin çok net. Zaman uyumunu birlikte düzeltelim.",
    correction: true,
  },
  {
    id: "followup",
    role: "assistant",
    text: "How did you figure it out? Did someone help you, or did you find the solution yourself?",
  },
];
export const correctionExample = {
  original: "Yesterday I figure out how to fix my laptop.",
  corrected: "Yesterday I figured out how to fix my laptop.",
  reason:
    "‘Yesterday’ geçmiş zamanı belirtir. Bu yüzden ‘figure out’ yerine ‘figured out’ kullanırız.",
  natural: "I managed to figure out what was wrong with my laptop yesterday.",
};
export const tutorReplies = [
  "Let's use today's words. Imagine an awkward moment at work. How would you figure out what to say? Try using ‘make sense’ in your answer.",
  "İlk soru: ‘anlaşılan, görünüşe göre’ anlamına gelen kelime hangisi? A) awkward · B) apparently · C) work out. Yanıtını bir örnek cümleyle yazabilirsin.",
  "‘Work out’ üç farklı anlamda kullanılabilir: çözmek, yoluna girmek ve egzersiz yapmak. Örnek: ‘Things will work out.’ Şimdi bu kalıpla kendi cümleni kur.",
  "Let's plan a weekend trip. I'll start: ‘We're supposed to leave at nine, but I haven't figured out the route yet.’ What would you say next?",
];
export const practiceModes = [
  {
    id: "flashcards",
    title: "Flashcards",
    description:
      "İfadeyi gör, anlamını hatırla. Aralıklı tekrar ile kalıcı öğren.",
    count: "30 kart hazır",
    icon: "cards",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Doğru anlamı seç. Bildiklerini kısa bir testte kontrol et.",
    count: "10 soru",
    icon: "quiz",
  },
  {
    id: "cloze",
    title: "Boşluk doldurma",
    description: "İfadeleri gerçek cümlelerin içinde kullanmayı öğren.",
    count: "8 alıştırma",
    icon: "cloze",
  },
  {
    id: "listening",
    title: "Listening",
    description: "Telaffuz ve dinleme pratiğiyle kulağını geliştir.",
    count: "Yakında",
    icon: "listening",
  },
  {
    id: "translation",
    title: "Translation",
    description: "Türkçeden İngilizceye geç. İfadeleri aktif olarak hatırla.",
    count: "12 cümle",
    icon: "translation",
  },
  {
    id: "writing",
    title: "Writing practice",
    description: "Yeni kelimelerinle kendi cümlelerini oluştur.",
    count: "5 kelime",
    icon: "writing",
  },
] as const;
export type PracticeMode = (typeof practiceModes)[number]["id"];
export const practiceExercises = {
  quiz: {
    question: "‘figure out’ ne anlama gelir?",
    options: ["Vazgeçmek", "Anlamak, çözmek", "Ertelemek"],
    correct: "Anlamak, çözmek",
  },
  cloze: {
    question: "I finally ___ how to fix the problem.",
    answer: "figured out",
  },
  translation: {
    question: "Bu açıklama mantıklı geliyor.",
    answer: "This explanation makes sense.",
  },
  writing: {
    question: "‘awkward’ kelimesini kullanarak bir cümle yaz.",
    example: "There was an awkward silence in the room.",
  },
};
export type WorkspaceSettings = {
  currentLevel: Level;
  targetLevel: Level;
  reviewGoal: number;
  newLimit: number;
  accent: "US" | "UK";
  cardTypes: string[];
  shortcuts: boolean;
};
export const initialSettings: WorkspaceSettings = {
  currentLevel: "B1",
  targetLevel: "B2",
  reviewGoal: 30,
  newLimit: 5,
  accent: "US",
  cardTypes: flashcardTypes.map((type) => type.id),
  shortcuts: true,
};
export function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
