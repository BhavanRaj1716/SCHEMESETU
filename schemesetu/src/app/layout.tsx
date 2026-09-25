import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import { APP_CONFIG } from '@/config/app';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Self-hosted via next/font — no external Google DNS round-trip, auto font-display:swap
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600'],
  variable: '--font-devanagari',
  display: 'swap',
  preload: false, // Only preload if Devanagari is the default UI language
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600'],
  variable: '--font-tamil',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${notoDevanagari.variable} ${notoTamil.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans bg-off-white text-near-black">
        {/* Skip to content — WCAG 2.1 AA */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <Header />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
