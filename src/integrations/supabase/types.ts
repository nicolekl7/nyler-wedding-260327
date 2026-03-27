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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      guests: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          max_guests: number
          party_name: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          max_guests?: number
          party_name: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          max_guests?: number
          party_name?: string
        }
        Relationships: []
      }
      invited_guests: {
        Row: {
          created_at: string
          dietary_restrictions: string | null
          first_name: string
          group_id: string
          has_responded: boolean
          id: string
          last_name: string
          notes: string | null
          pool_day_rsvp: string | null
          room_preference: string | null
          submitted_at: string | null
          wedding_day_rsvp: string | null
          welcome_party_rsvp: string | null
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string | null
          first_name: string
          group_id?: string
          has_responded?: boolean
          id?: string
          last_name: string
          notes?: string | null
          pool_day_rsvp?: string | null
          room_preference?: string | null
          submitted_at?: string | null
          wedding_day_rsvp?: string | null
          welcome_party_rsvp?: string | null
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string | null
          first_name?: string
          group_id?: string
          has_responded?: boolean
          id?: string
          last_name?: string
          notes?: string | null
          pool_day_rsvp?: string | null
          room_preference?: string | null
          submitted_at?: string | null
          wedding_day_rsvp?: string | null
          welcome_party_rsvp?: string | null
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          created_at: string
          email: string
          guest_names: string
          has_children: boolean
          id: string
          room_category_id: string
        }
        Insert: {
          created_at?: string
          email: string
          guest_names: string
          has_children?: boolean
          id?: string
          room_category_id: string
        }
        Update: {
          created_at?: string
          email?: string
          guest_names?: string
          has_children?: boolean
          id?: string
          room_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_room_category_id_fkey"
            columns: ["room_category_id"]
            isOneToOne: false
            referencedRelation: "room_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      room_categories: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          inventory_count: number
          name: string
          price: number
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          inventory_count?: number
          name: string
          price: number
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          inventory_count?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          is_available: boolean
          name: string
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name: string
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name?: string
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          email: string
          id: string
          names: string
          response: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          names: string
          response: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          names?: string
          response?: string
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
