export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_attendance: {
        Row: {
          absence_reason: string | null
          created_at: string
          created_by: string | null
          daily_achievement: string | null
          date: string
          id: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          absence_reason?: string | null
          created_at?: string
          created_by?: string | null
          daily_achievement?: string | null
          date: string
          id?: string
          notes?: string | null
          status: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          absence_reason?: string | null
          created_at?: string
          created_by?: string | null
          daily_achievement?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          attendance_id: string | null
          attendance_status_snapshot: string | null
          call_number_snapshot: string | null
          created_at: string
          created_by: string | null
          daily_achievement_snapshot: string | null
          extra_data: Json
          id: string
          level_snapshot: string | null
          logo_snapshot: string | null
          madrasa_address_snapshot: string | null
          madrasa_name_snapshot: string | null
          notes_snapshot: string | null
          pdf_path: string | null
          pdf_url: string | null
          phone_snapshot: string | null
          report_date: string
          report_title: string
          report_type: string
          status: string
          student_id: string | null
          student_name_snapshot: string | null
          supervisor_name_snapshot: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attendance_id?: string | null
          attendance_status_snapshot?: string | null
          call_number_snapshot?: string | null
          created_at?: string
          created_by?: string | null
          daily_achievement_snapshot?: string | null
          extra_data?: Json
          id?: string
          level_snapshot?: string | null
          logo_snapshot?: string | null
          madrasa_address_snapshot?: string | null
          madrasa_name_snapshot?: string | null
          notes_snapshot?: string | null
          pdf_path?: string | null
          pdf_url?: string | null
          phone_snapshot?: string | null
          report_date: string
          report_title: string
          report_type: string
          status?: string
          student_id?: string | null
          student_name_snapshot?: string | null
          supervisor_name_snapshot?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attendance_id?: string | null
          attendance_status_snapshot?: string | null
          call_number_snapshot?: string | null
          created_at?: string
          created_by?: string | null
          daily_achievement_snapshot?: string | null
          extra_data?: Json
          id?: string
          level_snapshot?: string | null
          logo_snapshot?: string | null
          madrasa_address_snapshot?: string | null
          madrasa_name_snapshot?: string | null
          notes_snapshot?: string | null
          pdf_path?: string | null
          pdf_url?: string | null
          phone_snapshot?: string | null
          report_date?: string
          report_title?: string
          report_type?: string
          status?: string
          student_id?: string | null
          student_name_snapshot?: string | null
          supervisor_name_snapshot?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      madrasa_settings: {
        Row: {
          address: string
          dark_mode_default: boolean
          date_format: string
          default_report_title: string
          email: string | null
          extra_info: string | null
          id: number
          logo_url: string | null
          madrasa_name: string
          phone: string | null
          show_address: boolean
          show_logo: boolean
          show_phone: boolean
          show_supervisor: boolean
          signature_text: string
          supervisor_name: string
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string
          dark_mode_default?: boolean
          date_format?: string
          default_report_title?: string
          email?: string | null
          extra_info?: string | null
          id?: number
          logo_url?: string | null
          madrasa_name?: string
          phone?: string | null
          show_address?: boolean
          show_logo?: boolean
          show_phone?: boolean
          show_supervisor?: boolean
          signature_text?: string
          supervisor_name?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string
          dark_mode_default?: boolean
          date_format?: string
          default_report_title?: string
          email?: string | null
          extra_info?: string | null
          id?: number
          logo_url?: string | null
          madrasa_name?: string
          phone?: string | null
          show_address?: boolean
          show_logo?: boolean
          show_phone?: boolean
          show_supervisor?: boolean
          signature_text?: string
          supervisor_name?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_default: boolean
          name: string
          report_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          report_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          report_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string | null
          call_number: string
          created_at: string
          created_by: string | null
          enrollment_date: string
          full_name: string
          guardian_name: string | null
          id: string
          level: string | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          birth_date?: string | null
          call_number: string
          created_at?: string
          created_by?: string | null
          enrollment_date?: string
          full_name: string
          guardian_name?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          birth_date?: string | null
          call_number?: string
          created_at?: string
          created_by?: string | null
          enrollment_date?: string
          full_name?: string
          guardian_name?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_staff: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
