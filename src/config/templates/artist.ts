import type { SiteTemplate, ThemeSettings, SectionKey, SectionConfig } from '@/types/site';

const theme: ThemeSettings = {
  primaryColor: '#8b5cf6',
  accentColor: '#f97316',
  fontFamily: 'Space Grotesk',
  bgColor: '#18181b',
  textColor: '#fafafa',
  cardBgColor: '#27272a',
  borderColor: '#3f3f46',
};

export const artistTemplate: SiteTemplate = {
  key: 'artist',
  label: 'Artista / Criativo',
  description: 'Template portfolio-gallery para artistas e criativos. Cores vibrantes e galeria imersiva.',
  icon: 'Sparkles',
  theme,
  suggested_order: [
    'hero',
    'projects',
    'hero',
    'experiences',
    'blog',
    'links',
  ],
  default_section_configs: {
    hero: { is_enabled: true, override_mode: 'auto' },
    projects: { is_enabled: true, override_mode: 'auto' },
    experiences: { is_enabled: true, override_mode: 'auto' },
    blog: { is_enabled: true, override_mode: 'auto' },
    links: { is_enabled: true, override_mode: 'auto' },
    services_intro: { is_enabled: false, override_mode: 'auto' },
    services: { is_enabled: false, override_mode: 'auto' },
    trajectory: { is_enabled: false, override_mode: 'auto' },
    education: { is_enabled: true, override_mode: 'auto' },
    skills: { is_enabled: false, override_mode: 'auto' },
    certifications: { is_enabled: false, override_mode: 'auto' },
    languages: { is_enabled: false, override_mode: 'auto' },
    recommendations: { is_enabled: true, override_mode: 'auto' },
    volunteer: { is_enabled: false, override_mode: 'auto' },
    publications: { is_enabled: false, override_mode: 'auto' },
  } as Partial<Record<SectionKey, Partial<SectionConfig>>>,
  features: [
    'Galeria fullscreen',
    'Lightbox com swipe',
    'Transições animadas',
    'Cores neon/vibrantes',
    'Cover parallax',
  ],
  recommended_for: [
    'Fotógrafos',
    'Artistas visuais',
    'Músicos',
    'Diretores de arte',
    'Ilustradores',
    'Curadores',
  ],
};
