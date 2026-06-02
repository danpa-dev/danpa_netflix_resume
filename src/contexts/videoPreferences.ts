import { createContext } from 'react';

export interface VideoPreferences {
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
}

export const VideoPreferencesContext = createContext<
  VideoPreferences | undefined
>(undefined);
