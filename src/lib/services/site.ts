import { supabase } from '../supabase';
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
  ServiceFormData,
  BlogPostFormData,
  ExternalSiteFormData,
} from '@/types/site';

export const SiteService = {
  async getSiteConfig(userId: string): Promise<SiteConfig | null> {
    const { data, error } = await supabase
      .from('site_configs')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getSiteConfigByUsername(username: string): Promise<SiteConfig | null> {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    if (!user) return null;
    return this.getSiteConfig(user.id);
  },

  async updateSiteConfig(
    userId: string,
    config: Partial<SiteConfig>
  ): Promise<SiteConfig> {
    const { data, error } = await supabase
      .from('site_configs')
      .update(config)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async applyTemplate(
    userId: string,
    templateKey: TemplateKey,
    template: {
      sections_order: SectionKey[];
      theme_settings: ThemeSettings;
      default_section_configs: Partial<Record<SectionKey, Partial<SectionConfig>>>;
    }
  ): Promise<void> {
    await this.updateSiteConfig(userId, {
      template_key: templateKey,
      sections_order: template.sections_order,
      theme_settings: template.theme_settings,
    });

    for (const [key, value] of Object.entries(template.default_section_configs)) {
      if (value) {
        await supabase.from('section_configs').upsert({
          user_id: userId,
          section_key: key,
          ...value,
        });
      }
    }
  },

  async getSectionConfigs(userId: string): Promise<SectionConfig[]> {
    const { data, error } = await supabase
      .from('section_configs')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async updateSectionConfig(
    userId: string,
    sectionKey: SectionKey,
    config: Partial<SectionConfig>
  ): Promise<SectionConfig> {
    const { data, error } = await supabase
      .from('section_configs')
      .upsert({
        user_id: userId,
        section_key: sectionKey,
        ...config,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSectionsOrder(
    userId: string,
    sectionsOrder: SectionKey[]
  ): Promise<void> {
    await this.updateSiteConfig(userId, { sections_order: sectionsOrder });
  },

  async getServices(userId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createService(
    userId: string,
    service: ServiceFormData
  ): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        user_id: userId,
        ...service,
        packages: service.packages || [],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateService(
    id: string,
    service: Partial<ServiceFormData>
  ): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  async reorderServices(
    userId: string,
    serviceIds: string[]
  ): Promise<void> {
    const updates = serviceIds.map((id, index) =>
      supabase.from('services').update({ sort_order: index }).eq('id', id)
    );
    await Promise.all(updates);
  },

  async getBlogPosts(
    userId: string,
    options?: { publishedOnly?: boolean; limit?: number }
  ): Promise<BlogPost[]> {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.publishedOnly) {
      query = query.eq('is_published', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createBlogPost(
    userId: string,
    post: BlogPostFormData
  ): Promise<BlogPost> {
    const title = post.title;
    const { data: slugData } = await supabase.rpc('generate_blog_slug', {
      title,
    });
    const slug = slugData || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const wordCount = post.content?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / 200);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        user_id: userId,
        title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags || [],
        cover_image_path: post.cover_image_path,
        is_published: post.is_published,
        reading_time: readingTime,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBlogPost(
    id: string,
    post: Partial<BlogPostFormData>
  ): Promise<BlogPost> {
    const updateData: Record<string, unknown> = { ...post };
    if (post.content) {
      const wordCount = post.content.split(/\s+/).length;
      updateData.reading_time = Math.ceil(wordCount / 200);
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleBlogPostPublish(id: string): Promise<BlogPost> {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('is_published')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('blog_posts')
      .update({ is_published: !post?.is_published })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getExternalSites(userId: string): Promise<ExternalSite[]> {
    const { data, error } = await supabase
      .from('external_sites')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createExternalSite(
    userId: string,
    site: ExternalSiteFormData
  ): Promise<ExternalSite> {
    const { data, error } = await supabase
      .from('external_sites')
      .insert({ user_id: userId, ...site })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateExternalSite(
    id: string,
    site: Partial<ExternalSiteFormData>
  ): Promise<ExternalSite> {
    const { data, error } = await supabase
      .from('external_sites')
      .update(site)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExternalSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('external_sites')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async reorderExternalSites(
    userId: string,
    siteIds: string[]
  ): Promise<void> {
    const updates = siteIds.map((id, index) =>
      supabase
        .from('external_sites')
        .update({ sort_order: index })
        .eq('id', id)
    );
    await Promise.all(updates);
  },

  async getSeoConfig(userId: string): Promise<SeoConfig | null> {
    const { data, error } = await supabase
      .from('seo_configs')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateSeoConfig(
    userId: string,
    config: Partial<SeoConfig>
  ): Promise<SeoConfig> {
    const { data, error } = await supabase
      .from('seo_configs')
      .update(config)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getProfileData(userId: string): Promise<ProfileData> {
    const [
      { data: user },
      { data: experiences },
      { data: education },
      { data: skills },
      { data: projects },
      { data: certificates },
      { data: languages },
      { data: recommendations },
      { data: volunteer },
      { data: publications },
      { data: portfolio },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase
        .from('area_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('certificates').select('*').eq('user_id', userId).order('issue_date', { ascending: false }),
      supabase.from('languages').select('*').eq('user_id', userId),
      supabase.from('recommendations').select('*').eq('user_id', userId),
      supabase.from('volunteer_experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('publications').select('*').eq('user_id', userId).order('publication_date', { ascending: false }),
      supabase.from('portfolio_items').select('*').eq('user_id', userId),
    ]);

    return {
      user: user!,
      experiences: experiences || [],
      education: education || [],
      skills: skills || [],
      projects: projects || [],
      certificates: certificates || [],
      languages: languages || [],
      recommendations: recommendations || [],
      volunteer: volunteer || [],
      publications: publications || [],
      portfolio: portfolio || [],
    };
  },

  async trackPageView(
    userId: string,
    data: {
      pageUrl?: string;
      sectionViewed?: string;
      ctaClicked?: string;
      referrer?: string;
    }
  ): Promise<void> {
    const { error } = await supabase.from('page_views').insert({
      user_id: userId,
      page_url: data.pageUrl,
      section_viewed: data.sectionViewed,
      cta_clicked: data.ctaClicked,
      referrer: data.referrer,
      viewed_at: new Date().toISOString(),
    });
    if (error) console.warn('Track page view error:', error.message);
  },

  async getAnalyticsSummary(
    userId: string,
    days: number = 30
  ): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    viewsTrend: number;
    sectionViews: Record<string, number>;
    ctaClicks: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: views } = await supabase
      .from('page_views')
      .select('*')
      .eq('user_id', userId)
      .gte('viewed_at', startDate.toISOString());

    const { data: sectionViews } = await supabase
      .from('section_analytics')
      .select('*')
      .eq('user_id', userId);

    const { data: ctaClicks } = await supabase
      .from('cta_analytics')
      .select('*')
      .eq('user_id', userId);

    const uniqueIpHashes = new Set(views?.map((v) => v.viewer_ip_hash) || []);
    const totalViews = views?.length || 0;

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    const { data: prevViews } = await supabase
      .from('page_views')
      .select('viewer_ip_hash')
      .eq('user_id', userId)
      .gte('viewed_at', prevStartDate.toISOString())
      .lt('viewed_at', startDate.toISOString());

    const prevUnique = new Set(prevViews?.map((v) => v.viewer_ip_hash) || []);
    const prevTotal = prevViews?.length || 0;
    const viewsTrend =
      prevTotal > 0 ? ((totalViews - prevTotal) / prevTotal) * 100 : 0;

    return {
      totalViews,
      uniqueVisitors: uniqueIpHashes.size,
      viewsTrend,
      sectionViews: Object.fromEntries(
        (sectionViews || []).map((s) => [s.section_viewed, s.views])
      ),
      ctaClicks: Object.fromEntries(
        (ctaClicks || []).map((c) => [c.cta_clicked, c.clicks])
      ),
    };
  },
};
