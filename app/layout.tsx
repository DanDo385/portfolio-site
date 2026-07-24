import type { Metadata } from 'next';
import { JetBrains_Mono, Newsreader, Source_Sans_3 } from 'next/font/google';
import { SITE } from '@/lib/constants';
import './globals.css';

const display = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'profile',
    url: SITE.url,
    title: SITE.name,
    description: SITE.description,
    siteName: 'magro.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('magro-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.setAttribute('data-theme','light');}}catch(e){}try{var r=document.documentElement;var dev=${process.env.NODE_ENV === 'development' ? 'true' : 'false'};var seen=!dev&&!!sessionStorage.getItem('magro-intro-seen');if(location.pathname==='/'&&!seen&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('intro-active');}else{r.classList.add('intro-skipped');}}catch(e){document.documentElement.classList.add('intro-skipped');}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
