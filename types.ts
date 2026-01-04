
export interface MorphState {
  color: string;
  roughness: number;
  metalness: number;
  distort: number;
  speed: number;
  scale: number;
  name: string;
  environment: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
}

export interface DesignSuggestion {
  name: string;
  description: string;
  palette: string[];
  specs: {
    distort: number;
    roughness: number;
    speed: number;
  };
}

export enum UI_MODE {
  VIEWER = 'VIEWER',
  CUSTOMIZE = 'CUSTOMIZE',
  AI_GEN = 'AI_GEN'
}
