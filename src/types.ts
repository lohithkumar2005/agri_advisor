export type Language = 'en' | 'hi' | 'te' | 'ta';

export interface User {
  name: string;
  email: string;
  phone: string;
  password?: string;
  fieldType: 'Dry Land' | 'Wet Land' | 'Mixed';
  landArea: string;
  profilePic?: string;
}

export interface DiseaseResult {
  disease: string;
  description: string;
  pestName: string;
  quantity: string;
  coverage: string;
  duration: string;
  safetyTip: string;
  recommendations: string[];
}
