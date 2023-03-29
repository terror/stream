import 'katex/dist/katex.min.css';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import Renderer from './Renderer';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => (
  <ReactMarkdown
    children={content}
    components={Renderer()}
    rehypePlugins={[rehypeKatex, rehypeHighlight]}
    remarkPlugins={[remarkGfm, remarkMath]}
    skipHtml
  />
);
