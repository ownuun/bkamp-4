// Marathon Types
export interface Marathon {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  date: string;
  registration_opens_at: string;
  registration_closes_at: string | null;
  location: string | null;
  distance_options: string[];
  official_url: string | null;
  registration_url: string | null;
  image_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  push_subscription: PushSubscriptionJSON | null;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  marathon_id: string;
  created_at: string;
}

export interface AlertSettings {
  id: string;
  user_id: string;
  marathon_id: string;
  alert_10min: boolean;
  alert_5min: boolean;
  alert_1min: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledAlert {
  id: string;
  user_id: string;
  marathon_id: string;
  alert_type: "10min" | "5min" | "1min";
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
}

// Extended types for UI
export interface MarathonWithStatus extends Marathon {
  isFavorite?: boolean;
  alertSettings?: AlertSettings | null;
  registrationStatus: "upcoming" | "open" | "closed";
  daysUntilRegistration: number | null;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      marathons: {
        Row: Marathon;
        Insert: Omit<Marathon, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Marathon, "id" | "created_at" | "updated_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, "id" | "created_at">;
        Update: never;
      };
      alert_settings: {
        Row: AlertSettings;
        Insert: Omit<AlertSettings, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<AlertSettings, "id" | "user_id" | "marathon_id" | "created_at" | "updated_at">
        >;
      };
      scheduled_alerts: {
        Row: ScheduledAlert;
        Insert: Omit<ScheduledAlert, "id" | "created_at">;
        Update: Partial<
          Omit<ScheduledAlert, "id" | "user_id" | "marathon_id" | "created_at">
        >;
      };
    };
  };
};
