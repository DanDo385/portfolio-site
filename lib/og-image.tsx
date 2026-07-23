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
        background: '#050810',
        backgroundImage:
          'radial-gradient(circle at 18% 12%, rgba(201,147,58,0.22), rgba(5,8,16,0) 55%)',
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
            color: '#c9933a',
            marginBottom: 28,
          }}
        >
          Daniel Magro
        </div>
        <div style={{ fontSize: 58, fontWeight: 600, lineHeight: 1.15, maxWidth: 980 }}>
          Institutional market judgment, with AI agents as leverage on technical finance
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 26, color: '#8d9ab5', maxWidth: 940, lineHeight: 1.4 }}>
          Institutional markets professional with practical technical capability and public proof
          of delivery.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 36,
            fontSize: 22,
            color: '#e0ad52',
            letterSpacing: '0.04em',
          }}
        >
          {SITE.url.replace('https://', '')}
        </div>
      </div>
    </div>
  );
}
