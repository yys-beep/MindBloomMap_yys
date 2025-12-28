
export type PlantStage = 'seed' | 'germinated' | 'small' | 'medium' | 'flowering' | 'butterfly';

export type ViewType = 'garden' | 'diary' | 'house' | 'map';

export interface PlantData {
  id: string;
  seedType: string;
  growth: number; // 0 to 100+
  weekStartDate: string; // ISO String
  isArchived: boolean;
}

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
}

export interface AppState {
  hasWateredToday: boolean;
  lastWateredDate: string | null;
  currentPlant: PlantData | null;
  selectedSeed: string | null;
  lastMood: MoodType | null;
}

export type MoodType = 'Happy' | 'Calm' | 'Anxious' | 'Sad' | 'Angry';

export interface MoodConfig {
  name: MoodType;
  growth: number;
  color: string;
  emoji: string;
}
