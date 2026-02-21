// React Custom Hook for Content Management
// Provides loading states, error handling, and caching for content data

import { useState, useEffect, useCallback } from 'react';
import type { IContent, ContentItem } from '../types/content';
import {
  loadContent,
  getWorkExperience,
  getEducation,
  getSkills,
  getPersonalProjects,
  getVolunteerWork,
  getContentById,
  searchContent,
  filterContent,
  getSections,
  getContentStats,
  formatContentForDisplay
} from '../utils/contentLoader';
import type { ContentLoadResult } from '../utils/contentLoader';

// Hook state interface
export interface UseContentState {
  content: IContent | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
  stats: ReturnType<typeof getContentStats> | null;
  lastUpdated: string | null;
}

// Hook return interface
export interface UseContentReturn extends UseContentState {
  // Content getters
  getWorkExperience: () => ReturnType<typeof getWorkExperience>;
  getEducation: () => ReturnType<typeof getEducation>;
  getSkills: () => ReturnType<typeof getSkills>;
  getPersonalProjects: () => ReturnType<typeof getPersonalProjects>;
  getVolunteerWork: () => ReturnType<typeof getVolunteerWork>;
  getContentById: (id: string) => ContentItem | undefined;
  getSections: () => ReturnType<typeof getSections>;

  // Search and filter
  searchContent: (searchTerm: string, caseSensitive?: boolean) => ContentItem[];
  filterContent: (filters: Parameters<typeof filterContent>[1]) => ContentItem[];

  // Actions
  refresh: () => Promise<void>;
  clearError: () => void;

  // Utilities
  getStats: () => ReturnType<typeof getContentStats> | null;
  getFormattedContent: () => ReturnType<typeof formatContentForDisplay> | null;
}

/**
 * Custom hook for content management
 * @param autoLoad - Whether to automatically load content on mount
 * @returns UseContentReturn object with content state and utilities
 */
export const useContent = (autoLoad: boolean = true): UseContentReturn => {
  const [state, setState] = useState<UseContentState>({
    content: null,
    loading: false,
    error: null,
    isValid: false,
    stats: null,
    lastUpdated: null
  });

  // Load content function
  const loadContentData = useCallback(async (forceRefresh: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result: ContentLoadResult = await loadContent(forceRefresh);

      if (result.success && result.data) {
        const stats = getContentStats(result.data);
        const formatted = formatContentForDisplay(result.data);

        setState({
          content: result.data,
          loading: false,
          error: null,
          isValid: formatted.isValid,
          stats,
          lastUpdated: result.data.metadata.lastUpdated
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to load content'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  // Auto-load content on mount
  useEffect(() => {
    if (autoLoad) {
      loadContentData();
    }
  }, [autoLoad, loadContentData]);

  const { content } = state;

  return {
    ...state,

    // Content getters
    getWorkExperience: () => content ? getWorkExperience(content) : [],
    getEducation: () => content ? getEducation(content) : [],
    getSkills: () => content ? getSkills(content) : [],
    getPersonalProjects: () => content ? getPersonalProjects(content) : [],
    getVolunteerWork: () => content ? getVolunteerWork(content) : [],
    getContentById: (id: string) => content ? getContentById(content, id) : undefined,
    getSections: () => content ? getSections(content) : [],

    // Search and filter
    searchContent: (searchTerm: string, caseSensitive: boolean = false) =>
      content ? searchContent(content, searchTerm, caseSensitive) : [],
    filterContent: (filters: Parameters<typeof filterContent>[1]) =>
      content ? filterContent(content, filters) : [],

    // Actions
    refresh: () => loadContentData(true),
    clearError: () => setState(prev => ({ ...prev, error: null })),

    // Utilities
    getStats: () => state.stats,
    getFormattedContent: () => content ? formatContentForDisplay(content) : null
  };
};
