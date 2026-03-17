
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

type Props = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export function RichEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Escreva algo incrível...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-4',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
      <div className="bg-slate-100 dark:bg-slate-900 p-2 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-white dark:bg-slate-800 text-blue-600' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-white dark:bg-slate-800 text-blue-600' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-white dark:bg-slate-800 text-blue-600' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-white dark:bg-slate-800 text-blue-600' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
