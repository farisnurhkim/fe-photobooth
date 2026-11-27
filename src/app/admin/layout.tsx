import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SessionProvider } from 'next-auth/react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'SnapBook Admin',
  description: 'Admin dashboard for SnapBook photobooth booking system',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin') {
    redirect('/');
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-[#f4f6f9] font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-screen sticky top-0 shrink-0">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden h-14 border-b border-border bg-white flex items-center justify-between px-4 sticky top-0 z-30">
            <span className="text-sm font-bold text-foreground">SnapBook Admin</span>
            
            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), "h-9 w-9 cursor-pointer")}>
                <Menu size={20} />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[220px] border-r-0">
                <AdminSidebar className="border-r-0 shadow-none" />
              </SheetContent>
            </Sheet>
          </header>

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
