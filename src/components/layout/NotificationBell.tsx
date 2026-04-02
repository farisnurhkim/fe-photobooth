"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar, Package, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  icon: "booking" | "package" | "gallery";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: "booking",
    title: "Booking Confirmed",
    description: "Your 'Editorial' session for Saturday, Oct 24th is confirmed.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    icon: "package",
    title: "New Package Available",
    description: "Check out our new 'Holiday Studio' limited edition package.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "3",
    icon: "gallery",
    title: "Gallery Updated",
    description: "Your digital gallery from 'The Essential' session is now ready.",
    time: "2 days ago",
    read: true,
  },
];

const iconMap = {
  booking: { icon: Calendar, bg: "bg-orange-50", color: "text-orange-500" },
  package: { icon: Package, bg: "bg-neutral-100", color: "text-neutral-500" },
  gallery: { icon: Image, bg: "bg-blue-50", color: "text-blue-500" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-50">
                <span className="font-semibold text-neutral-900 text-sm">
                  Notifications
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X size={13} className="text-neutral-500" />
                </button>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-neutral-50">
                {notifications.map((notif) => {
                  const { icon: Icon, bg, color } = iconMap[notif.icon];
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex gap-3 px-4 py-4 hover:bg-neutral-50 transition-colors cursor-pointer",
                        !notif.read && "bg-neutral-50/60"
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                          bg
                        )}
                      >
                        <Icon size={16} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                          {notif.description}
                        </p>
                        <p className="text-[10px] text-neutral-300 mt-1.5 uppercase tracking-wide font-medium">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <button
                onClick={markAllRead}
                className="w-full py-3.5 text-xs font-semibold tracking-widest text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors uppercase border-t border-neutral-50"
              >
                Mark All as Read
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
