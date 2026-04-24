export type Theme = 'light' | 'dark'
export type Language = 'ko' | 'en'

export interface SettingsResponse {
  user_id: string;
  theme: Theme;
  language: Language;
  updated_at: string;
}

export interface UpdateSettingDto {
  theme?: Theme;
  language?: Language;
}