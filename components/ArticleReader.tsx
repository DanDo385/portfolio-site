'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SITE } from '@/lib/constants';
import { printArticlePdf } from '@/lib/articlePrint';
import {
  DEFAULT_READING_PREFS,
  READING_FONTS,
  READING_PRESETS,
  getFontFamily,
  loadReadingPrefs,
  markdownToPlainText,
  saveReadingPrefs,
  type ReadingPrefs,
} from '@/lib/reading';
import { categoryClass, formatDate, projectPath } from '@/lib/utils';
import { ArticleMarkdown } from './ArticleMarkdown';

interface RelatedProject {
  title: string;
  slug: string;
}

interface ArticleReaderProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  slug: string;
  body: string;
  relatedProject?: RelatedProject;
  loomEmbed?: string | null;
}

export function ArticleReader({
  title,
  excerpt,
  category,
  date,
  slug,
  body,
  relatedProject,
  loomEmbed,
}: ArticleReaderProps) {
  const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULT_READING_PREFS);
  const [readingOpen, setReadingOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shareNote, setShareNote] = useState('');
  const readingContentRef = useRef<HTMLDivElement>(null);
  const articleUrl = `${SITE.url}/writing/${slug}/`;

  useEffect(() => {
    setPrefs(loadReadingPrefs());
  }, []);

  useEffect(() => {
    if (readingOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [readingOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readingOpen) setReadingOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [readingOpen]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  const updatePrefs = useCallback((next: ReadingPrefs) => {
    setPrefs(next);
    saveReadingPrefs(next);
  }, []);

  const applyPreset = useCallback(
    (preset: (typeof READING_PRESETS)[number]) => {
      updatePrefs({
        fontId: preset.fontId,
        foreground: preset.foreground,
        background: preset.background,
      });
    },
    [updatePrefs]
  );

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const toggleSpeech = useCallback(() => {
    if (speaking) {
      stopSpeech();
      return;
    }
    const text = `${title}. ${excerpt}. ${markdownToPlainText(body)}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [body, excerpt, speaking, stopSpeech, title]);

  const shareArticle = useCallback(async () => {
    const shareData = { title, text: excerpt, url: articleUrl };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(articleUrl);
      setShareNote('Link copied');
    } catch {
      /* user cancelled share */
    }
    window.setTimeout(() => setShareNote(''), 2200);
  }, [articleUrl, excerpt, title]);

  const openReading = useCallback(() => {
    setPrefs(loadReadingPrefs());
    setReadingOpen(true);
  }, []);

  const exportPdf = useCallback(() => {
    printArticlePdf({
      title,
      excerpt,
      body,
      fontId: prefs.fontId,
      foreground: prefs.foreground,
      background: prefs.background,
    });
  }, [body, excerpt, prefs, title]);

  const readingStyle = {
    backgroundColor: prefs.background,
    color: prefs.foreground,
    fontFamily: getFontFamily(prefs.fontId),
  } as const;

  return (
    <>
      <header className="article-header">
        <div className="writing-meta">
          <span className={`writing-cat ${categoryClass(category)}`}>{category}</span>
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
        <h1>{title}</h1>
        <p className="article-excerpt">{excerpt}</p>
      </header>

      <div className="article-tools">
        <button type="button" className="btn btn-primary" onClick={openReading}>
          Reading view
        </button>
        <button type="button" className="btn" onClick={toggleSpeech}>
          {speaking ? 'Stop audio' : 'Play audio'}
        </button>
        <button type="button" className="btn" onClick={exportPdf}>
          Export PDF
        </button>
        <button type="button" className="btn" onClick={shareArticle}>
          Share
        </button>
        {shareNote && <span className="article-tools-note">{shareNote}</span>}
      </div>

      {loomEmbed && (
        <div className="loom-embed article-loom">
          <iframe src={loomEmbed} loading="lazy" allowFullScreen title="Article video" />
        </div>
      )}

      <ArticleMarkdown body={body} />

      {relatedProject && (
        <p className="article-related">
          Related project: <Link href={projectPath(relatedProject.slug)}>{relatedProject.title}</Link>
        </p>
      )}

      {readingOpen && (
        <div
          className="reading-modal open"
          role="dialog"
          aria-modal="true"
          aria-label="Reading view"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReadingOpen(false);
          }}
        >
          <div className="reading-modal-body">
            <div className="reading-controls">
              <div className="reading-controls-head">
                <span className="reading-controls-label">Reading template</span>
                <button
                  type="button"
                  className="reading-modal-close"
                  aria-label="Close reading view"
                  onClick={() => setReadingOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="reading-presets">
                {READING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="reading-preset"
                    style={{ background: preset.background, color: preset.foreground }}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="reading-fields">
                <label className="reading-field">
                  <span>Font</span>
                  <select
                    value={prefs.fontId}
                    onChange={(e) => updatePrefs({ ...prefs, fontId: e.target.value })}
                  >
                    {READING_FONTS.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="reading-field">
                  <span>Text</span>
                  <input
                    type="color"
                    value={prefs.foreground}
                    onChange={(e) => updatePrefs({ ...prefs, foreground: e.target.value })}
                    aria-label="Text color"
                  />
                </label>
                <label className="reading-field">
                  <span>Background</span>
                  <input
                    type="color"
                    value={prefs.background}
                    onChange={(e) => updatePrefs({ ...prefs, background: e.target.value })}
                    aria-label="Background color"
                  />
                </label>
              </div>

              <div className="reading-actions">
                <button type="button" className="btn" onClick={toggleSpeech}>
                  {speaking ? 'Stop audio' : 'Play audio'}
                </button>
                <button type="button" className="btn" onClick={exportPdf}>
                  Export PDF
                </button>
                <button type="button" className="btn" onClick={shareArticle}>
                  Share
                </button>
              </div>
            </div>

            <div className="reading-scroll" style={readingStyle}>
              <div ref={readingContentRef} className="reading-content prose">
                <h1>{title}</h1>
                <p className="reading-excerpt">{excerpt}</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
