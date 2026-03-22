'use client';

import { useState } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { useStore } from '@/lib/store';
import { sections } from '@/config/sections';
import { templates } from '@/config/templates';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone,
  Save,
  LayoutTemplate,
  Settings2,
  FileText,
  Package,
  BookOpen,
  Link2,
  Check,
  X,
  GripVertical,
  Loader2,
  Sparkles
} from 'lucide-react';

interface SiteBuilderProps {
  onClose?: () => void;
}

export function SiteBuilder({ onClose }: SiteBuilderProps) {
  const { currentUser } = useStore();
  const {
    config,
    sectionConfigs,
    isLoading,
    isSaving,
    isDirty,
    previewMode,
    auditResult,
    loadSiteData,
    setConfig,
    updateTheme,
    applyTemplate,
    toggleSection,
    updateSectionsOrder,
    setPreviewMode,
    runAudit,
  } = useSiteBuilderStore();

  const [activeTab, setActiveTab] = useState<'sections' | 'template' | 'theme' | 'audit'>('sections');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useState(() => {
    if (currentUser?.id) {
      loadSiteData(currentUser.id);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sectionsOrder = config?.sections_order || sections.map((s) => s.key);
  const currentTemplate = config?.template_key || 'freelancer';

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...sectionsOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);

    updateSectionsOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getSectionConfig = (key: string) => {
    return sectionConfigs.find((s) => s.section_key === key);
  };

  const getSectionStatus = (key: string) => {
    const config = getSectionConfig(key);
    if (!config) return 'auto';
    return config.override_mode;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Site Builder</h1>
              <p className="text-sm text-gray-500">Personalize seu site pessoal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Alterações não salvas
              </span>
            )}

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`p-2 rounded-md transition-colors ${
                    previewMode === mode
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <button
              onClick={() => runAudit()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Auditar</span>
            </button>

            <button
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-t border-gray-100">
          {[
            { id: 'sections' as const, label: 'Seções', icon: LayoutTemplate },
            { id: 'template' as const, label: 'Template', icon: LayoutTemplate },
            { id: 'theme' as const, label: 'Tema', icon: Settings2 },
            { id: 'audit' as const, label: 'Auditoria', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-130px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'sections' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 space-y-2"
              >
                <p className="text-xs text-gray-500 mb-4">
                  Arraste para reordenar. Clique para ativar/desativar.
                </p>

                {sectionsOrder.map((key, index) => {
                  const section = sections.find((s) => s.key === key);
                  if (!section) return null;

                  const status = getSectionStatus(key);
                  const statusColor =
                    status === 'forced_on'
                      ? 'bg-green-100 text-green-700'
                      : status === 'forced_off'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600';

                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {section.label}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {section.source}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleSection(key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {status === 'forced_on' ? (
                          <>
                            <Check className="w-3 h-3" />
                            ON
                          </>
                        ) : status === 'forced_off' ? (
                          <>
                            <X className="w-3 h-3" />
                            OFF
                          </>
                        ) : (
                          'AUTO'
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'template' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 space-y-4"
              >
                <p className="text-xs text-gray-500 mb-4">
                  Escolha um template base para seu site.
                </p>

                {Object.values(templates).map((template) => (
                  <button
                    key={template.key}
                    onClick={() => applyTemplate(template.key)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      currentTemplate === template.key
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: template.theme.primaryColor + '20' }}
                      >
                        <LayoutTemplate className="w-4 h-4" style={{ color: template.theme.primaryColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{template.label}</p>
                        <p className="text-xs text-gray-500">{template.key}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === 'theme' && config && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={config.theme_settings.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Destaque
                  </label>
                  <input
                    type="color"
                    value={config.theme_settings.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={config.theme_settings.bgColor}
                    onChange={(e) => updateTheme({ bgColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonte
                  </label>
                  <select
                    value={config.theme_settings.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                  </select>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 space-y-6"
              >
                {auditResult ? (
                  <>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {auditResult.score}
                      </div>
                      <p className="text-sm text-gray-500">de 100 pontos</p>
                      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${auditResult.score}%` }}
                        />
                      </div>
                    </div>

                    {auditResult.suggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Sugestões</h3>
                        <div className="space-y-2">
                          {auditResult.suggestions.map((suggestion, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border ${
                                suggestion.priority === 'high'
                                  ? 'border-red-200 bg-red-50'
                                  : suggestion.priority === 'medium'
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <p className="text-sm font-medium capitalize">
                                {suggestion.section.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {suggestion.suggestion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {auditResult.suggestions.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-sm font-medium text-gray-900">
                          Parabéns!
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Seu site está completo e bem configurado.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Clique em "Auditar" para analisar seu site.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-8 bg-gray-100">
          <div className="mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <iframe
              src={`/${currentUser?.username || ''}?preview=true`}
              className={`w-full transition-all ${
                previewMode === 'desktop'
                  ? 'h-[800px]'
                  : previewMode === 'tablet'
                  ? 'h-[600px] w-[768px] mx-auto'
                  : 'h-[500px] w-[375px] mx-auto'
              }`}
              title="Site Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
