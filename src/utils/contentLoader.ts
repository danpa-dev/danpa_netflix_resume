// Content Loading and Parsing Utilities
// Provides robust content loading with caching, validation, and error handling

// Browser-compatible content loading
import type { 
  IContent, 
  IWorkExperience, 
  IEducation, 
  ISkill, 
  IPersonalProject, 
  IVolunteerWork, 
  ContentItem,
  IContentManifest,
  IContentSectionConfig,
  ISectionContent,
  ContentSectionType
} from '../types/content';
import { validateContent, getValidationSummary } from './contentValidation';
import type { ValidationResult } from './contentValidation';
import manifestData from '../data/manifest.json';

// Content loading result interface
export interface ContentLoadResult {
  success: boolean;
  data?: IContent;
  error?: string;
  validationResult?: ValidationResult;
}

// Cache for loaded content
let contentCache: IContent | null = null;
let lastLoadTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Content loading error types
export const ContentLoadError = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ContentLoadErrorType = typeof ContentLoadError[keyof typeof ContentLoadError];

// Error messages for different error types
const ERROR_MESSAGES = {
  [ContentLoadError.FILE_NOT_FOUND]: 'Content file not found. Please ensure manifest and section files exist in the data directory.',
  [ContentLoadError.JSON_PARSE_ERROR]: 'Failed to parse content JSON. Please check the JSON syntax.',
  [ContentLoadError.VALIDATION_ERROR]: 'Content validation failed. Please check the content structure.',
  [ContentLoadError.UNKNOWN_ERROR]: 'An unknown error occurred while loading content.'
};

const sectionModules = import.meta.glob('../data/*.json');

/**
 * Load content from the JSON file with caching and validation
 * @param forceRefresh - Force reload even if cache is valid
 * @returns Promise<ContentLoadResult>
 */
