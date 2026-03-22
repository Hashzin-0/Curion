import { create } from 'zustand';
import { SiteService } from '@/lib/services/site';
import { templates, getTemplate } from '@/config/templates';
import type {
  SiteConfig,
  SectionConfig,
  Service,
  BlogPost,
  ExternalSite,
  SeoConfig,
  ProfileData,
  SectionKey,
  TemplateKey,
  ThemeSettings,
} from '@/types/site';

interface SiteBuilderState {
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
  auditResult: {
    score: number;
    suggestions: Array<{
      section: SectionKey;
      priority: string;
      suggestion: string;
    }>;
  } | null;

  loadSiteData: (userId: string) => Promise<void>;
  loadSiteByUsername: (username: string) => Promise<void>;

  setConfig: (config: Partial<SiteConfig>) => Promise<void>;
  updateTheme: (theme: Partial<ThemeSettings>) => Promise<void>;
  applyTemplate: (templateKey: TemplateKey) => Promise<void>;

  setSectionConfig: (sectionKey: SectionKey, config: Partial<SectionConfig>) => Promise<void>;
  toggleSection: (sectionKey: SectionKey) => Promise<void>;
  updateSectionsOrder: (order: SectionKey[]) => Promise<void>;
  setActiveSection: (section: SectionKey | null) => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;

