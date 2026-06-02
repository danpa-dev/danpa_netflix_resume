import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import VideoPreferencesProvider from '../src/contexts/VideoPreferencesProvider';
import useVideoPreferences from '../src/hooks/useVideoPreferences';

const PreferenceControl = () => {
  const { isMuted, setIsMuted } = useVideoPreferences();

  return (
    <button type="button" onClick={() => setIsMuted(!isMuted)}>
      {isMuted ? 'Unmute video' : 'Mute video'}
    </button>
  );
};

const SequentialPlayerHarness = () => {
  const [instance, setInstance] = useState(1);

  return (
    <>
      <span>Player {instance}</span>
      <PreferenceControl key={instance} />
      <button type="button" onClick={() => setInstance(current => current + 1)}>
        Open next card
      </button>
    </>
  );
};

describe('VideoPreferencesProvider', () => {
  it('starts muted and carries an unmute choice to later player instances', () => {
    render(
      <VideoPreferencesProvider>
        <SequentialPlayerHarness />
      </VideoPreferencesProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Unmute video' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open next card' }));

    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mute video' })
    ).toBeInTheDocument();
  });
});
