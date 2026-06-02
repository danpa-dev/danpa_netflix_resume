import { useContext } from 'react';
import { VideoPreferencesContext } from '../contexts/videoPreferences';

const useVideoPreferences = () => {
  const context = useContext(VideoPreferencesContext);
  if (!context) {
    throw new Error(
      'useVideoPreferences must be used within VideoPreferencesProvider'
    );
  }
  return context;
};

export default useVideoPreferences;
