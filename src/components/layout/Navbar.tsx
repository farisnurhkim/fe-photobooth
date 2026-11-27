"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavItems, UserMenu } from "./NavComponents";
import { MobileMenu } from "./MobileMenu";
import type { NavUser } from "./NavComponents";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Packages", href: "/packages" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleLinks = (mounted && isLoggedIn)
    ? [...NAV_LINKS, { label: "My Bookings", href: "/my-bookings" }]
    : NAV_LINKS;

  const user: NavUser | null = isLoggedIn
    ? {
        name: (session?.user as any)?.name ?? "User",
        email: (session?.user as any)?.email ?? "",
        image: (session?.user as any)?.image ?? undefined,
        role: (session?.user as any)?.role ?? "user",
      }
    : null;

  return (
    <motion.nav
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-neutral-100/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link
            href="/"
            id="navbar-logo"
            className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity"
          >
            <span className="text-neutral-900">Snap</span>
            <span className="text-neutral-400">Book</span>
          </Link>

          {/* ── Desktop Nav Links (center) ── */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <NavItems links={visibleLinks} pathname={pathname} />
          </div>

          {/* ── Right Section ── */}
          <div className="flex items-center gap-2">
            {/* Auth Actions */}
            {(mounted && isLoggedIn && user) ? (
              <UserMenu user={user} />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  id="nav-login"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  id="nav-register"
                  className="text-sm font-semibold bg-neutral-900 text-white px-4 py-1.5 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <MobileMenu user={user} isLoggedIn={mounted ? isLoggedIn : false} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
