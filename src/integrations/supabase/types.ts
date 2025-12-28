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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      board_connections: {
        Row: {
          created_at: string
          from_element_id: string
          id: string
          to_element_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_element_id: string
          id?: string
          to_element_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_element_id?: string
          id?: string
          to_element_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_connections_from_element_id_fkey"
            columns: ["from_element_id"]
            isOneToOne: false
            referencedRelation: "dashboard_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_connections_to_element_id_fkey"
            columns: ["to_element_id"]
            isOneToOne: false
            referencedRelation: "dashboard_elements"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_elements: {
        Row: {
          board_id: string | null
          color: string
          content: string
          created_at: string
          height: number
          id: string
          position_x: number
          position_y: number
          section_key: string
          section_title: string
          updated_at: string
          user_id: string
          width: number
        }
        Insert: {
          board_id?: string | null
          color?: string
          content: string
          created_at?: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          section_key: string
          section_title: string
          updated_at?: string
          user_id: string
          width?: number
        }
        Update: {
          board_id?: string | null
          color?: string
          content?: string
          created_at?: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          section_key?: string
          section_title?: string
          updated_at?: string
          user_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_elements_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_submission_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["dev_submission_status"]
          notes: string | null
          old_status:
            | Database["public"]["Enums"]["dev_submission_status"]
            | null
          submission_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["dev_submission_status"]
          notes?: string | null
          old_status?:
            | Database["public"]["Enums"]["dev_submission_status"]
            | null
          submission_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["dev_submission_status"]
          notes?: string | null
          old_status?:
            | Database["public"]["Enums"]["dev_submission_status"]
            | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_submission_status_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "dev_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_submissions: {
        Row: {
          additional_requirements: string | null
          assigned_to: string | null
          cicd_platform: string | null
          completed_at: string | null
          created_at: string
          custom_domain: string | null
          enable_cicd: boolean
          enable_monitoring: boolean
          enable_ssl: boolean
          enable_testing: boolean
          environment_type: string | null
          estimated_completion: string | null
          github_option: string
          github_repo_url: string | null
          github_username: string
          hosting_notes: string | null
          hosting_platform: Database["public"]["Enums"]["hosting_platform"]
          id: string
          priority: string | null
          project_description: string | null
          project_id: string | null
          project_name: string
          selected_scope: Json
          started_at: string | null
          status: Database["public"]["Enums"]["dev_submission_status"]
          status_notes: string | null
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_requirements?: string | null
          assigned_to?: string | null
          cicd_platform?: string | null
          completed_at?: string | null
          created_at?: string
          custom_domain?: string | null
          enable_cicd?: boolean
          enable_monitoring?: boolean
          enable_ssl?: boolean
          enable_testing?: boolean
          environment_type?: string | null
          estimated_completion?: string | null
          github_option: string
          github_repo_url?: string | null
          github_username: string
          hosting_notes?: string | null
          hosting_platform: Database["public"]["Enums"]["hosting_platform"]
          id?: string
          priority?: string | null
          project_description?: string | null
          project_id?: string | null
          project_name: string
          selected_scope?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["dev_submission_status"]
          status_notes?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_requirements?: string | null
          assigned_to?: string | null
          cicd_platform?: string | null
          completed_at?: string | null
          created_at?: string
          custom_domain?: string | null
          enable_cicd?: boolean
          enable_monitoring?: boolean
          enable_ssl?: boolean
          enable_testing?: boolean
          environment_type?: string | null
          estimated_completion?: string | null
          github_option?: string
          github_repo_url?: string | null
          github_username?: string
          hosting_notes?: string | null
          hosting_platform?: Database["public"]["Enums"]["hosting_platform"]
          id?: string
          priority?: string | null
          project_description?: string | null
          project_id?: string | null
          project_name?: string
          selected_scope?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["dev_submission_status"]
          status_notes?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          canvas_data: Json | null
          created_at: string
          id: string
          key_problem: string | null
          last_accessed_at: string | null
          name: string
          persona: string | null
          product_idea: string | null
          progress: Json | null
          target_audience: string | null
          updated_at: string
          user_id: string
          validated_blocks: string[] | null
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          key_problem?: string | null
          last_accessed_at?: string | null
          name?: string
          persona?: string | null
          product_idea?: string | null
          progress?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
          validated_blocks?: string[] | null
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          key_problem?: string | null
          last_accessed_at?: string | null
          name?: string
          persona?: string | null
          product_idea?: string | null
          progress?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
          validated_blocks?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_by_domain: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      dev_submission_status:
        | "submitted"
        | "review"
        | "development"
        | "testing"
        | "deployment"
        | "completed"
        | "on_hold"
        | "cancelled"
      hosting_platform:
        | "vercel"
        | "netlify"
        | "aws"
        | "azure"
        | "gcp"
        | "digitalocean"
        | "docker"
        | "kubernetes"
        | "custom_server"
        | "other"
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
    Enums: {
      app_role: ["admin", "user"],
      dev_submission_status: [
        "submitted",
        "review",
        "development",
        "testing",
        "deployment",
        "completed",
        "on_hold",
        "cancelled",
      ],
      hosting_platform: [
        "vercel",
        "netlify",
        "aws",
        "azure",
        "gcp",
        "digitalocean",
        "docker",
        "kubernetes",
        "custom_server",
        "other",
      ],
    },
  },
} as const
