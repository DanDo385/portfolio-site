import { SITE } from '@/lib/constants';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export function siteShareImageElement() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#101419',
        backgroundImage:
          'radial-gradient(circle at 18% 12%, rgba(90,153,255,0.12), rgba(16,20,25,0) 55%)',
        color: '#e8ecf4',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#86b5ff',
            marginBottom: 28,
          }}
        >
          Daniel Magro
        </div>
        <div style={{ fontSize: 58, fontWeight: 600, lineHeight: 1.15, maxWidth: 980 }}>
          AI Engineering & Financial Systems
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 22,
          color: '#86b5ff',
          letterSpacing: '0.04em',
        }}
      >
        {SITE.url.replace('https://', '')}
      </div>
    </div>
  );
}
