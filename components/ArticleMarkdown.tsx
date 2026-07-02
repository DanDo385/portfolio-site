import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleMarkdownProps {
  body: string;
  className?: string;
}

export function ArticleMarkdown({ body, className = 'article-body prose' }: ArticleMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
