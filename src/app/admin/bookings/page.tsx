'use client';

import * as React from "react";
import {
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
  Package,
  User,
  Clock,
  CreditCard,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getAdminBookings, getDashboardAnalytics, cancelBooking, BookingItem } from "@/lib/adminApi";

const STATUS_OPTIONS = ["All", "Confirmed", "Pending", "Cancelled", "Completed"];

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [totalBookings, setTotalBookings] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [activeBookingsCount, setActiveBookingsCount] = React.useState(0);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingItem | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, analyticsRes] = await Promise.all([
        getAdminBookings(
          undefined,
          currentPage,
          10,
          statusFilter,
          dateRange.from?.toISOString(),
          dateRange.to?.toISOString(),
          debouncedSearch
        ),
        getDashboardAnalytics()
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
        setTotalBookings(bookingsRes.totalData);
        setTotalPages(bookingsRes.totalPages);
      }

      if (analyticsRes.success) {
        setActiveBookingsCount(analyticsRes.data.bookingCount);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings directory.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, dateRange, debouncedSearch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelBooking = async (id: string) => {
    const reason = window.prompt("Reason for cancellation:");
    if (reason === null) return;

    try {
      const res = await cancelBooking(id, reason || "Cancelled by Admin");
      if (res.success) {
        toast.success("Booking cancelled successfully.");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return { color: "text-emerald-500", dot: "bg-emerald-500" };
      case "PENDING":
        return { color: "text-orange-500", dot: "bg-orange-500" };
      case "CANCELLED":
        return { color: "text-rose-500", dot: "bg-rose-500" };
      case "COMPLETED":
        return { color: "text-emerald-500", dot: "bg-emerald-500" };
      default:
        return { color: "text-slate-500", dot: "bg-slate-500" };
    }
  };

  const getPackageColor = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes("EDITORIAL")) return "bg-blue-50 text-blue-600 border-blue-100";
    if (n.includes("MINI")) return "bg-amber-50 text-amber-600 border-amber-100";
    if (n.includes("COMMERCIAL")) return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-slate-50 text-slate-500 border-slate-100";
  };

  const exportCSV = () => {
    // Simple frontend CSV generation for demonstration
    const headers = ["Booking Code", "Client Name", "Email", "Package", "Date", "Time", "Amount", "Status"];
    const rows = bookings.map(b => [
      b.kode_booking,
      b.user_id?.nama_lengkap || "N/A",
      b.user_id?.email || "N/A",
      b.package_id?.nama_paket || "N/A",
      b.schedule_date_id ? formatDate(b.schedule_date_id.date) : "N/A",
      "TBD", // Time handled separately if needed
      b.package_id?.harga ? formatCurrency(b.package_id.harga) : "$0.00",
      b.status_booking
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-amber-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-[0.2em] text-amber-600 uppercase">
              Studio Management
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Bookings Directory
            </h1>
            <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
              Manage your photography sessions, track client history, and monitor studio capacity in one editorial view.
            </p>
          </div>
          <Button
            onClick={exportCSV}
            className="bg-[#525252] hover:bg-[#404040] text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="font-semibold">Export CSV</span>
          </Button>
        </header>

        {/* Filters & Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Filters Card */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div className="space-y-4 w-full sm:w-auto">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Filter by Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "secondary"}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "rounded-full px-6 transition-all duration-300 h-10",
                        statusFilter === status
                          ? "bg-[#525252] text-white hover:bg-[#404040]"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-none"
                      )}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 w-full sm:w-auto">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Date Range</p>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full sm:w-[240px] justify-start text-left font-normal h-14 rounded-xl bg-slate-50 border-none hover:bg-slate-100 transition-colors",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                        {dateRange.from ? formatDate(dateRange.from) : "Start Date"}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {dateRange.to ? `- ${formatDate(dateRange.to)}` : "Select Range"}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        setDateRange({ from: range?.from, to: range?.to });
                        setCurrentPage(1);
                      }}
                      initialFocus
                      className="p-4"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Active Bookings Card */}
          <Card className="bg-[#FDE047] border-none shadow-sm rounded-3xl overflow-hidden group">
            <CardContent className="p-8 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-amber-800 uppercase opacity-80">Total Value Bookings</p>
                <h2 className="text-6xl font-bold text-amber-950 tracking-tighter">
                  {activeBookingsCount}
                </h2>
              </div>
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-8 h-8 text-amber-950" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by client name or email..."
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-amber-400 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <p className="text-slate-400 font-medium italic">Fetching latest directory data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-300" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-800">No bookings found</h3>
                <p className="text-slate-400">Try adjusting your filters or search query.</p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                onClick={() => {
                  setStatusFilter("All");
                  setDateRange({ from: undefined, to: undefined });
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="py-6 px-8 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Client Name</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Package</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Date & Time</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Amount</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Status</TableHead>
                  <TableHead className="py-6 px-8 text-[10px] font-bold tracking-widest text-slate-400 uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {bookings.map((booking, index) => {
                    const statusCfg = getStatusConfig(booking.status_booking);
                    const packageCfg = getPackageColor(booking.package_id?.nama_paket || "");

                    return (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="group hover:bg-slate-50/50 transition-colors border-slate-50"
                      >
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.user_id?.nama_lengkap || "Anon"}`}
                                alt={booking.user_id?.nama_lengkap}
                              />
                              <AvatarFallback className="bg-slate-100 text-slate-400 text-xs font-bold">
                                {booking.user_id?.nama_lengkap?.split(' ').map(n => n[0]).join('') || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-lg tracking-tight leading-tight">
                                {booking.user_id?.nama_lengkap || "Unknown Client"}
                              </span>
                              <span className="text-sm text-slate-400 font-medium">
                                {booking.user_id?.email || "No email provided"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "w-fit text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md border-2",
                                packageCfg
                              )}
                            >
                              {booking.package_id?.nama_paket || "Unknown Package"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">
                              {booking.schedule_date_id ? formatDate(booking.schedule_date_id.date) : "N/A"}
                            </span>
                            <span className="text-xs text-slate-400 font-bold tracking-wide">
                              CODE: {booking.kode_booking}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="text-xl font-bold text-slate-900 tracking-tight">
                            {booking.package_id?.harga ? formatCurrency(booking.package_id.harga) : "$0.00"}
                          </span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", statusCfg.dot)} />
                            <span className={cn("text-[10px] font-black tracking-widest uppercase", statusCfg.color)}>
                              {booking.status_booking}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-1.5 flex items-center justify-center border-none bg-transparent">
                              <MoreVertical className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl p-2 min-w-[160px]">
                              <DropdownMenuItem
                                onClick={() => setSelectedBooking(booking)}
                                className="rounded-lg font-semibold text-slate-600 py-2.5 cursor-pointer"
                              >
                                View Details
                              </DropdownMenuItem>
                              {booking.status_booking.toLowerCase() === 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelBooking(booking._id)}
                                  className="rounded-lg font-semibold text-rose-500 py-2.5 cursor-pointer focus:text-rose-600 focus:bg-rose-50"
                                >
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}

          {/* Footer / Pagination */}
          {!isLoading && bookings.length > 0 && (
            <div className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/30 border-t border-slate-50">
              <p className="text-sm font-medium text-slate-400">
                Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalBookings)}</span> of <span className="text-slate-900 font-bold">{totalBookings}</span> bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 text-slate-300 hover:text-slate-600 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "rounded-full h-10 w-10 font-bold shadow-md transition-all",
                      currentPage === i + 1
                        ? "bg-[#525252] text-white hover:bg-[#404040]"
                        : "bg-transparent text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        {selectedBooking && (
          <DialogContent className="sm:max-w-[480px] p-0 gap-0 rounded-2xl overflow-hidden bg-white border-none shadow-2xl">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800 mb-1">
                  Booking Details
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm font-medium">
                  #{selectedBooking.kode_booking}
                </DialogDescription>
              </div>
              <Badge className={cn(
                "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border-none",
                selectedBooking.status_booking.toLowerCase() === 'confirmed' && 'bg-emerald-50 text-emerald-600',
                selectedBooking.status_booking.toLowerCase() === 'pending' && 'bg-amber-50 text-amber-600',
                selectedBooking.status_booking.toLowerCase() === 'cancelled' && 'bg-rose-50 text-rose-600',
                selectedBooking.status_booking.toLowerCase() === 'completed' && 'bg-emerald-50 text-emerald-600',
              )}>
                {selectedBooking.status_booking}
              </Badge>
            </div>

            {/* Body */}
            <div className="px-8 py-8 space-y-8 max-h-[65vh] overflow-y-auto">
              {/* Client Information */}
              <div>
                <h4 className="text-[11px] font-bold text-amber-700/80 uppercase tracking-[0.15em] mb-4">
                  Client Information
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{selectedBooking.user_id.nama_lengkap}</p>
                    <p className="text-sm font-medium text-slate-500">{selectedBooking.user_id.email}</p>
                  </div>
                </div>
              </div>

              {/* Package and Schedule */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[11px] font-bold text-amber-700/80 uppercase tracking-[0.15em] mb-4">
                    Package
                  </h4>
                  <p className="text-sm font-bold text-slate-800 mb-1">{selectedBooking.package_id?.nama_paket || 'N/A'}</p>
                  <p className="text-sm font-medium text-slate-500">
                    {/* Placeholder for package ratio or desc if available, fallback to default */}
                    4:5 Portrait Ratio
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-amber-700/80 uppercase tracking-[0.15em] mb-4">
                    Schedule
                  </h4>
                  <p className="text-sm font-bold text-slate-800 mb-1">
                    {selectedBooking.schedule_date_id?.date ? formatDate(selectedBooking.schedule_date_id.date) : 'N/A'}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    {(() => {
                      const slot = selectedBooking.schedule_date_id?.slots?.find(
                        s => s._id === selectedBooking.schedule_slot_ids?.[0]
                      );
                      return slot ? `${slot.start_time} - ${slot.end_time}` : 'N/A';
                    })()}
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-6 relative">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[11px] font-bold text-amber-700/80 uppercase tracking-[0.15em]">
                    Payment Summary
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {selectedBooking.payment?.status_bayar === 'settlement' ? 'Berhasil' : selectedBooking.payment?.status_bayar || 'N/A'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Method: <span className="capitalize">{selectedBooking.payment?.metode_bayar?.replace('_', ' ') || 'N/A'}</span>
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-slate-800">
                    {selectedBooking.package_id?.harga ? formatCurrency(selectedBooking.package_id.harga) : 'Free'}
                  </p>
                  <CreditCard size={24} className="text-slate-300" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-8 py-6 border-t border-slate-100 flex gap-4">
              <Button 
                onClick={() => setSelectedBooking(null)}
                className="flex-1 rounded-full bg-[#525252] hover:bg-[#404040] text-white py-6 text-sm font-bold transition-all shadow-none"
              >
                Close
              </Button>
              {selectedBooking.status_booking.toLowerCase() === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                  className="flex-1 rounded-full border-2 border-rose-800/20 text-rose-800 hover:bg-rose-50 hover:text-rose-900 py-6 text-sm font-bold transition-all shadow-none"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
