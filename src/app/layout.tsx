import { requestLocale } from '@/locales/server';
import { LocaleProvider } from '@/locales/LocaleProvider';
import { LOCALES_CONFIG } from '@/config/i18n-registry';
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: '#FF2E54',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PDFConverter - Free Online PDF & Document Suite',
  description: 'Convert, organize and preview PDF, Office and image files. Some tools run in your browser, and others use a conversion service.',
  metadataBase: new URL('https://www.pdfconverter.space'),
  alternates: {
    canonical: 'https://www.pdfconverter.space',
  },
  openGraph: {
    title: 'PDFConverter - Free Online PDF & Document Suite',
    description: 'Convert, edit, and preview your PDF, Office, and image files online for free with no account required.',
    url: 'https://www.pdfconverter.space',
    siteName: 'PDFConverter',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFConverter - Free Online PDF & Document Suite',
    description: 'Convert, edit, and preview your PDF, Office, and image files online for free with no account required.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await requestLocale();
  return (
    <html lang={locale} dir={LOCALES_CONFIG[locale].dir} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-darkBg dark:text-slate-100 transition-colors duration-200 antialiased">
        <Script
  id="google-tag-manager"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-TS4FJVCL');
    `,
  }}
/>

<noscript>
  <iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-TS4FJVCL"
    height="0"
    width="0"
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>
        <LocaleProvider locale={locale}><ThemeProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider></LocaleProvider>
      </body>
    </html>
  );
}
