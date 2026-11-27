import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import PackagePreview from "@/components/home/PackagePreview";
import Footer from "@/components/home/Footer";
import SessionProvider from "@/components/providers/session-provider";

import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Home",
  description: "Book creative photography sessions with Snapbook. High-quality photography services for any occasion.",
  openGraph: {
    title: "Snapbook - Home",
    description: "Book creative photography sessions with Snapbook. High-quality photography services for any occasion.",
    url: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Snapbook",
    "description": "Creative photography booking services.",
    "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    "image": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/favicon.ico`,
  };

  return (
    <SessionProvider>
      <Script
        id="home-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <Features />
        <PackagePreview />
        <Footer />
      </main>
    </SessionProvider>
  );
}
