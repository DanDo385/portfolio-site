interface ExternalDemoFrameProps {
  src: string;
  title: string;
  /** Fullscreen DemoShell uses eager; project-page embeds can lazy-load. */
  loading?: 'eager' | 'lazy';
  /** `shell` fills the DemoShell viewport; `embed` matches project-page panels. */
  variant?: 'shell' | 'embed';
}

/**
 * Embed a live Vercel app the same way agent-machine embeds its static demo:
 * full-bleed iframe with no sandbox. Sandboxing breaks cross-origin Next.js
 * apps (module scripts, RSC, storage) when the origin differs from magro.dev.
 */
export function ExternalDemoFrame({
  src,
  title,
  loading = 'eager',
  variant = 'shell',
}: ExternalDemoFrameProps) {
  const wrapClass = variant === 'shell' ? 'demo-shell-frame-wrap' : 'amd-frame-wrap';
  const frameClass = variant === 'shell' ? 'demo-shell-frame' : 'amd-frame';

  return (
    <div className={wrapClass}>
      <iframe
        title={title}
        src={src}
        className={frameClass}
        loading={loading}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
}
