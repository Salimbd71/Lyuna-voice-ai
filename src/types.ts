export type VoiceId = 'male' | 'female' | 'cute_girl' | 'deep';
export type EmotionId = 'normal' | 'happy' | 'sad' | 'angry' | 'excited';
export type LanguageMode = 'bn' | 'en';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  bengaliName: string;
  gender: 'Male' | 'Female';
  persona: string;
  description: string;
  avatarBg: string;
  accent: string;
  tag: string;
}

export interface EmotionOption {
  id: EmotionId;
  label: string;
  bengaliLabel: string;
  description: string;
  emoji: string;
  badgeClass: string;
}

export interface GeneratedVoiceRecord {
  id: string;
  originalText: string;
  spokenText: string;
  bengaliText?: string;
  voiceId: VoiceId;
  voiceName: string;
  emotionId: EmotionId;
  speed: number;
  pitch: number;
  language: LanguageMode;
  audioUrl: string;
  duration?: number;
  timestamp: number;
}

export interface GenerationSettings {
  voiceId: VoiceId;
  emotionId: EmotionId;
  speed: number;
  pitch: number;
  language: LanguageMode;
  autoTranslate: boolean;
}
