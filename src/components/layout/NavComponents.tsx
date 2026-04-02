"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface NavUser {
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface UserMenuProps {
  user: NavUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
    toast.info("You have been logged out.");
  };

  return (
    <Popover>
      <PopoverTrigger
        id="user-menu-trigger"
        className="w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-neutral-200 transition-all duration-200 focus:outline-none cursor-pointer p-0 bg-transparent border-0 inline-flex items-center justify-center overflow-hidden"
      >
        <Avatar className="w-9 h-9">
          <AvatarImage src={user.image ?? ""} alt={user.name} />
          <AvatarFallback className="bg-neutral-800 text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-xl shadow-lg border border-neutral-100 bg-white p-1 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="px-3 py-3">
          <p className="text-sm font-semibold text-neutral-900 leading-tight">
            {user.name}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
        </div>

        <Separator className="my-1" />

        <div className="flex flex-col gap-0.5">
          <Link
            id="nav-my-bookings"
            href="/my-bookings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <Calendar size={15} className="text-neutral-400 shrink-0" />
            My Bookings
          </Link>

          <Link
            id="nav-account-settings"
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <Settings size={15} className="text-neutral-400 shrink-0" />
            Account Settings
          </Link>

          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <LayoutDashboard size={15} className="shrink-0" />
              Admin Dashboard
            </Link>
          )}
        </div>

        <Separator className="my-1" />

        <button
          id="nav-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer border-none bg-transparent text-left"
        >
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </PopoverContent>
    </Popover>
  );
}

interface NavItemsProps {
  links: { label: string; href: string }[];
  pathname: string;
  onLinkClick?: () => void;
  vertical?: boolean;
}

export function NavItems({
  links,
  pathname,
  onLinkClick,
  vertical = false,
}: NavItemsProps) {
  return (
    <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-8")}>
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" &&
            !link.href.startsWith("/#") &&
            pathname.startsWith(link.href));

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "relative inline-block text-sm font-medium transition-colors duration-200",
                vertical
                  ? cn(
                      "flex items-center gap-2 py-3 px-4 rounded-xl w-full",
                      isActive
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    )
                  : cn(
                      "pb-1",
                      isActive
                        ? "text-neutral-900 font-semibold"
                        : "text-neutral-500 hover:text-neutral-900"
                    )
              )}
            >
              {link.label}
              {!vertical && isActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
