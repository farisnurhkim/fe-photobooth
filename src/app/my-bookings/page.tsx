"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar, Clock, Download, Share2, ShieldCheck, MoreVertical } from "lucide-react";
import QRCode from "react-qr-code";
import api from "@/lib/axios";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Script from "next/script";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { toPng } from "html-to-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MyBookingsContent() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const ticketRef = React.useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const processedBookings = React.useMemo(() => {
    let result = [...bookings];
    
    if (filter !== "All") {
      result = result.filter((b) => b.status_booking.toLowerCase() === filter.toLowerCase());
    }

    result.sort((a, b) => {
      const dateA = a.schedule_date_id?.date ? new Date(a.schedule_date_id.date).getTime() : new Date(a.createdAt || 0).getTime();
      const dateB = b.schedule_date_id?.date ? new Date(b.schedule_date_id.date).getTime() : new Date(b.createdAt || 0).getTime();
      
      if (sort === "Newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  }, [bookings, filter, sort]);

  useEffect(() => {
    if (processedBookings.length > 0 && !processedBookings.find(b => b._id === selectedBooking?._id)) {
      setSelectedBooking(processedBookings[0]);
    } else if (processedBookings.length === 0) {
      setSelectedBooking(null);
    }
  }, [processedBookings, selectedBooking]);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !selectedBooking) return;
    try {
      toast.info("Generating ticket image...");
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `ticket-${selectedBooking.kode_booking}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download ticket.");
    }
  };

  const handleShare = async () => {
    if (!selectedBooking) return;
    
    const pkg = selectedBooking.package_id || {};
    const text = `Booking Reference: ${selectedBooking.kode_booking}\nPackage: ${pkg.nama_paket}\nStatus: ${selectedBooking.status_booking.toUpperCase()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Booking Ticket",
          text: text,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (error: any) {
        if (error.name !== 'AbortError') {
           console.error("Share failed", error);
           toast.error("Failed to share ticket.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Booking details copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy details.");
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my-bookings", {
        params: { limit: 50 }, // Fetch more to ease pagination during development
      });
      if (res.data.success) {
        setBookings(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedBooking(res.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitCancelRefund = async () => {
    if (!bookingToCancel) return;
    if (!cancelReason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    const actionName = bookingToCancel.status_booking === 'pending' ? 'Cancel' : 'Refund';
    setIsCancelling(true);

    try {
      const res = await api.post(`/bookings/${bookingToCancel._id}/cancel`, {
        alasan_batal: cancelReason
      });
      if (res.data.success) {
        toast.success(`Booking ${actionName.toLowerCase()}ed successfully`);
        setIsCancelDialogOpen(false);
        fetchBookings();
      } else {
        toast.error(res.data.message || `Failed to ${actionName.toLowerCase()} booking`);
      }
    } catch (error: any) {
       console.error(`Failed to ${actionName.toLowerCase()} booking`, error);
       toast.error(error.response?.data?.message || `Failed to ${actionName.toLowerCase()} booking`);
    } finally {
      setIsCancelling(false);
    }
  };

  const openCancelDialog = (booking: any) => {
    setBookingToCancel(booking);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const handlePayNow = (token: string) => {
    // @ts-ignore
    window.snap.pay(token, {
      onSuccess: function(result: any){
        toast.success('Payment successful!');
        fetchBookings();
      },
      onPending: function(result: any){
        toast.success('Waiting your payment!');
        fetchBookings();
      },
      onError: function(result: any){
        toast.error('Payment failed!');
      },
      onClose: function(){
        toast.error('You closed the popup without finishing the payment.');
      }
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return { label: "CONFIRMED", bg: "bg-yellow-100", text: "text-amber-700" };
      case "completed":
        return { label: "COMPLETED", bg: "bg-gray-200", text: "text-gray-700" };
      case "cancelled":
        return { label: "CANCELLED", bg: "bg-red-100", text: "text-red-700" };
      case "pending":
      default:
        return { label: "PENDING", bg: "bg-orange-100", text: "text-orange-700" };
    }
  };

  const renderLeftPanel = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-800">Recent Activity</h2>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(val) => setFilter(val || "All")}>
              <SelectTrigger className="px-4 py-1.5 h-8 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 uppercase tracking-wider border-none ring-0 focus:ring-0 focus:ring-offset-0 outline-none shadow-none focus:outline-none focus-visible:ring-0">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#eee] shadow-xl p-1">
                <SelectItem value="All" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">All</SelectItem>
                <SelectItem value="Pending" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Pending</SelectItem>
                <SelectItem value="Confirmed" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Confirmed</SelectItem>
                <SelectItem value="Completed" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Completed</SelectItem>
                <SelectItem value="Cancelled" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(val) => setSort(val || "Newest")}>
              <SelectTrigger className="px-4 py-1.5 h-8 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 uppercase tracking-wider border-none ring-0 focus:ring-0 focus:ring-offset-0 outline-none shadow-none focus:outline-none focus-visible:ring-0 w-[110px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#eee] shadow-xl p-1">
                <SelectItem value="Newest" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Newest</SelectItem>
                <SelectItem value="Oldest" className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-500">
            You don't have any recent bookings.
          </div>
        ) : processedBookings.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-500">
            No bookings found for the selected filter.
          </div>
        ) : (
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {processedBookings.map((booking) => {
              const isSelected = selectedBooking?._id === booking._id;
              const pkg = booking.package_id || {};
              const dateObj = booking.schedule_date_id?.date ? parseISO(booking.schedule_date_id.date) : null;
              const statusCfg = getStatusConfig(booking.status_booking);
              
              const slot = booking.schedule_date_id?.slots?.find(
                (s: any) => s._id === booking.schedule_slot_ids?.[0]
              );
              let timeStr = slot ? slot.start_time : "TBD";
              if (slot && pkg.durasi_menit) {
                 // Try to estimate end time
                 const [h, m] = slot.start_time.split(':').map(Number);
                 const date = new Date();
                 date.setHours(h, m + pkg.durasi_menit);
                 const endH = String(date.getHours()).padStart(2, '0');
                 const endM = String(date.getMinutes()).padStart(2, '0');
                 timeStr = `${slot.start_time} - ${endH}:${endM}`;
              }

              return (
                <div
                  key={booking._id}
                  onClick={() => setSelectedBooking(booking)}
                  className={cn(
                    "flex items-center gap-3 sm:gap-6 p-4 sm:p-5 rounded-[2rem] cursor-pointer transition-all border",
                    isSelected
                      ? "bg-white border-transparent shadow-xl shadow-gray-200"
                      : "bg-[#f9f9f9] border-[#eee] hover:border-gray-300"
                  )}
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
                    {pkg.picture ? (
                      <img src={pkg.picture} alt={pkg.nama_paket} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                         No Img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2 flex-wrap sm:flex-nowrap">
                      <span className={cn("px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest whitespace-nowrap", statusCfg.bg, statusCfg.text)}>
                        {statusCfg.label}
                      </span>
                      <span className="font-bold text-gray-600 text-sm sm:text-base whitespace-nowrap">
                        {formatCurrency(pkg.harga || 0)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-2 truncate">
                      {pkg.nama_paket || "Unknown Package"}
                    </h3>

                    {booking.status_booking === 'pending' ? (
                       <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">Awaiting studio confirmation...</p>
                    ) : (
                      <div className="flex flex-col xl:flex-row xl:items-center gap-1.5 xl:gap-4 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {dateObj ? format(dateObj, 'MMM dd, yyyy') : '-'}
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {timeStr}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                     <div className="ml-1 sm:ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                       <DropdownMenu>
                         <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors focus:outline-none">
                           <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl border-[#eee] p-2">
                           {(booking.status_booking === 'pending' || booking.status_booking === 'confirmed') ? (
                             <DropdownMenuItem 
                               className="text-red-600 hover:text-red-700 focus:text-red-700 focus:bg-red-50 cursor-pointer font-semibold rounded-xl py-2"
                               onClick={() => openCancelDialog(booking)}
                             >
                               {booking.status_booking === 'pending' ? 'Cancel Booking' : 'Request Refund'}
                             </DropdownMenuItem>
                           ) : (
                             <DropdownMenuItem disabled className="font-semibold text-gray-400 py-2">
                               No actions available
                             </DropdownMenuItem>
                           )}
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderRightPanel = () => {
    if (!selectedBooking) return null;

    const pkg = selectedBooking.package_id || {};
    const dateObj = selectedBooking.schedule_date_id?.date ? parseISO(selectedBooking.schedule_date_id.date) : null;
    
    const slot = selectedBooking.schedule_date_id?.slots?.find(
        (s: any) => s._id === selectedBooking.schedule_slot_ids?.[0]
    );
    let timeStr = slot ? slot.start_time : "TBD";
    if (slot && pkg.durasi_menit) {
        const [h, m] = slot.start_time.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m + pkg.durasi_menit);
        const endH = String(d.getHours()).padStart(2, '0');
        const endM = String(d.getMinutes()).padStart(2, '0');
        timeStr = `${slot.start_time} - ${endH}:${endM}`;
    }

    const isConfirmed = selectedBooking.status_booking === 'confirmed' || selectedBooking.status_booking === 'completed';

    return (
      <div className="sticky top-28 bg-white rounded-[2rem] border border-[#eee] shadow-lg overflow-hidden flex flex-col h-fit min-h-[600px]">
        <div ref={ticketRef} className="bg-white">
          {/* Ticket Header */}
          <div className="bg-[#5c5c5c] text-white p-8 relative">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-2">
            Current Ticket
          </span>
          <h2 className="text-3xl font-medium mb-8">
            {pkg.nama_paket || 'Package Session'}
          </h2>

          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Booking Reference
              </span>
              <p className="font-bold text-lg">{selectedBooking.kode_booking}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Status
              </span>
              <p className={cn("font-bold tracking-widest", isConfirmed ? "text-yellow-500" : "text-gray-300")}>
                {isConfirmed ? 'VALID' : selectedBooking.status_booking.toUpperCase()}
              </p>
            </div>
          </div>

          {isConfirmed && (
             <ShieldCheck className="absolute top-8 right-8 w-8 h-8 text-yellow-600/50" />
          )}
        </div>

        {/* Ticket Body */}
        <div className="p-8 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-10">
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Date
              </span>
              <p className="font-bold text-gray-700">
                {dateObj ? format(dateObj, 'MMMM dd, yyyy') : '-'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Time
              </span>
              <p className="font-bold text-gray-700">{timeStr}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Studio
              </span>
              <p className="font-bold text-gray-700">The Canvas Studio</p>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                Category
              </span>
              <p className="font-bold text-gray-700">Photography</p>
            </div>
          </div>

          {/* QR Code / Cancel Info Segment */}
          <div className="flex-1 flex flex-col items-center justify-center mt-2">
            {selectedBooking.status_booking === 'cancelled' ? (
               <div className="bg-red-50/50 border border-dashed border-red-200 rounded-[2rem] p-8 flex flex-col items-center justify-center w-full max-w-[300px] text-center">
                 <ShieldCheck className="w-10 h-10 text-red-400 mb-3 opacity-50" />
                 <p className="text-sm font-bold text-red-700 uppercase tracking-widest mb-2">
                   Booking Cancelled
                 </p>
                 {selectedBooking.cancellation?.status_refund && selectedBooking.cancellation.status_refund !== 'none' && (
                   <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-red-100 w-full mt-2 text-left">
                     <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 block mb-1">
                       Refund Status
                     </span>
                     <p className={cn(
                       "text-xs font-bold",
                       selectedBooking.cancellation.status_refund.includes('success') ? "text-green-600" : "text-amber-600"
                     )}>
                       {selectedBooking.cancellation.status_refund.includes('success') 
                         ? 'Refund Processed' 
                         : 'Failed / Manual Required'}
                     </p>
                     <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                        {selectedBooking.cancellation.status_refund.includes('success') 
                          ? 'Funds have been successfully returned.' 
                          : 'Please contact admin for manual refund.'}
                     </p>
                   </div>
                 )}
               </div>
            ) : (
               <div className="bg-gray-50 border border-dashed border-gray-300 rounded-[2rem] p-8 flex flex-col items-center w-full max-w-[300px]">
                  {isConfirmed ? (
                    <>
                       <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                         <QRCode
                           value={selectedBooking.kode_booking}
                           size={120}
                           style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                         />
                       </div>
                       <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                         Scan Upon Arrival
                       </span>
                    </>
                  ) : (
                     <div className="text-center py-8 opacity-50">
                       <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                       <p className="text-sm font-medium">QR Code will be available</p>
                       <p className="text-xs text-gray-400 mt-1">once booking is confirmed</p>
                     </div>
                  )}
               </div>
            )}
          </div>
        </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 mt-4 flex gap-4">
          {selectedBooking.status_booking === 'pending' && selectedBooking.payment?.snap_token ? (
            <button 
              onClick={() => handlePayNow(selectedBooking.payment.snap_token)}
              className="flex-1 bg-[#7a6a1e] hover:bg-[#6a5a0e] text-white py-4 rounded-full font-medium transition flex items-center justify-center gap-2"
            >
              Complete Payment
            </button>
          ) : (
            <button 
              onClick={handleDownloadTicket} 
              disabled={selectedBooking.status_booking === 'cancelled'}
              className={cn(
                "flex-1 py-4 rounded-full font-medium transition flex items-center justify-center gap-2",
                selectedBooking.status_booking === 'cancelled'
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#4a4a4a] hover:bg-[#333] text-white"
              )}
            >
              <Download className="w-4 h-4" />
              Download Ticket
            </button>
          )}
          <button onClick={handleShare} className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-[#7a6a1e]/20 text-[#1a1a1a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 h-auto">
        {/* Header Section */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-medium tracking-tight text-[#4a4a4a] mb-4"
          >
            My Bookings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#666] max-w-2xl leading-relaxed"
          >
            Manage your upcoming photography sessions, view past memories, and download your digital tickets for studio entry.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          {/* Left Column */}
          {renderLeftPanel()}

          {/* Right Column */}
          {renderRightPanel()}
        </div>
      </main>

      <Footer />

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {bookingToCancel?.status_booking === 'pending' ? 'Cancel Booking' : 'Request Refund'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for this request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="reason"
              placeholder="E.g., Change of plans, found another option..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="col-span-3 rounded-xl border-[#eee] focus-visible:ring-gray-300"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl border-[#eee]" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>
              Keep Booking
            </Button>
            <Button variant="destructive" className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={submitCancelRefund} disabled={isCancelling || !cancelReason.trim()}>
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bookingToCancel?.status_booking === 'pending' ? 'Cancel' : 'Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <SessionProvider>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <MyBookingsContent />
      </Suspense>
    </SessionProvider>
  );
}
