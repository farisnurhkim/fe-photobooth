"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, LogOut, Home, Package, Sparkles, Calendar, User, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NavUser } from "./NavComponents";

interface MobileMenuProps {
  user: NavUser | null;
  isLoggedIn: boolean;
}

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Packages", href: "/#packages", icon: Package },
  { label: "Features", href: "/#features", icon: Sparkles },
  { label: "My Bookings", href: "/my-bookings", icon: Calendar },
];

export function MobileMenu({ user, isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  const handleLogout = async () => {
    setOpen(false);
    await signOut({ redirect: true, callbackUrl: "/login" });
    toast.info("You have been logged out.");
  };

  const visibleLinks = isLoggedIn
    ? NAV_LINKS
    : NAV_LINKS.filter((l) => l.href !== "/my-bookings");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        id="mobile-menu-trigger"
        render={
          <button
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Open menu"
          />
        }
      >
        <Menu size={20} className="text-neutral-700" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[300px] p-0 flex flex-col bg-white"
        showCloseButton={false}
      >
        {/* Header - Profile */}
        <SheetHeader className="px-5 py-5 border-b border-neutral-100 gap-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Guest"} />
              <AvatarFallback className="bg-neutral-800 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {isLoggedIn ? (
                <>
                  <SheetTitle className="text-sm font-semibold text-neutral-900 leading-tight">
                    {user?.name}
                  </SheetTitle>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {user?.email}
                  </p>
                </>
              ) : (
                <>
                  <SheetTitle className="text-sm font-semibold text-neutral-900">
                    Guest
                  </SheetTitle>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Sign in to your account
                  </Link>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {visibleLinks.map((link, i) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" &&
                  !link.href.startsWith("/#") &&
                  pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: open ? 1 : 0, x: open ? 0 : 16 }}
                  transition={{ delay: i * 0.06, duration: 0.22 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-white" : "text-neutral-400"}
                    />
                    {link.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100">
          {isLoggedIn ? (
            <>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Settings size={16} />
                Manage Account
              </Link>
              <Separator className="my-3" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <User size={15} />
              Sign In
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
