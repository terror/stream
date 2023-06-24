import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import Renderer from './Renderer';

export const Markdown = ({ content }: { content: string }) => (
  <ReactMarkdown
    children={content}
    components={Renderer()}
    rehypePlugins={[rehypeKatex]}
    remarkPlugins={[remarkGfm, remarkMath]}
    skipHtml
  />
);