  createService: (service: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  reorderServices: (ids: string[]) => Promise<void>;

  createPost: (post: Omit<BlogPost, 'id' | 'user_id' | 'slug' | 'created_at' | 'updated_at' | 'reading_time'>) => Promise<void>;
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  togglePostPublish: (id: string) => Promise<void>;

  createExternalSite: (site: Omit<ExternalSite, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExternalSite: (id: string, site: Partial<ExternalSite>) => Promise<void>;
  deleteExternalSite: (id: string) => Promise<void>;
  reorderExternalSites: (ids: string[]) => Promise<void>;

  updateSeoConfig: (config: Partial<SeoConfig>) => Promise<void>;

  setDirty: (dirty: boolean) => void;
  runAudit: () => Promise<void>;
}

export const useSiteBuilderStore = create<SiteBuilderState>((set, get) => ({
  config: null,
  sectionConfigs: [],
  services: [],
  posts: [],
  externalSites: [],
  seoConfig: null,
  profileData: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  activeSection: null,
  previewMode: 'desktop',
  auditResult: null,

  loadSiteData: async (userId: string) => {
    set({ isLoading: true });
    try {
      const [config, sectionConfigs, services, posts, externalSites, seoConfig, profileData] =
        await Promise.all([
          SiteService.getSiteConfig(userId),
          SiteService.getSectionConfigs(userId),
          SiteService.getServices(userId),
          SiteService.getBlogPosts(userId),
          SiteService.getExternalSites(userId),
          SiteService.getSeoConfig(userId),
          SiteService.getProfileData(userId),
        ]);

      set({
        config,
        sectionConfigs: sectionConfigs || [],
        services: services || [],
        posts: posts || [],
        externalSites: externalSites || [],
        seoConfig,
        profileData,
        isLoading: false,
        isDirty: false,
      });
    } catch (error) {
      console.error('Failed to load site data:', error);
      set({ isLoading: false });
    }
  },

  loadSiteByUsername: async (username: string) => {
    set({ isLoading: true });
    try {
      const config = await SiteService.getSiteConfigByUsername(username);
      if (!config) {
        set({ isLoading: false, config: null });
        return;
      }

      const [sectionConfigs, services, posts, externalSites, seoConfig, profileData] =
        await Promise.all([
          SiteService.getSectionConfigs(config.user_id),
          SiteService.getServices(config.user_id),
          SiteService.getBlogPosts(config.user_id, { publishedOnly: true }),
          SiteService.getExternalSites(config.user_id),
          SiteService.getSeoConfig(config.user_id),
          SiteService.getProfileData(config.user_id),
        ]);

      set({
        config,
        sectionConfigs: sectionConfigs || [],
        services: services || [],
        posts: posts || [],
        externalSites: externalSites || [],
        seoConfig,
        profileData,
        isLoading: false,
        isDirty: false,
      });
    } catch (error) {
      console.error('Failed to load site by username:', error);
      set({ isLoading: false });
    }
  },

  setConfig: async (configUpdate) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const updated = await SiteService.updateSiteConfig(config.user_id, configUpdate);
      set({ config: updated, isSaving: false, isDirty: false });
    } catch (error) {
      console.error('Failed to update config:', error);
      set({ isSaving: false });
    }
  },

  updateTheme: async (themeUpdate) => {
    const { config } = get();
    if (!config) return;

    const newTheme = {
      ...config.theme_settings,
      ...themeUpdate,
    };

    await get().setConfig({ theme_settings: newTheme });
  },

  applyTemplate: async (templateKey: TemplateKey) => {
    const { config } = get();
    if (!config) return;

    const template = getTemplate(templateKey);
    set({ isSaving: true });

    try {
      await SiteService.applyTemplate(config.user_id, templateKey, {
        sections_order: template.suggested_order,
        theme_settings: template.theme,
        default_section_configs: template.default_section_configs,
      });

      await get().loadSiteData(config.user_id);
    } catch (error) {
      console.error('Failed to apply template:', error);
      set({ isSaving: false });
    }
  },

  setSectionConfig: async (sectionKey, configUpdate) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const updated = await SiteService.updateSectionConfig(config.user_id, sectionKey, configUpdate);

      const existingIndex = get().sectionConfigs.findIndex(
        (s) => s.section_key === sectionKey
      );

      if (existingIndex >= 0) {
        set((state) => ({
          sectionConfigs: state.sectionConfigs.map((s) =>
            s.section_key === sectionKey ? updated : s
          ),
          isSaving: false,
          isDirty: false,
        }));
      } else {
        set((state) => ({
          sectionConfigs: [...state.sectionConfigs, updated],
          isSaving: false,
          isDirty: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update section config:', error);
      set({ isSaving: false });
    }
  },

  toggleSection: async (sectionKey) => {
    const { sectionConfigs } = get();
    const existing = sectionConfigs.find((s) => s.section_key === sectionKey);

    if (existing) {
      const newMode =
        existing.override_mode === 'forced_on'
          ? 'forced_off'
          : existing.override_mode === 'forced_off'
          ? 'auto'
          : 'forced_on';
      await get().setSectionConfig(sectionKey, { override_mode: newMode });
    } else {
      await get().setSectionConfig(sectionKey, { override_mode: 'forced_on' });
    }
  },

  updateSectionsOrder: async (order) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      await SiteService.updateSectionsOrder(config.user_id, order);
      set((state) => ({
        config: state.config
          ? { ...state.config, sections_order: order }
          : null,
        isSaving: false,
        isDirty: false,
      }));
    } catch (error) {
      console.error('Failed to update sections order:', error);
      set({ isSaving: false });
    }
  },

  setActiveSection: (section) => set({ activeSection: section }),
  setPreviewMode: (mode) => set({ previewMode: mode }),

  createService: async (service) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const created = await SiteService.createService(config.user_id, {
        name: service.name,
        description: service.description || null,
        price: service.price,
        currency: service.currency,
        price_type: service.price_type,
        delivery_time: service.delivery_time || null,
        booking_url: service.booking_url || null,
        packages: service.packages || [],
      });
      set((state) => ({
        services: [...state.services, created],
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to create service:', error);
      set({ isSaving: false });
    }
  },

  updateService: async (id, serviceUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await SiteService.updateService(id, serviceUpdate);
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? updated : s)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to update service:', error);
      set({ isSaving: false });
    }
  },

  deleteService: async (id) => {
    try {
      await SiteService.deleteService(id);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  },

  reorderServices: async (ids) => {
    const { services } = get();
    const reordered = ids.map((id, index) => {
      const service = services.find((s) => s.id === id)!;
      return { ...service, sort_order: index };
    });
    set({ services: reordered });
    await SiteService.reorderServices(get().config!.user_id, ids);
  },

  createPost: async (post) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const created = await SiteService.createBlogPost(config.user_id, {
        title: post.title,
        excerpt: post.excerpt || null,
        content: post.content || null,
        category: post.category,
        tags: post.tags,
        cover_image_path: post.cover_image_path || null,
        is_published: post.is_published,
      });
      set((state) => ({
        posts: [created, ...state.posts],
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to create post:', error);
      set({ isSaving: false });
    }
  },

  updatePost: async (id, postUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await SiteService.updateBlogPost(id, postUpdate);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updated : p)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to update post:', error);
      set({ isSaving: false });
    }
  },

  deletePost: async (id) => {
    try {
      await SiteService.deleteBlogPost(id);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  },

  togglePostPublish: async (id) => {
    try {
      const updated = await SiteService.toggleBlogPostPublish(id);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (error) {
      console.error('Failed to toggle post publish:', error);
    }
  },

  createExternalSite: async (site) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const created = await SiteService.createExternalSite(config.user_id, {
        name: site.name,
        url: site.url,
        description: site.description || '',
        icon: site.icon,
      });
      set((state) => ({
        externalSites: [...state.externalSites, created],
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to create external site:', error);
      set({ isSaving: false });
    }
  },

  updateExternalSite: async (id, siteUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await SiteService.updateExternalSite(id, siteUpdate);
      set((state) => ({
        externalSites: state.externalSites.map((s) =>
          s.id === id ? updated : s
        ),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Failed to update external site:', error);
      set({ isSaving: false });
    }
  },

  deleteExternalSite: async (id) => {
    try {
      await SiteService.deleteExternalSite(id);
      set((state) => ({
        externalSites: state.externalSites.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete external site:', error);
    }
  },

  reorderExternalSites: async (ids) => {
    const { externalSites } = get();
    const reordered = ids.map((id, index) => {
      const site = externalSites.find((s) => s.id === id)!;
      return { ...site, sort_order: index };
    });
    set({ externalSites: reordered });
    await SiteService.reorderExternalSites(get().config!.user_id, ids);
  },

  updateSeoConfig: async (configUpdate) => {
    const { config } = get();
    if (!config) return;

    set({ isSaving: true });
    try {
      const updated = await SiteService.updateSeoConfig(config.user_id, configUpdate);
      set({ seoConfig: updated, isSaving: false });
    } catch (error) {
      console.error('Failed to update SEO config:', error);
      set({ isSaving: false });
    }
  },

  setDirty: (dirty) => set({ isDirty: dirty }),

  runAudit: async () => {
    const { config, sectionConfigs, services, posts, profileData } = get();
    if (!config || !profileData) return;

    const suggestions: Array<{
      section: SectionKey;
      priority: string;
      suggestion: string;
    }> = [];

    if (!config.site_title) {
      suggestions.push({
        section: 'hero',
        priority: 'high',
        suggestion: 'Adicione um título para o seu site',
      });
    }

    if (!profileData.user.summary) {
      suggestions.push({
        section: 'hero',
        priority: 'high',
        suggestion: 'Adicione um resumo profissional',
      });
    }

    if (services.length === 0) {
      suggestions.push({
        section: 'services',
        priority: 'medium',
        suggestion: 'Adicione serviços para mostrar o que você oferece',
      });
    }

    if (posts.filter((p) => p.is_published).length < 3) {
      suggestions.push({
        section: 'blog',
        priority: 'low',
        suggestion: 'Publique mais posts para manter seu blog ativo',
      });
    }

    if (profileData.experiences.length === 0) {
      suggestions.push({
        section: 'experiences',
        priority: 'medium',
        suggestion: 'Adicione suas experiências profissionais',
      });
    }

    if (profileData.skills.length === 0) {
      suggestions.push({
        section: 'skills',
        priority: 'medium',
        suggestion: 'Adicione suas habilidades técnicas',
      });
    }

    const score = Math.min(
      100,
      Math.round(
        20 +
          (profileData.user.summary ? 15 : 0) +
          (profileData.experiences.length > 0 ? 15 : 0) +
          (services.length > 0 ? 15 : 0) +
          (profileData.skills.length > 0 ? 10 : 0) +
          (posts.filter((p) => p.is_published).length >= 3 ? 10 : 0) +
          (config.site_title ? 5 : 0) +
          (config.og_image_path ? 5 : 0) +
          (profileData.certificates.length > 0 ? 5 : 0)
      )
    );

    set({
      auditResult: {
        score,
        suggestions,
      },
    });
  },
}));
