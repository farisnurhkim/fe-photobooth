'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LayoutDashboard,
  BarChart2,
  CalendarDays,
  ScanQrCode,
  LogOut,
  User,
  MoreVertical,
  Package,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/schedules', label: 'Schedules', icon: Clock },
  { href: '/admin/scanner', label: 'Scanner', icon: ScanQrCode },
];

export default function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user as any;

  return (
    <aside className={cn("w-[220px] bg-white border-r border-border flex flex-col px-3 py-5 gap-3 h-full shadow-sm **:outline-none **:ring-0", className)}>
      {/* Logo */}
      <div className="px-2 pb-3 border-b border-border">
        <span className="text-sm font-bold text-foreground tracking-tight whitespace-nowrap">SnapBook Admin</span>
      </div>

      {/* User Card */}
      <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3 py-2.5">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">{user?.name ?? 'Admin'}</span>
          <span className="text-[0.65rem] text-muted-foreground">Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8rem] font-medium no-underline transition-colors duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <Separator className="my-1" />

        {/* Profile row + popover */}
        <Popover>
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.75rem] font-semibold text-foreground truncate">
                  {user?.name
                    ? user.name.length > 13
                      ? user.name.slice(0, 13) + '…'
                      : user.name
                    : 'Admin'}
                </span>
              </div>
            </div>

            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                "h-7 w-7 shrink-0 text-muted-foreground cursor-pointer"
              )}
              aria-label="Profile menu"
            >
              <MoreVertical size={15} />
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="end"
              className="w-48 p-1 rounded-xl shadow-lg border border-border animate-in fade-in-0 zoom-in-95 duration-150"
            >
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.8rem] text-red-500 hover:bg-red-50 transition-colors w-full cursor-pointer border-none bg-transparent text-left"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </PopoverContent>
          </div>
        </Popover>
      </div>
    </aside>
  );
}
