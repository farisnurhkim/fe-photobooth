import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  title: {
    template: '%s | Snapbook',
    default: 'Snapbook - Creative Photography Booking',
  },
  description: 'Join our community of elite photographers and curate your digital presence. Book creative photography sessions easily with Snapbook.',
  keywords: ['photography', 'booking', 'creative space', 'snapbook', 'photo session', 'photographer'],
  openGraph: {
    title: 'Snapbook - Creative Photography Booking',
    description: 'Book creative photography sessions easily with Snapbook.',
    url: '/',
    siteName: 'Snapbook',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snapbook - Creative Photography Booking',
    description: 'Book creative photography sessions easily with Snapbook.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
