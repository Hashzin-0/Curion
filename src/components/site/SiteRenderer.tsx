'use client';

import { useEffect } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { sections, getSectionDefinition } from '@/config/sections';
import type { SectionKey } from '@/types/site';
import { Edit3 } from 'lucide-react';
import Link from 'next/link';

interface SiteRendererProps {
  username: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userHeadline?: string | null;
  userSummary?: string | null;
  userLocation?: string | null;
  isOwner: boolean;
}

export function SiteRenderer({
  username,
  userId,
  userName,
  userAvatar,
  userHeadline,
  userSummary,
  userLocation,
  isOwner,
}: SiteRendererProps) {
  const {
    config,
    sectionConfigs,
    services,
    posts,
    externalSites,
    isLoading,
    loadSiteData,
  } = useSiteBuilderStore();

  useEffect(() => {
    if (userId) {
      loadSiteData(userId);
    }
  }, [userId, loadSiteData]);

  if (isLoading && !config) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const theme = {
    primaryColor: config?.theme_settings?.primaryColor || '#3b82f6',
    accentColor: config?.theme_settings?.accentColor || '#10b981',
    fontFamily: config?.theme_settings?.fontFamily || 'Inter',
    bgColor: config?.theme_settings?.bgColor || '#ffffff',
    textColor: config?.theme_settings?.textColor || '#1f2937',
    borderColor: config?.theme_settings?.borderColor || '#e5e7eb',
  };

  const sectionsOrder = config?.sections_order || sections.map((s) => s.key);

  const hasContent = (key: SectionKey): boolean => {
    switch (key) {
      case 'hero':
        return true;
      case 'experiences':
      case 'projects':
      case 'education':
      case 'skills':
      case 'certifications':
      case 'languages':
      case 'recommendations':
      case 'volunteer':
      case 'publications':
        return true;
      case 'services':
        return services.length > 0;
      case 'blog':
        return posts.filter((p) => p.is_published).length > 0;
      case 'links':
        return externalSites.filter((s) => s.is_active).length > 0;
      case 'services_intro':
      case 'trajectory':
        const sectionConfig = sectionConfigs.find((s) => s.section_key === key);
        return !!sectionConfig?.custom_summary;
      default:
        return true;
    }
  };

  const shouldShowSection = (key: SectionKey): boolean => {
    const sectionConfig = sectionConfigs.find((s) => s.section_key === key);
    
    if (sectionConfig?.override_mode === 'forced_on') return true;
    if (sectionConfig?.override_mode === 'forced_off') return false;
    
    return hasContent(key);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgColor, color: theme.textColor, fontFamily: theme.fontFamily }}>
      {isOwner && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href={`/${username}/edit`}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span className="font-medium">Editar Site</span>
          </Link>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sectionsOrder.map((key) => {
          if (!shouldShowSection(key)) return null;

          const sectionDef = getSectionDefinition(key);
          const sectionConfig = sectionConfigs.find((s) => s.section_key === key);

          return (
            <motion.section
              key={key}
              variants={itemVariants}
              id={`section-${key}`}
              className="py-16 px-4 md:px-8"
              style={{ borderBottom: '1px solid', borderColor: theme.borderColor }}
            >
              <div className="max-w-4xl mx-auto">
                {sectionDef && (
                  <div className="mb-8">
                    <h2
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: theme.primaryColor }}
                    >
                      {sectionDef.label}
                    </h2>
                    {sectionConfig?.custom_summary && (
                      <p className="mt-2 text-gray-600">
                        {sectionConfig.custom_summary}
                      </p>
                    )}
                  </div>
                )}

                <SectionContent
                  sectionKey={key}
                  theme={theme}
                  userName={userName}
                  userAvatar={userAvatar}
                  userHeadline={userHeadline}
                  userSummary={userSummary}
                  userLocation={userLocation}
                  services={services}
                  posts={posts}
                  externalSites={externalSites}
                  sectionConfigs={sectionConfigs}
                />
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </div>
  );
}

interface SectionContentProps {
  sectionKey: SectionKey;
  theme: { primaryColor: string; accentColor: string; fontFamily: string; bgColor: string; textColor: string; borderColor: string };
  userName: string;
  userAvatar?: string | null;
  userHeadline?: string | null;
  userSummary?: string | null;
  userLocation?: string | null;
  services: Array<{ id: string; name: string; description: string | null; price: number | null; currency: string; price_type: string; delivery_time: string | null; booking_url: string | null; is_active: boolean }>;
  posts: Array<{ id: string; title: string; excerpt: string | null; cover_image_path: string | null; category: string; reading_time: number | null; published_at: string | null; is_published: boolean }>;
  externalSites: Array<{ id: string; name: string; url: string; icon: string; is_active: boolean }>;
  sectionConfigs: Array<{ section_key: string; custom_summary: string | null; override_mode: string }>;
}

function SectionContent({
  sectionKey,
  theme,
  userName,
  userAvatar,
  userHeadline,
  userSummary,
  userLocation,
  services,
  posts,
  externalSites,
}: SectionContentProps) {
  switch (sectionKey) {
    case 'hero':
      return (
        <div className="text-center py-8">
          {userAvatar && (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200">
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2">{userName}</h1>
          {userHeadline && (
            <p className="text-xl text-gray-600 mb-4">{userHeadline}</p>
          )}
          {userSummary && (
            <p className="text-gray-700 max-w-2xl mx-auto">{userSummary}</p>
          )}
          {userLocation && (
            <p className="text-sm text-gray-500 mt-4">{userLocation}</p>
          )}
        </div>
      );

    case 'services':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services
            .filter((s) => s.is_active)
            .map((service) => (
              <div
                key={service.id}
                className="p-6 rounded-xl border"
                style={{ borderColor: theme.borderColor }}
              >
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-600 mb-4">{service.description}</p>
                )}
                {service.price && (
                  <p
                    className="text-2xl font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {service.currency === 'BRL' ? 'R$' : service.currency === 'EUR' ? '€' : '$'}
                    {service.price.toLocaleString()}
                    {service.price_type === 'hourly' && '/h'}
                    {service.price_type === 'project' && ' (projeto)'}
                  </p>
                )}
                {service.delivery_time && (
                  <p className="text-sm text-gray-500 mt-2">
                    Entrega: {service.delivery_time}
                  </p>
                )}
                {service.booking_url && (
                  <a
                    href={service.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Solicitar
                  </a>
                )}
              </div>
            ))}
        </div>
      );

    case 'blog':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts
            .filter((p) => p.is_published)
            .map((post) => (
              <article
                key={post.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: theme.borderColor }}
              >
                {post.cover_image_path && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={post.cover_image_path}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {post.category}
                  </span>
                  <h3 className="font-semibold text-lg mt-1">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-gray-600 mt-2 text-sm">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    {post.reading_time && (
                      <span className="text-xs text-gray-500">
                        {post.reading_time} min de leitura
                      </span>
                    )}
                    {post.published_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>
      );

    case 'links':
      return (
        <div className="flex flex-wrap gap-4">
          {externalSites
            .filter((s) => s.is_active)
            .map((site) => (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ borderColor: theme.borderColor }}
              >
                <span>{getIconEmoji(site.icon)}</span>
                <span className="font-medium">{site.name}</span>
              </a>
            ))}
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Complete seu perfil para visualizar esta seção.
          </p>
        </div>
      );
  }
}

function getIconEmoji(icon: string): string {
  const icons: Record<string, string> = {
    Link: '🔗',
    GitHub: '🐙',
    LinkedIn: '💼',
    Twitter: '🐦',
    Instagram: '📷',
  };
  return icons[icon] || '🔗';
}
