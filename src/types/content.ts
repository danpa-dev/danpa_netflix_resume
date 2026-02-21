// Content Type Definitions for Netflix-Style Resume
// Based on PRD specifications for work experience, education, skills, and personal projects

/** Lightweight season representation used by UI components */
export interface SeasonLite {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  videoUrl?: string;
}

// Const assertions for consistent categorization
export const SkillCategory = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DATABASE: 'database',
  DEVOPS: 'devops',
  TOOLS: 'tools',
  LANGUAGES: 'languages',
  FRAMEWORKS: 'frameworks',
  LIBRARIES: 'libraries',
  TESTING: 'testing',
  OTHER: 'other'
} as const;

export const SkillProficiency = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
} as const;

export const ContentType = {
  WORK_EXPERIENCE: 'workExperience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PERSONAL_PROJECTS: 'personalProjects',
  VOLUNTEER_WORK: 'volunteerWork'
} as const;

export type SkillCategoryType = typeof SkillCategory[keyof typeof SkillCategory];
export type SkillProficiencyType = typeof SkillProficiency[keyof typeof SkillProficiency];
export type ContentTypeType = typeof ContentType[keyof typeof ContentType];
export type ContentSectionType = ContentTypeType;

export interface IModalFieldConfig {
  key: string;
  label?: string;
}

export interface ISectionModalConfig {
  heading?: string;
  fields: IModalFieldConfig[];
}

export interface IContentSectionConfig {
  id: string;
  type: ContentSectionType;
  title: string;
  enabled: boolean;
  path: string;
  modal?: ISectionModalConfig;
}

export interface IContentManifest {
  version: string;
  metadataSource?: string;
  sections: IContentSectionConfig[];
}

export interface ISectionContent<T> {
  metadata: IContentMetadata;
  items: T[];
}

// Base interface for common fields
export interface BaseContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

// Season interface for work experience projects
export interface ISeason {
  id: string;
  title: string;
  description: string;
  episodes: IEpisode[];
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // Optional for ongoing projects
  videoUrl?: string; // Optional video for the season
  technologies: string[];
  achievements: string[];
}

// Episode interface for individual project components
export interface IEpisode {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 months", "6 weeks"
  videoUrl?: string;
  technologies: string[];
  achievements: string[];
  impact: string; // Quantified impact description
}

// Work Experience interface
export interface IWorkExperience extends BaseContent {
  company: string;
  role: string;
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // Optional for current positions
  location: string;
  technologies: string[];
  achievements: string[];
  seasons: ISeason[];
  companyLogo?: string;
  companyUrl?: string;
  isCurrent: boolean;
}

// Education interface
export interface IEducation extends BaseContent {
  institution: string;
  degree: string;
  field: string;
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // Optional for ongoing education
  location: string;
  gpa?: string;
  relevantCoursework: string[];
  projects: IEducationProject[];
  institutionLogo?: string;
  institutionUrl?: string;
  isCurrent: boolean;
}

// Education project interface
export interface IEducationProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
}

// Skill interface
export interface ISkill extends BaseContent {
  name: string;
  category: SkillCategoryType;
  proficiency: SkillProficiencyType;
  yearsOfExperience: number;
  technologies: string[]; // Related technologies
  recentProjects: string[]; // Recent projects using this skill
  certifications?: string[];
  skillLevel: number; // 1-10 scale for visual representation
}

// Personal Project interface
export interface IPersonalProject extends BaseContent {
  technologies: string[];
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // Optional for ongoing projects
  githubUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
  features: string[];
  challenges: string[];
  solutions: string[];
  impact: string;
  isActive: boolean;
  collaborators?: string[];
}

// Volunteer Work interface
export interface IVolunteerWork extends BaseContent {
  organization: string;
  role: string;
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // Optional for ongoing volunteer work
  location: string;
  hoursPerWeek: number;
  technologies: string[];
  achievements: string[];
  impact: string;
  isActive: boolean;
  skills: string[]; // Soft skills developed through volunteering
}

// Main content interface containing all content arrays
export interface IContent {
  workExperience: IWorkExperience[];
  education: IEducation[];
  skills: ISkill[];
  personalProjects: IPersonalProject[];
  volunteerWork: IVolunteerWork[];
  metadata: IContentMetadata;
  sectionsConfig?: IContentSectionConfig[];
}

// Content metadata for versioning and management
export interface IContentMetadata {
  version: string;
  lastUpdated: string; // ISO date string
  author: string;
  // Optional resume download configuration
  resume?: {
    // Local public path served by the app (e.g., "/DanParkResume.pdf")
    localPath?: string;
    // Public CDN/S3 URL (e.g., CloudFront URL)
    s3Url?: string;
    // Optional file name hint for the browser download attribute
    fileName?: string;
  };
  defaults?: {
    videoUrlMp4?: string;
    videoUrlWebm?: string;
    videoPosterUrl?: string; // poster for videos if per-item missing
    thumbnailUrl?: string;   // global card thumbnail (applies to all items when set)
    hero?: {
      imageUrl?: string;
      videoUrlMp4?: string;
      videoUrlWebm?: string;
      posterUrl?: string;
    };
  };
  totalItems: {
    workExperience: number;
    education: number;
    skills: number;
    personalProjects: number;
    volunteerWork: number;
  };
}

// Utility types for filtering and searching
export type ContentItem = IWorkExperience | IEducation | ISkill | IPersonalProject | IVolunteerWork;

export interface ContentFilters {
  category?: SkillCategoryType;
  proficiency?: SkillProficiencyType;
  dateRange?: {
    start: string;
    end: string;
  };
  technologies?: string[];
  isCurrent?: boolean;
}

// Type guards for runtime type checking
export const isWorkExperience = (item: ContentItem): item is IWorkExperience => {
  return 'company' in item && 'role' in item && 'seasons' in item;
};

export const isEducation = (item: ContentItem): item is IEducation => {
  return 'institution' in item && 'degree' in item && 'field' in item;
};

export const isSkill = (item: ContentItem): item is ISkill => {
  return 'category' in item && 'proficiency' in item && 'yearsOfExperience' in item;
};

export const isPersonalProject = (item: ContentItem): item is IPersonalProject => {
  return 'technologies' in item && 'features' in item && 'isActive' in item;
};

export const isVolunteerWork = (item: ContentItem): item is IVolunteerWork => {
  return 'organization' in item && 'role' in item && 'hoursPerWeek' in item;
};

// All interfaces and types are already exported above 
