// Database Types for Jansori

export type ToneType = 'friend' | 'mom' | 'teacher' | 'coach' | 'tsundere' | 'cold';
export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type CategoryType = 'study' | 'exercise' | 'habit' | 'self_dev' | 'etc';
export type DeliveryStatus = 'sent' | 'delivered' | 'failed';
export type UserResponse = 'done' | 'snooze' | 'skip';

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: CategoryType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NaggingSetting {
  id: string;
  goal_id: string;
  user_id: string;
  tone: ToneType;
  frequency: FrequencyType;
  custom_days: number[] | null;
  time_slots: string[];
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NaggingHistory {
  id: string;
  user_id: string;
  goal_id: string;
  message: string;
  tone: ToneType;
  sent_at: string;
  delivery_status: DeliveryStatus;
  user_response: UserResponse | null;
  responded_at: string | null;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateGoalRequest {
  title: string;
  situation?: string;
  category: CategoryType;
}

export interface UpdateNaggingSettingsRequest {
  tone: ToneType;
  frequency: FrequencyType;
  custom_days?: number[];
  time_slots: string[];
  is_enabled: boolean;
}

export interface PreviewNaggingRequest {
  goal_id: string;
  tone: ToneType;
}

export interface PreviewNaggingResponse {
  message: string;
  tone: ToneType;
  goal_title: string;
}

// Goal with settings joined
export interface GoalWithSettings extends Goal {
  nagging_settings: NaggingSetting | null;
}

// Tone display info
export interface ToneInfo {
  id: ToneType;
  name: string;
  emoji: string;
  description: string;
  example: string;
}

export const TONE_INFO: Record<ToneType, ToneInfo> = {
  cold: {
    id: 'cold',
    name: '냉정한',
    emoji: '🧊',
    description: '듣기 싫은 진실을 직설적으로 말하는 톤',
    example: '핑계 그만 대. 안 하고 있잖아. 그게 현실이야.',
  },
  friend: {
    id: 'friend',
    name: '친구',
    emoji: '👫',
    description: '편하고 유머러스한 반말 톤',
    example: '야~ 오늘도 안 했지? ㅋㅋ 빨리 해라~',
  },
  mom: {
    id: 'mom',
    name: '엄마',
    emoji: '👩',
    description: '따뜻하고 걱정 가득한 톤',
    example: '우리 아들~ 공부했어? 힘내!',
  },
  teacher: {
    id: 'teacher',
    name: '선생님',
    emoji: '👨‍🏫',
    description: '단호하지만 격려하는 톤',
    example: '오늘 학습 진행하셨나요? 꾸준함이 성공의 비결입니다.',
  },
  coach: {
    id: 'coach',
    name: '코치',
    emoji: '💪',
    description: '열정적인 동기부여 톤',
    example: '당신은 할 수 있습니다! 지금 시작하세요!',
  },
  tsundere: {
    id: 'tsundere',
    name: '츤데레',
    emoji: '😤',
    description: '겉으로는 쿨하지만 속은 따뜻한 톤',
    example: '별로 신경 안 쓰는데... 그래도 오늘 안 하면 안 되잖아.',
  },
};

// Category display info
export interface CategoryInfo {
  id: CategoryType;
  name: string;
  emoji: string;
}

export const CATEGORY_INFO: Record<CategoryType, CategoryInfo> = {
  study: { id: 'study', name: '공부', emoji: '📚' },
  exercise: { id: 'exercise', name: '운동', emoji: '🏃' },
  habit: { id: 'habit', name: '습관', emoji: '✨' },
  self_dev: { id: 'self_dev', name: '자기계발', emoji: '📈' },
  etc: { id: 'etc', name: '기타', emoji: '📝' },
};
