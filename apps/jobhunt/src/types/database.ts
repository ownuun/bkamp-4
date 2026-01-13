export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          file_name: string;
          parsed_data: Json | null;
          skills: string[] | null;
          experience_years: number | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          file_name: string;
          parsed_data?: Json | null;
          skills?: string[] | null;
          experience_years?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_url?: string;
          file_name?: string;
          parsed_data?: Json | null;
          skills?: string[] | null;
          experience_years?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      job_preferences: {
        Row: {
          id: string;
          user_id: string;
          desired_roles: string[] | null;
          desired_salary_min: number | null;
          desired_salary_max: number | null;
          salary_type: string | null;
          work_types: string[] | null;
          contract_types: string[] | null;
          preferred_locations: string[] | null;
          platforms: string[] | null;
          min_fit_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          desired_roles?: string[] | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          salary_type?: string | null;
          work_types?: string[] | null;
          contract_types?: string[] | null;
          preferred_locations?: string[] | null;
          platforms?: string[] | null;
          min_fit_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          desired_roles?: string[] | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          salary_type?: string | null;
          work_types?: string[] | null;
          contract_types?: string[] | null;
          preferred_locations?: string[] | null;
          platforms?: string[] | null;
          min_fit_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_postings: {
        Row: {
          id: string;
          platform: string;
          external_id: string;
          title: string;
          company_name: string | null;
          description: string | null;
          requirements: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_type: string | null;
          work_type: string | null;
          contract_type: string | null;
          location: string | null;
          skills_required: string[] | null;
          experience_required: number | null;
          deadline_at: string | null;
          external_url: string;
          raw_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          external_id: string;
          title: string;
          company_name?: string | null;
          description?: string | null;
          requirements?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_type?: string | null;
          work_type?: string | null;
          contract_type?: string | null;
          location?: string | null;
          skills_required?: string[] | null;
          experience_required?: number | null;
          deadline_at?: string | null;
          external_url: string;
          raw_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          external_id?: string;
          title?: string;
          company_name?: string | null;
          description?: string | null;
          requirements?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_type?: string | null;
          work_type?: string | null;
          contract_type?: string | null;
          location?: string | null;
          skills_required?: string[] | null;
          experience_required?: number | null;
          deadline_at?: string | null;
          external_url?: string;
          raw_data?: Json | null;
          created_at?: string;
        };
      };
      job_matches: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          fit_score: number;
          fit_reasons: Json | null;
          fit_explanation: string | null;
          status: string;
          notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          fit_score: number;
          fit_reasons?: Json | null;
          fit_explanation?: string | null;
          status?: string;
          notified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          fit_score?: number;
          fit_reasons?: Json | null;
          fit_explanation?: string | null;
          status?: string;
          notified_at?: string | null;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          match_id: string | null;
          resume_id: string | null;
          cover_letter: string | null;
          status: string;
          applied_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          match_id?: string | null;
          resume_id?: string | null;
          cover_letter?: string | null;
          status?: string;
          applied_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          match_id?: string | null;
          resume_id?: string | null;
          cover_letter?: string | null;
          status?: string;
          applied_at?: string;
          notes?: string | null;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          push_enabled: boolean;
          frequency: string;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          push_enabled?: boolean;
          frequency?: string;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_enabled?: boolean;
          push_enabled?: boolean;
          frequency?: string;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Resume = Database['public']['Tables']['resumes']['Row'];
export type JobPreference = Database['public']['Tables']['job_preferences']['Row'];
export type JobPosting = Database['public']['Tables']['job_postings']['Row'];
export type JobMatch = Database['public']['Tables']['job_matches']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type NotificationSetting = Database['public']['Tables']['notification_settings']['Row'];
