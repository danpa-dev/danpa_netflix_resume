import { renderHook, act } from '@testing-library/react';
import useModal from '../src/hooks/useModal';

describe('useModal', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isClosing).toBe(false);
  });

  it('can start open', () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('opens and updates body style', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes and restores body style', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isClosing).toBe(true);
    expect(document.body.style.overflow).toBe('');

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isClosing).toBe(false);
    vi.useRealTimers();
  });

  it('toggles state', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    // isClosing starts; wait for timeout
    expect(result.current.isClosing).toBe(true);
  });

  it('tracks trigger position', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.triggerPosition).toBeNull();

    act(() => {
      result.current.setTriggerPosition({ x: 100, y: 200, width: 300, height: 150 });
    });

    expect(result.current.triggerPosition).toEqual({ x: 100, y: 200, width: 300, height: 150 });
  });

  it('tracks animation state', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isAnimating).toBe(false);

    act(() => {
      result.current.setIsAnimating(true);
    });

    expect(result.current.isAnimating).toBe(true);
  });
});
