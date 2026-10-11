# sayidwithenglish — Database + AI Schema v0.1

## 1. Genel Mimari

Önerilen yapı:

- Frontend: Next.js + TypeScript
- Database: PostgreSQL
- Backend platform: Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage
- Realtime sync: Supabase Realtime
- AI: server-side API
- Hosting: Vercel

Temel prensip:

**AI içerik üretir, database saklar, kullanıcı düzenler, review sistemi öğrenme geçmişini takip eder.**

## 2. Ana İlişki

```text
User
 ├─ Profile
 ├─ Entries
 │   ├─ Meanings
 │   ├─ Examples
 │   ├─ Similar Expressions
 │   ├─ Notes
 │   ├─ Tags
 │   ├─ Decks
 │   ├─ Sources
 │   └─ Flashcards
 ├─ Decks
 ├─ Tags
 ├─ Review History
 ├─ Study Sessions
 ├─ Mistakes
 ├─ AI Tutor Conversations
 ├─ Statistics
 └─ Settings
```

## 3. `profiles`

```text
id
user_id
display_name
avatar_url
native_language
learning_language
current_level
target_level
daily_new_card_limit
daily_review_goal
preferred_accent
created_at
updated_at
```

Örnek:

```json
{
  "display_name": "Sayid",
  "native_language": "tr",
  "learning_language": "en",
  "current_level": "B1",
  "target_level": "B2",
  "daily_new_card_limit": 10,
  "daily_review_goal": 30,
  "preferred_accent": "us"
}
```

## 4. `entries`

```text
id
user_id
expression
normalized_expression
entry_type
cefr_level
english_explanation
pronunciation_ipa
pronunciation_readable
is_favorite
is_difficult
is_mastered
learning_status
original_input
user_note
image_url
ai_generated
ai_version
created_at
updated_at
deleted_at
```

### `entry_type`

```text
word
phrase
phrasal_verb
idiom
sentence
collocation
grammar_pattern
slang
```

### `learning_status`

```text
new
learning
reviewing
mastered
suspended
```

## 5. Normalized Expression

Duplicate detection için.

Örn:

```text
expression: Figure Out
normalized_expression: figure out
```

Normalize:

- lowercase
- trim
- gereksiz boşlukları kaldır
- punctuation normalize et

## 6. `entry_meanings`

```text
id
entry_id
meaning_tr
meaning_order
usage_note
is_primary
created_at
updated_at
```

## 7. `entry_examples`

```text
id
entry_id
sentence_en
translation_tr
example_order
difficulty_level
source_type
is_user_added
created_at
updated_at
```

## 8. `similar_expressions`

```text
id
entry_id
expression
turkish_meaning
relationship_type
usage_difference
created_at
```

### `relationship_type`

```text
synonym
related
alternative
formal_alternative
casual_alternative
slang_alternative
```

## 9. `entry_sources`

```text
id
entry_id
source_type
source_name
series_name
season_number
episode_number
source_url
source_sentence
created_at
```

### `source_type`

```text
tv_series
movie
youtube
book
school
podcast
web
manual
other
```

## 10. `decks`

```text
id
user_id
name
description
icon
color
is_archived
created_at
updated_at
```

## 11. `deck_entries`

```text
id
deck_id
entry_id
created_at
```

Unique:

```text
deck_id + entry_id
```

## 12. `tags`

```text
id
user_id
name
created_at
```

## 13. `entry_tags`

```text
entry_id
tag_id
```

## 14. User Override Sistemi

AI çıktısı kullanıcı tarafından düzenlendiğinde korunmalı.

Öneri:

```text
entry_field_overrides
```

Alanlar:

```text
id
entry_id
field_name
override_value_json
created_at
updated_at
```

Basit alanlarda `is_user_edited`, kompleks alanlarda override mantığı kullanılabilir.

## 15. `flashcards`

Bir entry birden fazla flashcard üretebilir.

```text
id
user_id
entry_id
card_type
front_data
back_data
is_enabled
created_at
updated_at
```

### `card_type`

```text
en_to_tr
tr_to_en
meaning
cloze
listening
sentence_completion
translation
production
```

## 16. Flashcard JSON Örneği

