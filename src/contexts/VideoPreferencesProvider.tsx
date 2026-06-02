import { useMemo, useState, type PropsWithChildren } from 'react';
import { VideoPreferencesContext } from './videoPreferences';

const VideoPreferencesProvider = ({ children }: PropsWithChildren) => {
  const [isMuted, setIsMuted] = useState(true);
  const value = useMemo(() => ({ isMuted, setIsMuted }), [isMuted]);

  return (
    <VideoPreferencesContext.Provider value={value}>
      {children}
    </VideoPreferencesContext.Provider>
  );
};

export default VideoPreferencesProvider;
