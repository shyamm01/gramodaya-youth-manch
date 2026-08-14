import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/src/components/layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://gramodayarasoolpur.org'),
  title: {
    default: 'ग्रामोदय यूथ मंच - रसूलपुर | Gramodaya Youth Manch',
    template: '%s | ग्रामोदय यूथ मंच रसूलपुर',
  },
  description:
    'ग्रामोदय यूथ मंच, ग्राम रसूलपुर, ग्राम पंचायत बहेरा। गांव के युवाओं, परिवारों और बुजुर्गों को एकजुट कर ग्राम विकास, शिक्षा, स्वच्छता और सेवा के लिए समर्पित डिजिटल मंच।',
  keywords: [
    'Gramodaya Youth Manch',
    'Rasoolpur',
    'Bahera',
    'Gram Panchayat',
    'Village Portal',
    'ग्रामोदय यूथ मंच',
    'रसूलपुर',
    'बहेरा',
  ],
  authors: [{ name: 'Gramodaya Youth Manch' }],
  creator: 'Gramodaya Youth Manch Core Team',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'ग्रामोदय यूथ मंच - रसूलपुर (Gramodaya Youth Manch)',
    description: 'युवा शक्ति से ग्रामोदय की ओर | Yuva Shakti • Gram Vikas • Ujjwal Bhavishya',
    url: 'https://gramodayarasoolpur.org',
    siteName: 'Gramodaya Youth Manch',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a2f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { ThemeProvider } from '@/src/components/common';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] text-[#1E293B] dark:text-[#F8FAFC] flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900 transition-colors duration-200">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
