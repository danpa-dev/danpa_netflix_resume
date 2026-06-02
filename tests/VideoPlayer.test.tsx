import { act, fireEvent, render, screen } from '@testing-library/react';
import VideoPlayer from '../src/components/VideoPlayer';
import VideoPreferencesProvider from '../src/contexts/VideoPreferencesProvider';

const renderPlayer = (key?: string, autoPlay = true) =>
  render(
    <VideoPreferencesProvider>
      <VideoPlayer key={key} srcMp4="/clip.mp4" autoPlay={autoPlay} />
    </VideoPreferencesProvider>
  );

describe('VideoPlayer', () => {
  let paused = true;
  let play: ReturnType<typeof vi.fn>;
  let pause: ReturnType<typeof vi.fn>;
  let load: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    paused = true;
    play = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      paused = false;
      fireEvent.play(this);
      return Promise.resolve();
    });
    pause = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      paused = true;
      fireEvent.pause(this);
    });
    load = vi.fn();

    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(
      () => paused
    );
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const flushAutoplay = async () => {
    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
  };

  it('autoplays on mount', async () => {
    renderPlayer();

    await flushAutoplay();

    expect(load).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('toggles local playback and fades transient feedback after one second', async () => {
    const { container } = renderPlayer();
    await flushAutoplay();

    const surface = screen.getByRole('button', { name: 'Pause video' });
    fireEvent.click(surface);

    expect(pause).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.video-playback-feedback')).toBeVisible();

    act(() => vi.advanceTimersByTime(1000));
    expect(
      container.querySelector('.video-playback-feedback')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play video' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(play).toHaveBeenCalledTimes(2);
    expect(container.querySelector('.video-playback-feedback')).toBeVisible();
  });

  it('does not toggle playback when mute is clicked', async () => {
    renderPlayer();
    await flushAutoplay();

    fireEvent.click(screen.getByRole('button', { name: 'Unmute video' }));
    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(pause).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('autoplays a newly mounted player after the prior player was paused', async () => {
    const first = renderPlayer('first');
    await flushAutoplay();
    fireEvent.click(screen.getByRole('button', { name: 'Pause video' }));
    first.unmount();

    renderPlayer('second');
    await flushAutoplay();

    expect(play).toHaveBeenCalledTimes(2);
  });

  it('keeps a visible recovery control when autoplay is blocked', async () => {
    play.mockRejectedValueOnce(new Error('Autoplay blocked'));
    renderPlayer();

    await flushAutoplay();

    expect(document.querySelector('.video-recovery-play')).toBeVisible();
  });

  it('keeps a visible recovery control when autoplay is disabled', () => {
    renderPlayer(undefined, false);

    expect(document.querySelector('.video-recovery-play')).toBeVisible();
  });
});
