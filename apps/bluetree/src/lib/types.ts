export interface Story {
  id: string;
  nickname: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export interface Walk {
  id: string;
  title: string;
  description: string | null;
  location: string;
  scheduled_at: string;
  max_participants: number;
  created_at: string;
}

export interface WalkParticipant {
  id: string;
  walk_id: string;
  nickname: string;
  contact: string | null;
  created_at: string;
}
