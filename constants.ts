import { MoodConfig } from './types';

export const MOODS: MoodConfig[] = [
  { name: 'Happy', growth: 10, color: 'bg-yellow-400', emoji: '😊' },
  { name: 'Calm', growth: 8, color: 'bg-blue-300', emoji: '😌' },
  { name: 'Anxious', growth: 6, color: 'bg-orange-300', emoji: '😰' },
  { name: 'Sad', growth: 4, color: 'bg-indigo-300', emoji: '😢' },
  { name: 'Angry', growth: 2, color: 'bg-red-400', emoji: '😠' },
];

export const SEEDS = [
  'Sunflower', 'Rose', 'Tulip', 'Daisy', 'Lily', 'Lavender', 'Orchid', 'Jasmine'
];

export const MAX_GROWTH = 70;

export const GROWTH_STAGES = {
  GERMINATED: 1, // > 0
  SMALL: 10,     // > 10
  MEDIUM: 30,    // > 30
  FLOWERING: 45, // > 45
  BUTTERFLY: 60  // > 60
};

export const POSITIVE_MSG = "Good Day! Write your mood journal now!";
export const SUPPORT_MSG = "You should take good care of yourself! Write your mood journal now!";