export const loadContent = async (forceRefresh: boolean = false): Promise<ContentLoadResult> => {
  try {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && contentCache && (Date.now() - lastLoadTime) < CACHE_DURATION) {
      return {
        success: true,
        data: contentCache
      };
    }

    // Load manifest to determine sections and order
    const manifest = manifestData as IContentManifest;
    const sectionsConfig = manifest.sections || [];

    const sectionDataById = new Map<string, ISectionContent<ContentItem>>();
    const workExperience: IWorkExperience[] = [];
    const education: IEducation[] = [];
    const skills: ISkill[] = [];
    const personalProjects: IPersonalProject[] = [];
    const volunteerWork: IVolunteerWork[] = [];

    for (const section of sectionsConfig) {
      if (!section.enabled) continue;

      const modulePath = `../data/${section.path}`;
      const loader = sectionModules[modulePath];
      if (!loader) {
        return {
          success: false,
          error: ERROR_MESSAGES[ContentLoadError.FILE_NOT_FOUND]
        };
      }

      const sectionModule = (await loader()) as { default: ISectionContent<ContentItem> };
      const sectionContent = sectionModule.default;
      sectionDataById.set(section.id, sectionContent);

      switch (section.type) {
        case 'workExperience':
          workExperience.push(...(sectionContent.items as IWorkExperience[]));
          break;
        case 'education':
          education.push(...(sectionContent.items as IEducation[]));
          break;
        case 'skills':
          skills.push(...(sectionContent.items as ISkill[]));
          break;
        case 'personalProjects':
          personalProjects.push(...(sectionContent.items as IPersonalProject[]));
          break;
        case 'volunteerWork':
          volunteerWork.push(...(sectionContent.items as IVolunteerWork[]));
          break;
        default:
          break;
      }
    }

    const metadataSourceId = manifest.metadataSource || sectionsConfig.find(s => s.enabled)?.id;
    const metadataSource = metadataSourceId ? sectionDataById.get(metadataSourceId) : undefined;
    if (!metadataSource) {
      return {
        success: false,
        error: ERROR_MESSAGES[ContentLoadError.FILE_NOT_FOUND]
      };
    }

    const rawContent: IContent = {
      workExperience,
      education,
      skills,
      personalProjects,
      volunteerWork,
      metadata: {
        ...metadataSource.metadata,
        totalItems: {
          workExperience: workExperience.length,
          education: education.length,
          skills: skills.length,
          personalProjects: personalProjects.length,
          volunteerWork: volunteerWork.length
        }
      },
      sectionsConfig
    };

    // Validate the content structure
    const validationResult = validateContent(rawContent);

    if (!validationResult.isValid) {
      return {
        success: false,
        error: ERROR_MESSAGES[ContentLoadError.VALIDATION_ERROR],
        validationResult
      };
    }

    // Apply defaults for convenience (e.g., global video URLs)
    const withDefaults = { ...rawContent } as IContent;
    const d = withDefaults.metadata?.defaults;
    if (d) {
      // Global thumbnail default
      const defaultThumb = d.thumbnailUrl;

      // Backfill default video/poster across all top-level content items
      withDefaults.personalProjects = withDefaults.personalProjects.map(pp => ({
        ...pp,
        videoUrl: pp.videoUrl || d.videoUrlMp4,
        thumbnailUrl: pp.thumbnailUrl || defaultThumb || pp.thumbnailUrl
      }));
      withDefaults.workExperience = withDefaults.workExperience.map(we => ({
        ...we,
        videoUrl: we.videoUrl || d.videoUrlMp4,
        thumbnailUrl: we.thumbnailUrl || defaultThumb || we.thumbnailUrl
      }));
      withDefaults.education = withDefaults.education.map(ed => ({
        ...ed,
        videoUrl: ed.videoUrl || d.videoUrlMp4,
        thumbnailUrl: ed.thumbnailUrl || defaultThumb || ed.thumbnailUrl
      }));
      withDefaults.skills = withDefaults.skills.map(sk => ({
        ...sk,
        videoUrl: sk.videoUrl || d.videoUrlMp4,
        thumbnailUrl: sk.thumbnailUrl || defaultThumb || sk.thumbnailUrl
      }));
      withDefaults.volunteerWork = withDefaults.volunteerWork.map(vw => ({
        ...vw,
        videoUrl: vw.videoUrl || d.videoUrlMp4,
        thumbnailUrl: vw.thumbnailUrl || defaultThumb || vw.thumbnailUrl
      }));
    }

    // Cache the validated content
    contentCache = withDefaults;
    lastLoadTime = Date.now();

    return {
      success: true,
      data: withDefaults
    };

  } catch (error) {
    console.error('Error loading content:', error);

    // Determine error type and message
    let errorMessage = ERROR_MESSAGES[ContentLoadError.UNKNOWN_ERROR];

    if (error instanceof Error) {
      if (error.message.includes('Cannot find module')) {
        errorMessage = ERROR_MESSAGES[ContentLoadError.FILE_NOT_FOUND];
      } else if (error.message.includes('JSON')) {
        errorMessage = ERROR_MESSAGES[ContentLoadError.JSON_PARSE_ERROR];
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get content by type with proper typing
 * @param content - The loaded content
 * @param type - The content type to extract
 * @returns Array of the specified content type
 */
export const getContentByType = <T extends ContentItem>(
  content: IContent,
  type: ContentSectionType
): T[] => {
  return content[type] as T[];
};

export interface ContentSectionView extends IContentSectionConfig {
  items: ContentItem[];
}

export const getSections = (content: IContent): ContentSectionView[] => {
  const configs = content.sectionsConfig || [];
  return configs.map(config => ({
    ...config,
    items: getContentByType(content, config.type)
  }));
};

/**
 * Get work experience items
 * @param content - The loaded content
 * @returns Array of work experience items
 */
export const getWorkExperience = (content: IContent): IWorkExperience[] => {
  return getContentByType<IWorkExperience>(content, 'workExperience');
};

/**
 * Get education items
 * @param content - The loaded content
 * @returns Array of education items
 */
export const getEducation = (content: IContent): IEducation[] => {
  return getContentByType<IEducation>(content, 'education');
};

/**
 * Get skills
 * @param content - The loaded content
 * @returns Array of skills
 */
export const getSkills = (content: IContent): ISkill[] => {
  return getContentByType<ISkill>(content, 'skills');
};

/**
 * Get personal projects
 * @param content - The loaded content
 * @returns Array of personal projects
 */
export const getPersonalProjects = (content: IContent): IPersonalProject[] => {
  return getContentByType<IPersonalProject>(content, 'personalProjects');
};

/**
 * Get volunteer work
 * @param content - The loaded content
 * @returns Array of volunteer work
 */
export const getVolunteerWork = (content: IContent): IVolunteerWork[] => {
  return content.volunteerWork || [];
};

/**
 * Get content by ID across all content types
 * @param content - The loaded content
 * @param id - The ID to search for
 * @returns The content item if found, undefined otherwise
 */
export const getContentById = (content: IContent, id: string): ContentItem | undefined => {
  const allContent = [
    ...content.workExperience,
    ...content.education,
    ...content.skills,
    ...content.personalProjects,
    ...content.volunteerWork
  ];

  return allContent.find(item => item.id === id);
};

/**
 * Search content by title or description
 * @param content - The loaded content
 * @param searchTerm - The search term
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of matching content items
 */
export const searchContent = (
  content: IContent,
  searchTerm: string,
  caseSensitive: boolean = false
): ContentItem[] => {
  const allContent = [
    ...content.workExperience,
    ...content.education,
    ...content.skills,
    ...content.personalProjects,
    ...content.volunteerWork
  ];

  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  return allContent.filter(item => {
    const title = caseSensitive ? item.title : item.title.toLowerCase();
    const description = caseSensitive ? item.description : item.description.toLowerCase();

    return title.includes(term) || description.includes(term);
  });
};

/**
 * Filter content by various criteria
 * @param content - The loaded content
 * @param filters - Filter criteria
 * @returns Array of filtered content items
 */
export const filterContent = (
  content: IContent,
  filters: {
    type?: ContentSectionType;
    isCurrent?: boolean;
    technologies?: string[];
    dateRange?: { start: string; end: string };
  }
): ContentItem[] => {
  let filteredContent: ContentItem[] = [];

  // Filter by type
  if (filters.type) {
    filteredContent = getContentByType(content, filters.type);
  } else {
    filteredContent = [
      ...content.workExperience,
      ...content.education,
      ...content.skills,
      ...content.personalProjects,
      ...content.volunteerWork
    ];
  }

  // Filter by current status
  if (filters.isCurrent !== undefined) {
    filteredContent = filteredContent.filter(item => {
      if ('isCurrent' in item) {
        return item.isCurrent === filters.isCurrent;
      }
      return true;
    });
  }

  // Filter by technologies
  if (filters.technologies && filters.technologies.length > 0) {
    filteredContent = filteredContent.filter(item => {
      if ('technologies' in item && Array.isArray(item.technologies)) {
        return filters.technologies!.some(tech => 
          item.technologies.includes(tech)
        );
      }
      return false;
    });
  }

  // Filter by date range
  if (filters.dateRange) {
    filteredContent = filteredContent.filter(item => {
      if ('startDate' in item) {
        const startDate = new Date(item.startDate);
        const filterStart = new Date(filters.dateRange!.start);
        const filterEnd = new Date(filters.dateRange!.end);
        
        return startDate >= filterStart && startDate <= filterEnd;
      }
      return true;
    });
  }

  return filteredContent;
};

/**
 * Refresh content cache (development utility)
 * @returns Promise<ContentLoadResult>
 */
export const refreshContent = async (): Promise<ContentLoadResult> => {
  // Clear cache
  contentCache = null;
  lastLoadTime = 0;

  // Reload content
  return await loadContent(true);
};

/**
 * Get content statistics
 * @param content - The loaded content
 * @returns Object with content statistics
 */
export const getContentStats = (content: IContent) => {
  return {
    totalItems: {
      workExperience: content.workExperience.length,
      education: content.education.length,
      skills: content.skills.length,
      personalProjects: content.personalProjects.length,
      volunteerWork: content.volunteerWork.length
    },
    totalContentItems: 
      content.workExperience.length + 
      content.education.length + 
      content.skills.length + 
      content.personalProjects.length +
      content.volunteerWork.length,
    currentPositions: content.workExperience.filter(we => we.isCurrent).length,
    activeProjects: content.personalProjects.filter(pp => pp.isActive).length,
    lastUpdated: content.metadata.lastUpdated,
    version: content.metadata.version
  };
};

/**
 * Validate and format content for display
 * @param content - The loaded content
 * @returns Formatted content with validation status
 */
export const formatContentForDisplay = (content: IContent) => {
  const validationResult = validateContent(content);
  
  return {
    content,
    isValid: validationResult.isValid,
    validationSummary: getValidationSummary(validationResult),
    stats: getContentStats(content),
    errors: validationResult.errors
  };
};

/**
 * Get content metadata
 * @param content - The loaded content
 * @returns Content metadata
 */
export const getContentMetadata = (content: IContent) => {
  return content.metadata;
};

/**
 * Check if content cache is valid
 * @returns boolean indicating if cache is still valid
 */
export const isCacheValid = (): boolean => {
  return contentCache !== null && (Date.now() - lastLoadTime) < CACHE_DURATION;
};

/**
 * Clear content cache
 */
export const clearCache = (): void => {
  contentCache = null;
  lastLoadTime = 0;
};

/**
 * Get cache information
 * @returns Object with cache status information
 */
export const getCacheInfo = () => {
  return {
    hasCache: contentCache !== null,
    lastLoadTime: new Date(lastLoadTime).toISOString(),
    cacheAge: Date.now() - lastLoadTime,
    isValid: isCacheValid(),
    cacheDuration: CACHE_DURATION
  };
};

 
