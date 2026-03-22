// Site Blog Personal Types

export type TemplateKey = 'freelancer' | 'dev' | 'designer' | 'writer' | 'artist';

export type SectionKey = 
  | 'hero' 
  | 'experiences' 
  | 'services_intro' 
  | 'services' 
  | 'projects'
  | 'trajectory' 
  | 'education' 
  | 'skills' 
  | 'certifications' 
  | 'languages'
  | 'blog' 
  | 'links' 
  | 'recommendations' 
  | 'volunteer' 
  | 'publications';

export type OverrideMode = 'auto' | 'forced_on' | 'forced_off';

export type BlogCategory = 'projetos' | 'trajetoria' | 'servicos' | 'livre';

export type PriceType = 'fixed' | 'hourly' | 'project' | 'contact';

export type Currency = 'BRL' | 'USD' | 'EUR';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

// Theme Settings
export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  bgColor: string;
  textColor: string;
  cardBgColor?: string;
  borderColor?: string;
}

// Site Config
export interface SiteConfig {
  id: string;
  user_id: string;
  template_key: TemplateKey;
  sections_order: SectionKey[];
  theme_settings: ThemeSettings;
  site_title: string | null;
  site_description: string | null;
  og_image_path: string | null;
  is_published: boolean;
  auditor_score: number | null;
  auditor_data: AuditResult | null;
  created_at: string;
  updated_at: string;
}

// Section Config
export interface SectionConfig {
  id: string;
  user_id: string;
  section_key: SectionKey;
  is_enabled: boolean;
  override_mode: OverrideMode;
  custom_summary: string | null;
  sort_order: number;
  section_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Section Definition (for UI)
export interface SectionDefinition {
  key: SectionKey;
  label: string;
  labelPlural: string;
  source: 'profile' | 'custom' | 'services' | 'posts' | 'external';
  editable: boolean;
  hasSummary: boolean;
  hasSettings: boolean;
  icon: string;
  color: string;
}

// Service
export interface Service {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: Currency;
  price_type: PriceType;
  delivery_time: string | null;
  booking_url: string | null;
  packages: ServicePackage[];
  is_active: boolean;
  sort_order: number;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePackage {
  name: string;
  description?: string;
  price?: number;
  features?: string[];
}

// Blog Post
export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  ai_excerpt: string | null;
  content: string | null;
  category: BlogCategory;
  tags: string[];
  ai_tags: string[] | null;
  cover_image_path: string | null;
  reading_time: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// External Site
export interface ExternalSite {
  id: string;
  user_id: string;
  name: string;
  url: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// SEO Config
export interface SeoConfig {
  id: string;
  user_id: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_path: string | null;
  twitter_handle: string | null;
  twitter_card_type: 'summary' | 'summary_large_image';
  canonical_url: string | null;
  sitemap_priority: number;
  sitemap_frequency: 'daily' | 'weekly' | 'monthly';
  no_index: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Result
export interface AuditResult {
  score: number;
  overall: AuditItem;
  sections: Record<SectionKey, AuditItem>;
  suggestions: AuditSuggestion[];
  strengths: string[];
}

export interface AuditItem {
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'missing';
  feedback: string;
}

export interface AuditSuggestion {
  section: SectionKey;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  action: string;
}

// Analytics
export interface PageView {
  id: number;
  user_id: string;
  viewer_ip_hash: string | null;
  page_url: string | null;
  section_viewed: string | null;
  cta_clicked: string | null;
  referrer: string | null;
  user_agent: string | null;
  device_type: DeviceType | null;
  country: string | null;
  city: string | null;
  viewed_at: string;
}

export interface AnalyticsSummary {
  user_id: string;
  date: string;
  total_views: number;
  unique_visitors: number;
  section_views: number;
  cta_clicks: number;
}

export interface SectionAnalytics {
  user_id: string;
  section_viewed: string;
  views: number;
  unique_visitors: number;
}

export interface CtaAnalytics {
  user_id: string;
  cta_clicked: string;
  clicks: number;
  unique_clickers: number;
}

// Template
export interface SiteTemplate {
  key: TemplateKey;
  label: string;
  description: string;
  icon: string;
  theme: ThemeSettings;
  suggested_order: SectionKey[];
  default_section_configs: Partial<Record<SectionKey, Partial<SectionConfig>>>;
  features: string[];
  recommended_for: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiListResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

// Form Types
export interface ServiceFormData {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: Currency;
  price_type?: PriceType;
  delivery_time?: string | null;
  booking_url?: string | null;
  packages?: ServicePackage[];
}

export interface BlogPostFormData {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  category: BlogCategory;
  tags?: string[];
  cover_image_path?: string | null;
  is_published?: boolean;
}

export interface ExternalSiteFormData {
  name: string;
  url: string;
  description?: string | null;
  icon?: string;
}

// Site Builder State
export interface SiteBuilderState {
  config: SiteConfig | null;
  sectionConfigs: SectionConfig[];
  services: Service[];
  posts: BlogPost[];
  externalSites: ExternalSite[];
  seoConfig: SeoConfig | null;
  profileData: ProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  activeSection: SectionKey | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export interface ProfileData {
  user: {
    id: string;
    name: string;
    headline: string | null;
    summary: string | null;
    avatar_path: string | null;
    location: string | null;
  };
  experiences: Experience[];
  education: Education[];
  skills: AreaSkill[];
  projects: Project[];
  certificates: Certificate[];
  languages: Language[];
  recommendations: Recommendation[];
  volunteer: VolunteerExperience[];
  publications: Publication[];
  portfolio: PortfolioItem[];
}

// Re-export existing types
export interface Experience {
  id: string;
  area_id: string | null;
  user_id: string;
  role: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  course: string;
  start_date: string | null;
  end_date: string | null;
}

export interface AreaSkill {
  area_id: string;
  skill_id: string;
  user_id: string;
  skill: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  external_url: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string | null;
  file_path: string | null;
}

export interface Language {
  id: string;
  user_id: string;
  language_name: string;
  proficiency: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  author_name: string;
  author_headline: string;
  content: string;
  file_path: string | null;
}

export interface VolunteerExperience {
  id: string;
  user_id: string;
  organization: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface Publication {
  id: string;
  user_id: string;
  title: string;
  publisher: string | null;
  publication_date: string | null;
  url: string | null;
  description: string | null;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
}