```json
{
  "card_type": "en_to_tr",
  "front_data": {
    "expression": "figure out"
  },
  "back_data": {
    "meanings": [
      "anlamak",
      "çözmek",
      "bir yolunu bulmak"
    ]
  }
}
```

## 17. Cloze Örneği

```json
{
  "card_type": "cloze",
  "front_data": {
    "sentence": "I'll ______ it out."
  },
  "back_data": {
    "answer": "figure"
  }
}
```

## 18. `review_state`

FSRS benzeri sistem için:

```text
id
flashcard_id
user_id
stability
difficulty
scheduled_days
due_at
last_reviewed_at
review_count
lapse_count
state
created_at
updated_at
```

### `state`

```text
new
learning
review
relearning
```

## 19. `review_history`

```text
id
user_id
flashcard_id
rating
response_time_ms
was_correct
previous_due_at
next_due_at
reviewed_at
```

### `rating`

```text
again
hard
good
easy
```

## 20. `mistakes`

```text
id
user_id
entry_id
flashcard_id
mistake_type
user_answer
correct_answer
times_missed
last_missed_at
resolved
created_at
updated_at
```

## 21. `study_sessions`

```text
id
user_id
session_type
started_at
ended_at
total_cards
correct_answers
incorrect_answers
duration_seconds
created_at
```

### `session_type`

```text
flashcard
quiz
writing
listening
shadowing
mixed
```

## 22. `study_session_items`

```text
id
study_session_id
entry_id
flashcard_id
question_type
user_answer
correct_answer
is_correct
response_time_ms
```

## 23. `ai_conversations`

```text
id
user_id
title
created_at
updated_at
```

## 24. `ai_messages`

```text
id
conversation_id
role
content
metadata_json
created_at
```

### `role`

```text
user
assistant
system
```

## 25. `user_settings`

```text
user_id
theme
language
default_view
preferred_accent
daily_new_limit
daily_review_goal
enable_audio
enable_keyboard_shortcuts
enabled_card_types
created_at
updated_at
```

Örn:

```json
[
  "en_to_tr",
  "tr_to_en",
  "cloze",
  "listening",
  "translation"
]
```

## 26. `notifications`

İleride:

```text
id
user_id
type
title
message
is_read
created_at
```

## 27. Soft Delete

Entry direkt silinmez.

```text
deleted_at
```

ile 30 günlük çöp kutusu desteği.

## 28. Duplicate Detection

Kontrol:

```sql
SELECT *
FROM entries
WHERE user_id = ?
AND normalized_expression = 'figure out'
AND deleted_at IS NULL;
```

## 29. AI İşlem Pipeline

1. Frontend raw input gönderir.
2. Backend satırları ayırır.
3. Normalize eder.
4. Duplicate kontrolü yapar.
5. AI'ya batch gönderir.
6. AI strict JSON döndürür.
7. Backend validate eder.
8. Preview gösterilir.
9. Kullanıcı Kaydet der.
10. Database transaction ile kaydedilir.

## 30. AI Strict Output Schema

```json
{
  "items": [
    {
      "expression": "figure out",
      "normalized_expression": "figure out",
      "type": "phrasal_verb",
      "cefr_level": "B1",
      "english_explanation": "To understand or solve something after thinking about it.",
      "pronunciation": {
        "ipa": "/ˈfɪɡər aʊt/",
        "readable": "figır aut"
      },
      "meanings": [
        {
          "meaning_tr": "anlamak",
          "primary": true,
          "usage_note": "Bir kişi veya durum hakkında anlam çıkarmak."
        },
        {
          "meaning_tr": "çözmek",
          "primary": false,
          "usage_note": "Bir problem veya sorunu çözmek."
        },
        {
          "meaning_tr": "bir yolunu bulmak",
          "primary": false,
          "usage_note": "Bir şeyi nasıl yapacağını bulmak."
        }
      ],
      "examples": [
        {
          "sentence_en": "I finally figured out the problem.",
          "translation_tr": "Sonunda problemi çözdüm.",
          "level": "B1"
        },
        {
          "sentence_en": "Can you figure out how this works?",
          "translation_tr": "Bunun nasıl çalıştığını anlayabilir misin?",
          "level": "B1"
        }
      ],
      "similar_expressions": [
        {
          "expression": "work out",
          "meaning_tr": "çözmek / anlamak",
          "relationship": "related"
        },
        {
          "expression": "find out",
          "meaning_tr": "öğrenmek / keşfetmek",
          "relationship": "related"
        }
      ],
      "detected_pattern": null,
      "original_sentence": null,
      "confidence": 0.94,
      "warnings": []
    }
  ]
}
```

