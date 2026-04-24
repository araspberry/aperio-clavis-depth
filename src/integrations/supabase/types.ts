export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          id: string
          reference: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reference: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reference?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          reference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reference: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayers: {
        Row: {
          answered_date: string | null
          answered_text: string | null
          category: string
          created_at: string
          for_whom: string | null
          id: string
          scripture: string | null
          status: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answered_date?: string | null
          answered_text?: string | null
          category?: string
          created_at?: string
          for_whom?: string | null
          id?: string
          scripture?: string | null
          status?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answered_date?: string | null
          answered_text?: string | null
          category?: string
          created_at?: string
          for_whom?: string | null
          id?: string
          scripture?: string | null
          status?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          clavis_sessions: number | null
          clavis_tone: string | null
          country: string | null
          created_at: string
          daily_minutes: number | null
          denomination: string | null
          dob: string | null
          first_name: string | null
          gender: string | null
          id: string
          journey: string | null
          last_name: string | null
          last_read_book: string | null
          last_read_chapter: number | null
          last_read_date: string | null
          longest_streak: number | null
          member_since: string
          minutes_today: number | null
          onboarded: boolean | null
          profession: string | null
          reasons: string[] | null
          set_daily_goal: boolean | null
          state: string | null
          streak: number | null
          topics: string[] | null
          total_days: number | null
          translation: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          clavis_sessions?: number | null
          clavis_tone?: string | null
          country?: string | null
          created_at?: string
          daily_minutes?: number | null
          denomination?: string | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          journey?: string | null
          last_name?: string | null
          last_read_book?: string | null
          last_read_chapter?: number | null
          last_read_date?: string | null
          longest_streak?: number | null
          member_since?: string
          minutes_today?: number | null
          onboarded?: boolean | null
          profession?: string | null
          reasons?: string[] | null
          set_daily_goal?: boolean | null
          state?: string | null
          streak?: number | null
          topics?: string[] | null
          total_days?: number | null
          translation?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          clavis_sessions?: number | null
          clavis_tone?: string | null
          country?: string | null
          created_at?: string
          daily_minutes?: number | null
          denomination?: string | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          journey?: string | null
          last_name?: string | null
          last_read_book?: string | null
          last_read_chapter?: number | null
          last_read_date?: string | null
          longest_streak?: number | null
          member_since?: string
          minutes_today?: number | null
          onboarded?: boolean | null
          profession?: string | null
          reasons?: string[] | null
          set_daily_goal?: boolean | null
          state?: string | null
          streak?: number | null
          topics?: string[] | null
          total_days?: number | null
          translation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
