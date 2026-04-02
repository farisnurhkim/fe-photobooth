import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import PackagePreview from "@/components/home/PackagePreview";
import Footer from "@/components/home/Footer";
import SessionProvider from "@/components/providers/session-provider";

export default function Home() {
  return (
    <SessionProvider>
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
