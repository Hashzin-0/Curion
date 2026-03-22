'use client';

import { useState } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, GripVertical, X, Globe, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import type { ExternalSite } from '@/types/site';

const iconOptions = [
  { name: 'Link', icon: Globe },
  { name: 'GitHub', icon: Github },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'Twitter', icon: Twitter },
  { name: 'Instagram', icon: Instagram },
];

export function ExternalSitesEditor() {
  const { externalSites, createExternalSite, updateExternalSite, deleteExternalSite } =
    useSiteBuilderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Links Externos</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Novo Link</span>
        </button>
      </div>

      <div className="space-y-2">
        {externalSites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            isEditing={editingId === site.id}
            onEdit={() => setEditingId(site.id)}
            onCancel={() => setEditingId(null)}
            onDelete={() => deleteExternalSite(site.id)}
          />
        ))}
      </div>

      {externalSites.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhum link cadastrado.</p>
          <p className="text-xs mt-1">Adicione seus blogs e redes sociais.</p>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SiteForm
              onSave={async (data) => {
                await createExternalSite({
                  ...data,
                  icon: data.icon || 'Link',
                } as ExternalSite);
                setIsAdding(false);
              }}
              onCancel={() => setIsAdding(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SiteCardProps {
  site: ExternalSite;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function SiteCard({ site, isEditing, onEdit, onCancel, onDelete }: SiteCardProps) {
  const { updateExternalSite } = useSiteBuilderStore();
  const IconComponent = iconOptions.find((i) => i.name === site.icon)?.icon || Globe;

  if (isEditing) {
    return (
      <SiteForm
        initialData={site}
        onSave={async (data) => {
          await updateExternalSite(site.id, data);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: '#f3f4f6' }}
      >
        <IconComponent className="w-5 h-5 text-gray-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{site.name}</h4>
        <p className="text-sm text-gray-500 truncate">{site.url}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface SiteFormProps {
  initialData?: ExternalSite;
  onSave: (data: Partial<ExternalSite>) => Promise<void>;
  onCancel: () => void;
}

function SiteForm({ initialData, onSave, onCancel }: SiteFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || 'Link');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setIsSaving(true);
    await onSave({
      name,
      url,
      description: description || null,
      icon,
    });
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border border-primary/30 rounded-lg space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{initialData ? 'Editar Link' : 'Novo Link'}</h4>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Meu Blog, GitHub, LinkedIn"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL *
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ícone
        </label>
        <div className="flex gap-2">
          {iconOptions.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setIcon(name)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                icon === name
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição do link..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || !name.trim() || !url.trim()}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
