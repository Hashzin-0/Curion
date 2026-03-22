'use client';

import { useState } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { RichEditor } from '@/components/RichEditor';
import type { BlogPost, BlogCategory } from '@/types/site';

export function BlogPostEditor() {
  const { posts, createPost, updatePost, deletePost, togglePostPublish } =
    useSiteBuilderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Posts do Blog</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Novo Post</span>
        </button>
      </div>

      <div className="space-y-2">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isEditing={editingId === post.id}
            onEdit={() => setEditingId(post.id)}
            onCancel={() => setEditingId(null)}
            onDelete={() => deletePost(post.id)}
            onTogglePublish={() => togglePostPublish(post.id)}
          />
        ))}
      </div>

      {posts.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhum post publicado.</p>
          <p className="text-xs mt-1">Clique em "Novo Post" para criar.</p>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PostForm
              onSave={async (data) => {
                await createPost({
                  ...data,
                  tags: data.tags || [],
                  is_published: data.is_published || false,
                } as BlogPost);
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

interface PostCardProps {
  post: BlogPost;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

function PostCard({
  post,
  isEditing,
  onEdit,
  onCancel,
  onDelete,
  onTogglePublish,
}: PostCardProps) {
  const { updatePost } = useSiteBuilderStore();

  if (isEditing) {
    return (
      <PostForm
        initialData={post}
        onSave={async (data) => {
          await updatePost(post.id, data);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }

  const categoryLabels: Record<BlogCategory, string> = {
    projetos: 'Projetos',
    trajetoria: 'Trajetória',
    servicos: 'Serviços',
    livre: 'Livre',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              post.is_published
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {post.is_published ? 'Publicado' : 'Rascunho'}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {categoryLabels[post.category]}
          </span>
        </div>
        <h4 className="font-medium mt-1 truncate">{post.title}</h4>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {post.reading_time && <span>{post.reading_time} min de leitura</span>}
          {post.tags.length > 0 && (
            <span className="flex items-center gap-1">
              {post.tags.slice(0, 3).join(', ')}
              {post.tags.length > 3 && ` +${post.tags.length - 3}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePublish}
          className={`p-2 rounded-lg transition-colors ${
            post.is_published
              ? 'bg-green-50 hover:bg-green-100 text-green-600'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
          }`}
          title={post.is_published ? 'Despublicar' : 'Publicar'}
        >
          {post.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
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

interface PostFormProps {
  initialData?: BlogPost;
  onSave: (data: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}

function PostForm({ initialData, onSave, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState<BlogCategory>(
    initialData?.category || 'livre'
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    await onSave({
      title,
      excerpt: excerpt || null,
      content: content || null,
      category,
      tags,
      is_published: isPublished,
    });
    setIsSaving(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border border-primary/30 rounded-lg space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{initialData ? 'Editar Post' : 'Novo Post'}</h4>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt (resumo)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Resumo do post..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BlogCategory)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="livre">Livre</option>
            <option value="projetos">Projetos</option>
            <option value="trajetoria">Trajetória</option>
            <option value="servicos">Serviços</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Publicar
          </label>
          <label className="flex items-center gap-2 h-[42px] px-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">
              {isPublished ? 'Publicado' : 'Rascunho'}
            </span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo
          </label>
          <RichEditor
            content={content}
            onChange={setContent}
            placeholder="Escreva seu post..."
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Adicionar tag..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Adicionar
            </button>
          </div>
        </div>
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
          disabled={isSaving || !title.trim()}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
