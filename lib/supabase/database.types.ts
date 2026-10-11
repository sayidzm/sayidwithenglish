export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ForeignKey<Name extends string, Column extends string, Target extends string> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Target;
  referencedColumns: ["id"];
};
type Table<Row, Insert, Update = Partial<Insert>, Relationships extends readonly object[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type Timestamps = { created_at: string; updated_at: string };
type EntryRow = Timestamps & {
  id: string;
  user_id: string;
  expression: string;
  normalized_expression: string;
  entry_type: string;
  cefr_level: string | null;
  english_explanation: string | null;
  pronunciation_ipa: string | null;
  pronunciation_readable: string | null;
  is_favorite: boolean;
  is_difficult: boolean;
  is_mastered: boolean;
  learning_status: string;
  original_input: string | null;
  user_note: string | null;
  image_url: string | null;
  ai_generated: boolean;
  ai_version: string | null;
  ai_metadata: Json;
  deleted_at: string | null;
};
type EntryInsert = Pick<EntryRow, "expression" | "entry_type"> &
  Partial<Omit<EntryRow, "expression" | "entry_type" | "normalized_expression">>;
type Owned = { id: string; user_id: string; created_at: string };
type LearningFlashcard = Owned & {
  entry_id: string; card_type: string; front_data: Json; back_data: Json;
  is_enabled: boolean; updated_at: string;
};
type ReviewState = Owned & {
  flashcard_id: string; stability: number; difficulty: number;
  scheduled_days: number; elapsed_days: number; learning_steps: number;
  due_at: string; last_reviewed_at: string | null; review_count: number;
  lapse_count: number; state: string; updated_at: string;
};
type Child<Row extends { id: string; entry_id: string }, Name extends string> = Table<
  Row,
  Pick<Row, "entry_id"> & Partial<Omit<Row, "id" | "entry_id">>,
  Partial<Omit<Row, "id" | "entry_id" | "created_at" | "updated_at">>,
  [ForeignKey<Name, "entry_id", "entries">]
>;

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      learning_preferences: Table<
        { user_id: string; enabled_card_types: string[]; updated_at: string },
        { user_id?: string; enabled_card_types?: string[] },
        { enabled_card_types?: string[] }
      >;
      flashcards: Table<
        LearningFlashcard,
        Pick<LearningFlashcard, "entry_id" | "card_type" | "front_data" | "back_data"> &
          Partial<Pick<LearningFlashcard, "user_id" | "is_enabled">>,
        Partial<Pick<LearningFlashcard, "front_data" | "back_data" | "is_enabled">>,
        [ForeignKey<"flashcards_entry_id_fkey", "entry_id", "entries">]
      >;
      review_state: Table<
        ReviewState,
        { flashcard_id: string; user_id?: string } & Partial<Omit<ReviewState, "id" | "flashcard_id" | "user_id" | "created_at" | "updated_at">>,
        Partial<Omit<ReviewState, "id" | "flashcard_id" | "user_id" | "created_at" | "updated_at">>,
        [ForeignKey<"review_state_flashcard_id_fkey", "flashcard_id", "flashcards">]
      >;
      review_history: Table<
        { id: string; user_id: string; flashcard_id: string; rating: string; response_time_ms: number | null;
          was_correct: boolean; previous_due_at: string | null; next_due_at: string;
          reviewed_at: string },
        { flashcard_id: string; rating: string; was_correct: boolean; next_due_at: string;
          user_id?: string; response_time_ms?: number | null; previous_due_at?: string | null;
          reviewed_at?: string },
        never,
        [ForeignKey<"review_history_flashcard_id_fkey", "flashcard_id", "flashcards">]
      >;
      mistakes: Table<
        Owned & { entry_id: string; flashcard_id: string; mistake_type: string;
          user_answer: string | null; correct_answer: string | null;
          times_missed: number; last_missed_at: string; resolved: boolean;
          updated_at: string },
        { entry_id: string; flashcard_id: string; mistake_type: string; user_id?: string;
          user_answer?: string | null; correct_answer?: string | null },
        { user_answer?: string | null; correct_answer?: string | null;
          times_missed?: number; last_missed_at?: string; resolved?: boolean },
        [ForeignKey<"mistakes_entry_id_fkey", "entry_id", "entries">,
          ForeignKey<"mistakes_flashcard_id_fkey", "flashcard_id", "flashcards">]
      >;
      study_sessions: Table<
        Owned & { session_type: string; started_at: string; ended_at: string | null;
          total_cards: number; correct_answers: number; incorrect_answers: number;
          duration_seconds: number | null },
        { session_type: string; user_id?: string },
        { ended_at?: string | null; total_cards?: number; correct_answers?: number;
          incorrect_answers?: number; duration_seconds?: number | null }
      >;
      study_session_items: Table<
        Owned & { study_session_id: string; entry_id: string; flashcard_id: string | null;
          question_type: string; user_answer: string | null; correct_answer: string | null;
          is_correct: boolean; response_time_ms: number | null },
        { study_session_id: string; entry_id: string; question_type: string; is_correct: boolean;
          flashcard_id?: string | null; user_id?: string; user_answer?: string | null;
          correct_answer?: string | null; response_time_ms?: number | null },
        never,
        [ForeignKey<"study_session_items_study_session_id_fkey", "study_session_id", "study_sessions">,
          ForeignKey<"study_session_items_entry_id_fkey", "entry_id", "entries">]
      >;
      ai_jobs: Table<
        Owned & { status: string; total_items: number; processed_items: number;
          failed_items: number; input_json: Json; started_at: string | null;
          completed_at: string | null },
        { total_items: number; input_json: Json; user_id?: string;
          status?: string; processed_items?: number; failed_items?: number;
          started_at?: string | null; completed_at?: string | null },
        { status?: string; processed_items?: number; failed_items?: number;
          started_at?: string | null; completed_at?: string | null }
      >;
      ai_job_items: Table<
        Owned & { job_id: string; raw_input: string; normalized_input: string;
          status: string; result_json: Json | null; error_message: string | null;
          updated_at: string },
        { job_id: string; raw_input: string; normalized_input: string;
          user_id?: string; status?: string; result_json?: Json | null;
          error_message?: string | null },
        { status?: string; result_json?: Json | null; error_message?: string | null },
        [ForeignKey<"ai_job_items_job_id_fkey", "job_id", "ai_jobs">]
      >;
      ai_usage: Table<
        Owned & { model: string; request_type: string; input_tokens: number | null;
          output_tokens: number | null },
        { model: string; request_type: string; input_tokens?: number | null;
          output_tokens?: number | null; user_id?: string },
        never
      >;
      entries: Table<
        EntryRow,
        EntryInsert,
        Partial<Omit<EntryInsert, "id" | "user_id" | "created_at" | "updated_at">>
      >;
      entry_meanings: Child<
        Timestamps & {
          id: string;
          entry_id: string;
          meaning_tr: string;
          meaning_order: number;
          usage_note: string | null;
          is_primary: boolean;
        },
        "entry_meanings_entry_id_fkey"
      >;
      entry_examples: Child<
        Timestamps & {
          id: string;
          entry_id: string;
          sentence_en: string;
          translation_tr: string;
          example_order: number;
          difficulty_level: string | null;
          source_type: string | null;
          is_user_added: boolean;
        },
        "entry_examples_entry_id_fkey"
      >;
      similar_expressions: Child<
        Timestamps & {
          id: string;
          entry_id: string;
          expression: string;
          turkish_meaning: string | null;
          relationship_type: string;
          usage_difference: string | null;
        },
        "similar_expressions_entry_id_fkey"
      >;
      entry_sources: Child<
        Timestamps & {
          id: string;
          entry_id: string;
          source_type: string;
          source_name: string | null;
          series_name: string | null;
          season_number: number | null;
          episode_number: number | null;
          source_url: string | null;
          source_sentence: string | null;
        },
        "entry_sources_entry_id_fkey"
      >;
      decks: Table<
        Timestamps & {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          is_archived: boolean;
        },
        { name: string; user_id?: string; description?: string | null; icon?: string | null; color?: string | null; is_archived?: boolean }
      >;
      deck_entries: Table<
        { id: string; deck_id: string; entry_id: string; created_at: string },
        { deck_id: string; entry_id: string },
        never,
        [
          ForeignKey<"deck_entries_deck_id_fkey", "deck_id", "decks">,
          ForeignKey<"deck_entries_entry_id_fkey", "entry_id", "entries">,
        ]
      >;
      tags: Table<
        Timestamps & { id: string; user_id: string; name: string },
        { name: string; user_id?: string }
      >;
      entry_tags: Table<
        { entry_id: string; tag_id: string },
        { entry_id: string; tag_id: string },
        never,
        [
          ForeignKey<"entry_tags_entry_id_fkey", "entry_id", "entries">,
          ForeignKey<"entry_tags_tag_id_fkey", "tag_id", "tags">,
        ]
      >;
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_level: string;
          daily_new_card_limit: number;
          daily_review_goal: number;
          display_name: string;
          id: string;
          learning_language: string;
          native_language: string;
          preferred_accent: string;
          target_level: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_level?: string;
          daily_new_card_limit?: number;
          daily_review_goal?: number;
          display_name?: string;
          id?: string;
          learning_language?: string;
          native_language?: string;
          preferred_accent?: string;
          target_level?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_level?: string;
          daily_new_card_limit?: number;
          daily_review_goal?: number;
          display_name?: string;
          id?: string;
          learning_language?: string;
          native_language?: string;
          preferred_accent?: string;
          target_level?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      commit_review: {
        Args: {
          p_flashcard_id: string; p_rating: string; p_expected_count: number;
          p_due_at: string; p_stability: number; p_difficulty: number;
          p_scheduled_days: number; p_elapsed_days: number; p_learning_steps: number;
          p_state: string; p_lapse_count: number; p_response_time_ms: number | null;
          p_session_id?: string | null; p_user_answer?: string | null;
          p_correct_answer?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
