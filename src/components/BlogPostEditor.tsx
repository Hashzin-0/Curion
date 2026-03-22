'use client';

import React from 'react';

interface BlogPostEditorProps {
  content: string;
  className?: string;
}

export function BlogPostEditor({ content, className }: BlogPostEditorProps) {
  return (
    <div className={className}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
