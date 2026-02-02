export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          timezone: string
          preferred_platform: 'garmin' | 'strava'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          timezone?: string
          preferred_platform?: 'garmin' | 'strava'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          timezone?: string
          preferred_platform?: 'garmin' | 'strava'
          updated_at?: string
        }
      }
      platform_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'garmin' | 'strava'
          tokens_encrypted: string
          iv: string
          expires_at: string | null
          status: 'active' | 'expired' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'garmin' | 'strava'
          tokens_encrypted: string
          iv: string
          expires_at?: string | null
          status?: 'active' | 'expired' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'garmin' | 'strava'
          tokens_encrypted?: string
          iv?: string
          expires_at?: string | null
          status?: 'active' | 'expired' | 'error'
          updated_at?: string
        }
      }
      training_configs: {
        Row: {
          user_id: string
          goal_category: 'race' | 'non_race'
          goal_type: string
          goal_date: string | null
          goal_time_minutes: number | null
          goal_target: string | null
          custom_distance_miles: number | null
          target_weekly_mileage: number | null
          current_weekly_mileage: number
          experience_level: 'beginner' | 'intermediate' | 'advanced'
          preferred_long_run_day: 'saturday' | 'sunday'
          email_day: string
          email_time: string
          email_enabled: boolean
          intensity_preference: 'conservative' | 'normal' | 'aggressive'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          goal_category: 'race' | 'non_race'
          goal_type: string
          goal_date?: string | null
          goal_time_minutes?: number | null
          goal_target?: string | null
          custom_distance_miles?: number | null
          target_weekly_mileage?: number | null
          current_weekly_mileage?: number
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          preferred_long_run_day?: 'saturday' | 'sunday'
          email_day?: string
          email_time?: string
          email_enabled?: boolean
          intensity_preference?: 'conservative' | 'normal' | 'aggressive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          goal_category?: 'race' | 'non_race'
          goal_type?: string
          goal_date?: string | null
          goal_time_minutes?: number | null
          goal_target?: string | null
          custom_distance_miles?: number | null
          target_weekly_mileage?: number | null
          current_weekly_mileage?: number
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          preferred_long_run_day?: 'saturday' | 'sunday'
          email_day?: string
          email_time?: string
          email_enabled?: boolean
          intensity_preference?: 'conservative' | 'normal' | 'aggressive'
          updated_at?: string
        }
      }
      email_history: {
        Row: {
          id: string
          user_id: string
          platform: 'garmin' | 'strava'
          sent_at: string
          status: 'sent' | 'failed'
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'garmin' | 'strava'
          sent_at?: string
          status?: 'sent' | 'failed'
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'garmin' | 'strava'
          sent_at?: string
          status?: 'sent' | 'failed'
          error_message?: string | null
        }
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
  }
}

// Helper types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type PlatformConnection = Database['public']['Tables']['platform_connections']['Row']
export type TrainingConfig = Database['public']['Tables']['training_configs']['Row']
export type EmailHistory = Database['public']['Tables']['email_history']['Row']

// Plan modification type (not in auto-generated schema yet)
export interface PlanModification {
  id: string
  user_id: string
  week_start_date: string
  original_mileage: number
  adjusted_mileage: number
  recovery_adjustment: number
  concerns: string[]
  phase: string
  created_at: string
}
