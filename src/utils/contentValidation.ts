// Content Validation Utility Functions
// Provides robust validation for all content types to ensure data integrity

import type { 
  IContent, 
  IWorkExperience, 
  IEducation, 
  ISkill, 
  IPersonalProject,
  IVolunteerWork,
  ISeason,
  IEpisode,
  IEducationProject
} from '../types/content';
import { SkillCategory, SkillProficiency } from '../types/content';

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Helper validation functions
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidDateRange = (startDate: string, endDate?: string): boolean => {
  if (!isValidDate(startDate)) return false;
  if (endDate && !isValidDate(endDate)) return false;
  if (endDate && new Date(startDate) > new Date(endDate)) return false;
  return true;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url.startsWith('/') && !isValidUrl(url)) return false;
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return validExtensions.some(ext => url.toLowerCase().includes(ext));
};

export const isValidVideoUrl = (url: string): boolean => {
  if (!url.startsWith('/') && !isValidUrl(url)) return false;
  const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return validExtensions.some(ext => url.toLowerCase().includes(ext));
};

export const isUniqueId = (id: string, existingIds: Set<string>): boolean => {
  if (existingIds.has(id)) return false;
  existingIds.add(id);
  return true;
};

// Work Experience validation
export const validateWorkExperience = (workExp: IWorkExperience, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!workExp.id) errors.push({ field: 'id', message: 'Work experience ID is required' });
  if (!workExp.title) errors.push({ field: 'title', message: 'Title is required' });
  if (!workExp.company) errors.push({ field: 'company', message: 'Company is required' });
  if (!workExp.role) errors.push({ field: 'role', message: 'Role is required' });
  if (!workExp.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });
  if (!workExp.location) errors.push({ field: 'location', message: 'Location is required' });

  // ID uniqueness
  if (workExp.id && !isUniqueId(workExp.id, existingIds)) {
    errors.push({ field: 'id', message: 'ID must be unique across all content', value: workExp.id });
  }

  // Date validation
  if (!isValidDateRange(workExp.startDate, workExp.endDate)) {
    errors.push({ 
      field: 'dates', 
      message: 'Invalid date range - start date must be before end date',
      value: { startDate: workExp.startDate, endDate: workExp.endDate }
    });
  }

  // URL validation
  if (workExp.thumbnailUrl && !isValidImageUrl(workExp.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format', value: workExp.thumbnailUrl });
  }
  if (workExp.companyUrl && !isValidUrl(workExp.companyUrl)) {
    errors.push({ field: 'companyUrl', message: 'Invalid company URL', value: workExp.companyUrl });
  }

  // Arrays validation
  if (!Array.isArray(workExp.technologies)) {
    errors.push({ field: 'technologies', message: 'Technologies must be an array' });
  }
  if (!Array.isArray(workExp.achievements)) {
    errors.push({ field: 'achievements', message: 'Achievements must be an array' });
  }
  if (!Array.isArray(workExp.seasons)) {
    errors.push({ field: 'seasons', message: 'Seasons must be an array' });
  }

  // Validate seasons
  workExp.seasons?.forEach((season, index) => {
    const seasonErrors = validateSeason(season, existingIds);
    seasonErrors.errors.forEach(error => {
      errors.push({
        field: `seasons[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Season validation
export const validateSeason = (season: ISeason, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!season.id) errors.push({ field: 'id', message: 'Season ID is required' });
  if (!season.title) errors.push({ field: 'title', message: 'Season title is required' });
  if (!season.startDate) errors.push({ field: 'startDate', message: 'Season start date is required' });

  if (season.id && !isUniqueId(season.id, existingIds)) {
    errors.push({ field: 'id', message: 'Season ID must be unique', value: season.id });
  }

  if (!isValidDateRange(season.startDate, season.endDate)) {
    errors.push({ 
      field: 'dates', 
      message: 'Invalid season date range',
      value: { startDate: season.startDate, endDate: season.endDate }
    });
  }

  if (season.videoUrl && !isValidVideoUrl(season.videoUrl)) {
    errors.push({ field: 'videoUrl', message: 'Invalid season video URL', value: season.videoUrl });
  }

  if (!Array.isArray(season.episodes)) {
    errors.push({ field: 'episodes', message: 'Episodes must be an array' });
  }

  // Validate episodes
  season.episodes?.forEach((episode, index) => {
    const episodeErrors = validateEpisode(episode, existingIds);
    episodeErrors.errors.forEach(error => {
      errors.push({
        field: `episodes[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Episode validation
export const validateEpisode = (episode: IEpisode, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!episode.id) errors.push({ field: 'id', message: 'Episode ID is required' });
  if (!episode.title) errors.push({ field: 'title', message: 'Episode title is required' });
  if (!episode.duration) errors.push({ field: 'duration', message: 'Episode duration is required' });

  if (episode.id && !isUniqueId(episode.id, existingIds)) {
    errors.push({ field: 'id', message: 'Episode ID must be unique', value: episode.id });
  }

  if (episode.videoUrl && !isValidVideoUrl(episode.videoUrl)) {
    errors.push({ field: 'videoUrl', message: 'Invalid episode video URL', value: episode.videoUrl });
  }

  if (!Array.isArray(episode.technologies)) {
    errors.push({ field: 'technologies', message: 'Episode technologies must be an array' });
  }

  if (!Array.isArray(episode.achievements)) {
    errors.push({ field: 'achievements', message: 'Episode achievements must be an array' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Education validation
export const validateEducation = (education: IEducation, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!education.id) errors.push({ field: 'id', message: 'Education ID is required' });
  if (!education.title) errors.push({ field: 'title', message: 'Title is required' });
  if (!education.institution) errors.push({ field: 'institution', message: 'Institution is required' });
  if (!education.degree) errors.push({ field: 'degree', message: 'Degree is required' });
  if (!education.field) errors.push({ field: 'field', message: 'Field is required' });
  if (!education.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });
  if (!education.location) errors.push({ field: 'location', message: 'Location is required' });

  // ID uniqueness
  if (education.id && !isUniqueId(education.id, existingIds)) {
    errors.push({ field: 'id', message: 'ID must be unique across all content', value: education.id });
  }

  // Date validation
  if (!isValidDateRange(education.startDate, education.endDate)) {
    errors.push({ 
      field: 'dates', 
      message: 'Invalid date range - start date must be before end date',
      value: { startDate: education.startDate, endDate: education.endDate }
    });
  }

  // URL validation
  if (education.thumbnailUrl && !isValidImageUrl(education.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format', value: education.thumbnailUrl });
  }
  if (education.institutionUrl && !isValidUrl(education.institutionUrl)) {
    errors.push({ field: 'institutionUrl', message: 'Invalid institution URL', value: education.institutionUrl });
  }

  // Arrays validation
  if (!Array.isArray(education.relevantCoursework)) {
    errors.push({ field: 'relevantCoursework', message: 'Relevant coursework must be an array' });
  }
  if (!Array.isArray(education.projects)) {
    errors.push({ field: 'projects', message: 'Projects must be an array' });
  }

  // Validate education projects
  education.projects?.forEach((project, index) => {
    const projectErrors = validateEducationProject(project, existingIds);
    projectErrors.errors.forEach(error => {
      errors.push({
        field: `projects[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Education project validation
export const validateEducationProject = (project: IEducationProject, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!project.id) errors.push({ field: 'id', message: 'Project ID is required' });
  if (!project.title) errors.push({ field: 'title', message: 'Project title is required' });

  if (project.id && !isUniqueId(project.id, existingIds)) {
    errors.push({ field: 'id', message: 'Project ID must be unique', value: project.id });
  }

  if (project.githubUrl && !isValidUrl(project.githubUrl)) {
    errors.push({ field: 'githubUrl', message: 'Invalid GitHub URL', value: project.githubUrl });
  }

  if (project.liveUrl && !isValidUrl(project.liveUrl)) {
    errors.push({ field: 'liveUrl', message: 'Invalid live URL', value: project.liveUrl });
  }

  if (project.videoUrl && !isValidVideoUrl(project.videoUrl)) {
    errors.push({ field: 'videoUrl', message: 'Invalid project video URL', value: project.videoUrl });
  }

  if (!Array.isArray(project.technologies)) {
    errors.push({ field: 'technologies', message: 'Project technologies must be an array' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Skill validation
export const validateSkill = (skill: ISkill, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!skill.id) errors.push({ field: 'id', message: 'Skill ID is required' });
  if (!skill.name) errors.push({ field: 'name', message: 'Skill name is required' });
  if (!skill.category) errors.push({ field: 'category', message: 'Skill category is required' });
  if (!skill.proficiency) errors.push({ field: 'proficiency', message: 'Skill proficiency is required' });

  // ID uniqueness
  if (skill.id && !isUniqueId(skill.id, existingIds)) {
    errors.push({ field: 'id', message: 'ID must be unique across all content', value: skill.id });
  }

  // Enum validation
  const validCategories = Object.values(SkillCategory);
  if (!validCategories.includes(skill.category)) {
    errors.push({ 
      field: 'category', 
      message: `Invalid skill category. Must be one of: ${validCategories.join(', ')}`,
      value: skill.category
    });
  }

  const validProficiencies = Object.values(SkillProficiency);
  if (!validProficiencies.includes(skill.proficiency)) {
    errors.push({ 
      field: 'proficiency', 
      message: `Invalid skill proficiency. Must be one of: ${validProficiencies.join(', ')}`,
      value: skill.proficiency
    });
  }

  // Numeric validation
  if (typeof skill.yearsOfExperience !== 'number' || skill.yearsOfExperience < 0) {
    errors.push({ 
      field: 'yearsOfExperience', 
      message: 'Years of experience must be a non-negative number',
      value: skill.yearsOfExperience
    });
  }

  if (typeof skill.skillLevel !== 'number' || skill.skillLevel < 1 || skill.skillLevel > 10) {
    errors.push({ 
      field: 'skillLevel', 
      message: 'Skill level must be a number between 1 and 10',
      value: skill.skillLevel
    });
  }

  // URL validation
  if (skill.thumbnailUrl && !isValidImageUrl(skill.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format', value: skill.thumbnailUrl });
  }

  // Arrays validation
  if (!Array.isArray(skill.technologies)) {
    errors.push({ field: 'technologies', message: 'Technologies must be an array' });
  }
  if (!Array.isArray(skill.recentProjects)) {
    errors.push({ field: 'recentProjects', message: 'Recent projects must be an array' });
  }
  if (skill.certifications && !Array.isArray(skill.certifications)) {
    errors.push({ field: 'certifications', message: 'Certifications must be an array' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Personal project validation
export const validatePersonalProject = (project: IPersonalProject, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!project.id) errors.push({ field: 'id', message: 'Project ID is required' });
  if (!project.title) errors.push({ field: 'title', message: 'Project title is required' });
  if (!project.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });

  // ID uniqueness
  if (project.id && !isUniqueId(project.id, existingIds)) {
    errors.push({ field: 'id', message: 'ID must be unique across all content', value: project.id });
  }

  // Date validation
  if (!isValidDateRange(project.startDate, project.endDate)) {
    errors.push({ 
      field: 'dates', 
      message: 'Invalid date range - start date must be before end date',
      value: { startDate: project.startDate, endDate: project.endDate }
    });
  }

  // URL validation
  if (project.thumbnailUrl && !isValidImageUrl(project.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format', value: project.thumbnailUrl });
  }
  if (project.githubUrl && !isValidUrl(project.githubUrl)) {
    errors.push({ field: 'githubUrl', message: 'Invalid GitHub URL', value: project.githubUrl });
  }
  if (project.liveUrl && !isValidUrl(project.liveUrl)) {
    errors.push({ field: 'liveUrl', message: 'Invalid live URL', value: project.liveUrl });
  }
  if (project.videoUrl && !isValidVideoUrl(project.videoUrl)) {
    errors.push({ field: 'videoUrl', message: 'Invalid project video URL', value: project.videoUrl });
  }

  // Arrays validation
  if (!Array.isArray(project.technologies)) {
    errors.push({ field: 'technologies', message: 'Technologies must be an array' });
  }
  if (!Array.isArray(project.features)) {
    errors.push({ field: 'features', message: 'Features must be an array' });
  }
  if (!Array.isArray(project.challenges)) {
    errors.push({ field: 'challenges', message: 'Challenges must be an array' });
  }
  if (!Array.isArray(project.solutions)) {
    errors.push({ field: 'solutions', message: 'Solutions must be an array' });
  }
  if (project.collaborators && !Array.isArray(project.collaborators)) {
    errors.push({ field: 'collaborators', message: 'Collaborators must be an array' });
  }

  // Boolean validation
  if (typeof project.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean', value: project.isActive });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Volunteer Work validation
export const validateVolunteerWork = (volunteer: IVolunteerWork, existingIds: Set<string>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!volunteer.id) errors.push({ field: 'id', message: 'Volunteer work ID is required' });
  if (!volunteer.title) errors.push({ field: 'title', message: 'Title is required' });
  if (!volunteer.description) errors.push({ field: 'description', message: 'Description is required' });
  if (!volunteer.thumbnailUrl) errors.push({ field: 'thumbnailUrl', message: 'Thumbnail URL is required' });
  if (!volunteer.organization) errors.push({ field: 'organization', message: 'Organization is required' });
  if (!volunteer.role) errors.push({ field: 'role', message: 'Role is required' });
  if (!volunteer.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });
  if (!volunteer.location) errors.push({ field: 'location', message: 'Location is required' });
  if (!volunteer.impact) errors.push({ field: 'impact', message: 'Impact description is required' });

  // ID uniqueness
  if (volunteer.id && !isUniqueId(volunteer.id, existingIds)) {
    errors.push({ field: 'id', message: 'ID must be unique across all content', value: volunteer.id });
  }

  // Date validation
  if (!isValidDateRange(volunteer.startDate, volunteer.endDate)) {
    errors.push({ 
      field: 'dates', 
      message: 'Invalid date range - start date must be before end date',
      value: { startDate: volunteer.startDate, endDate: volunteer.endDate }
    });
  }

  // URL validation
  if (volunteer.thumbnailUrl && !isValidImageUrl(volunteer.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format', value: volunteer.thumbnailUrl });
  }

  // Number validation
  if (typeof volunteer.hoursPerWeek !== 'number' || volunteer.hoursPerWeek < 0) {
    errors.push({ field: 'hoursPerWeek', message: 'Hours per week must be a positive number', value: volunteer.hoursPerWeek });
  }

  // Array validation
  if (volunteer.technologies && !Array.isArray(volunteer.technologies)) {
    errors.push({ field: 'technologies', message: 'Technologies must be an array', value: volunteer.technologies });
  }
  if (volunteer.achievements && !Array.isArray(volunteer.achievements)) {
    errors.push({ field: 'achievements', message: 'Achievements must be an array', value: volunteer.achievements });
  }
  if (volunteer.skills && !Array.isArray(volunteer.skills)) {
    errors.push({ field: 'skills', message: 'Skills must be an array', value: volunteer.skills });
  }

  // Boolean validation
  if (typeof volunteer.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean', value: volunteer.isActive });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Main content validation
export const validateContent = (content: IContent): ValidationResult => {
  const errors: ValidationError[] = [];
  const existingIds = new Set<string>();

  // Validate metadata
  if (!content.metadata) {
    errors.push({ field: 'metadata', message: 'Content metadata is required' });
  } else {
    if (!content.metadata.version) {
      errors.push({ field: 'metadata.version', message: 'Metadata version is required' });
    }
    if (!content.metadata.author) {
      errors.push({ field: 'metadata.author', message: 'Metadata author is required' });
    }
    if (!content.metadata.lastUpdated) {
      errors.push({ field: 'metadata.lastUpdated', message: 'Metadata last updated is required' });
    }
  }

  // Validate arrays exist
  if (!Array.isArray(content.workExperience)) {
    errors.push({ field: 'workExperience', message: 'Work experience must be an array' });
  }
  if (!Array.isArray(content.education)) {
    errors.push({ field: 'education', message: 'Education must be an array' });
  }
  if (!Array.isArray(content.skills)) {
    errors.push({ field: 'skills', message: 'Skills must be an array' });
  }
  if (!Array.isArray(content.personalProjects)) {
    errors.push({ field: 'personalProjects', message: 'Personal projects must be an array' });
  }
  if (!Array.isArray(content.volunteerWork)) {
    errors.push({ field: 'volunteerWork', message: 'Volunteer work must be an array' });
  }

  // Validate work experience items
  content.workExperience?.forEach((item, index) => {
    const itemErrors = validateWorkExperience(item, existingIds);
    itemErrors.errors.forEach(error => {
      errors.push({
        field: `workExperience[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  // Validate education items
  content.education?.forEach((item, index) => {
    const itemErrors = validateEducation(item, existingIds);
    itemErrors.errors.forEach(error => {
      errors.push({
        field: `education[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  // Validate skills
  content.skills?.forEach((item, index) => {
    const itemErrors = validateSkill(item, existingIds);
    itemErrors.errors.forEach(error => {
      errors.push({
        field: `skills[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  // Validate personal projects
  content.personalProjects?.forEach((item, index) => {
    const itemErrors = validatePersonalProject(item, existingIds);
    itemErrors.errors.forEach(error => {
      errors.push({
        field: `personalProjects[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  // Validate volunteer work
  content.volunteerWork?.forEach((item, index) => {
    const itemErrors = validateVolunteerWork(item, existingIds);
    itemErrors.errors.forEach(error => {
      errors.push({
        field: `volunteerWork[${index}].${error.field}`,
        message: error.message,
        value: error.value
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility function to get validation summary
export const getValidationSummary = (result: ValidationResult): string => {
  if (result.isValid) {
    return '✅ All content validation passed successfully!';
  }

  const errorCount = result.errors.length;
  const errorSummary = result.errors
    .slice(0, 5) // Show first 5 errors
    .map(error => `  • ${error.field}: ${error.message}`)
    .join('\n');

  const remainingErrors = errorCount > 5 ? `\n  ... and ${errorCount - 5} more errors` : '';

  return `❌ Content validation failed with ${errorCount} error(s):\n${errorSummary}${remainingErrors}`;
};

// Type guard for validation result
export const isValidContent = (content: unknown): content is IContent => {
  const result = validateContent(content as IContent);
  return result.isValid;
};

 