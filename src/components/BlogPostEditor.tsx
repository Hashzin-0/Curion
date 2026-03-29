'use client';

import React from 'react';
import DOMPurify from 'dompurify';

interface BlogPostEditorProps {
  content: string;
  className?: string;
}

export function BlogPostEditor({ content, className }: BlogPostEditorProps) {
  return (
    <div className={className}>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
    </div>
  );
}