## 31. Confidence

AI her analiz için güven skoru döndürebilir.

```json
"confidence": 0.94
```

Düşükse warning:

```json
"warnings": [
  "This expression may have multiple context-dependent meanings."
]
```

## 32. Detected Pattern

Örn:

```text
I didn't mean to upset you.
```

AI:

```json
{
  "detected_pattern": {
    "pattern": "mean to + verb",
    "meaning_tr": "bir şeyi yapmayı kastetmek",
    "example": "I didn't mean to hurt you."
  }
}
```

## 33. Orijinal Input

Kullanıcının yazdığı tam cümle korunmalı.

AI ana ifadeyi ayrıca çıkarabilir ama orijinal input kaybolmamalı.

## 34. Level Rule

Profil:

```text
current_level = B1
```

ise prompt:

> Generate examples primarily at CEFR B1 level. Avoid unnecessary advanced vocabulary.

## 35. AI'nin Yapmaması Gerekenler

- Gereksiz uzun açıklama
- Akademik sözlük dili
- Mekanik/literal çeviri
- Aynı örneğin varyasyonları
- Kullanıcı seviyesinden gereksiz zor örnekler
- Uydurma kullanım

## 36. Natural Translation

Örn:

`What's the point?`

Literal:

> Nokta nedir?

Yanlış.

Doğal:

> Bunun ne anlamı var?

## 37. AI Örnek Prensibi

Kötü:

```text
I figure out the issue.
I figure out the problem.
I figure out the question.
```

İyi:

```text
I finally figured out the problem.
I can't figure him out.
We'll figure something out.
```

## 38. Similar Expressions

Benzer ifade yanında fark tutulabilir.

Örn:

```json
{
  "expression": "find out",
  "difference": "Usually means discovering new information."
}
```

## 39. Audio

Base64 database'e kaydedilmemeli.

Tercih:

- on-demand TTS
- gerekirse audio cache

## 40. AI Caching

Aynı normalize edilmiş ifade tekrar işlendiğinde gereksiz AI çağrısı yapılmamalı.

Manuel kullanıcı düzenlemesi her zaman öncelikli.

## 41. `ai_jobs`

Toplu processing için:

```text
id
user_id
status
total_items
processed_items
failed_items
input_json
started_at
completed_at
created_at
```

### `status`

```text
queued
processing
completed
partial
failed
```

## 42. `ai_job_items`

```text
id
job_id
raw_input
normalized_input
status
result_json
error_message
```

## 43. Dashboard Aggregates

İleride:

```text
daily_stats
```

Alanlar:

```text
user_id
date
added_count
reviewed_count
learned_count
correct_count
incorrect_count
study_minutes
```

## 44. RLS

Supabase için her kullanıcı yalnızca kendi verisini görebilmeli.

Temel kural:

```text
user_id = auth.uid()
```

## 45. Index'ler

Önerilen:

```text
entries(user_id, normalized_expression)
entries(user_id, created_at)
entries(user_id, learning_status)
review_state(user_id, due_at)
review_history(user_id, reviewed_at)
deck_entries(deck_id, entry_id)
entry_tags(tag_id, entry_id)
```

## 46. Search

İlk sürüm:

`ILIKE`

İleride:

**PostgreSQL pg_trgm**

## 47. V1 Tabloları

```text
profiles
entries
entry_meanings
entry_examples
similar_expressions
entry_sources
decks
deck_entries
tags
entry_tags
flashcards
review_state
review_history
mistakes
study_sessions
ai_jobs
ai_job_items
ai_conversations
ai_messages
user_settings
```

## 48. Daha Sonraya Bırakılabilecekler

```text
notifications
achievements
daily_stats
subscriptions
public_decks
followers
social_activity
```
