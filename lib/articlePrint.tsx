import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPrintFontFamily, readingProseCss } from './reading';

const PRINT_FONT_LINK =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" />';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderArticleBodyHtml(markdown: string): string {
  return renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  );
}

export function printArticlePdf({
  title,
  excerpt,
  body,
  fontId,
  foreground,
  background,
}: {
  title: string;
  excerpt: string;
  body: string;
  fontId: string;
  foreground: string;
  background: string;
}): void {
  const family = getPrintFontFamily(fontId);
  const bodyHtml = renderArticleBodyHtml(body);
  const css = readingProseCss(family, foreground, background);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  ${PRINT_FONT_LINK}
  <style>${css}</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="excerpt">${escapeHtml(excerpt)}</p>
  ${bodyHtml}
</body>
</html>`);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  const triggerPrint = () => {
    win.focus();
    win.print();
    cleanup();
  };

  win.addEventListener('afterprint', cleanup, { once: true });
  window.setTimeout(triggerPrint, 350);
}
