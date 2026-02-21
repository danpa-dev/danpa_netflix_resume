import { renderHook, waitFor } from '@testing-library/react';
import { useContent } from '../src/hooks/useContent';

describe('useContent', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useContent());
    expect(result.current.loading).toBe(true);
    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads content successfully', async () => {
    const { result } = renderHook(() => useContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('provides section getters that return arrays', async () => {
    const { result } = renderHook(() => useContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.getWorkExperience())).toBe(true);
    expect(Array.isArray(result.current.getEducation())).toBe(true);
    expect(Array.isArray(result.current.getSkills())).toBe(true);
    expect(Array.isArray(result.current.getPersonalProjects())).toBe(true);
    expect(Array.isArray(result.current.getSections())).toBe(true);
  });

  it('returns empty arrays before content loads', () => {
    const { result } = renderHook(() => useContent(false));
    expect(result.current.getWorkExperience()).toEqual([]);
    expect(result.current.getEducation()).toEqual([]);
    expect(result.current.getSkills()).toEqual([]);
    expect(result.current.getPersonalProjects()).toEqual([]);
  });

  it('provides stats after loading', async () => {
    const { result } = renderHook(() => useContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats = result.current.getStats();
    expect(stats).not.toBeNull();
    expect(stats).toHaveProperty('totalItems');
  });

  it('can look up content by id', async () => {
    const { result } = renderHook(() => useContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const workItems = result.current.getWorkExperience();
    if (workItems.length > 0) {
      const found = result.current.getContentById(workItems[0].id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(workItems[0].id);
    }
  });

  it('returns undefined for non-existent id', async () => {
    const { result } = renderHook(() => useContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getContentById('non-existent-id')).toBeUndefined();
  });
});
