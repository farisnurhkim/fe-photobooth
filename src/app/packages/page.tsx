'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Camera, 
  Sparkles, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle,
  Star,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/layout/Navbar';
import SessionProvider from "@/components/providers/session-provider";
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import api from '@/lib/axios';
import { getAdminPackages, getPublicAvailableSchedules } from '@/lib/adminApi';
import { Package } from '@/types/package';
import { ISchedule, ISlot, SlotStatus } from '@/types/schedule';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PackageSelectionPage() {
  return (
    <SessionProvider>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <PackageSelectionContent />
      </Suspense>
    </SessionProvider>
  );
}

function PackageSelectionContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = (searchParams?.get('type') as 'solo' | 'group') || 'solo';
  const [sessionType, setSessionType] = useState<'solo' | 'group'>(initialType);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSchedules, setAvailableSchedules] = useState<ISchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);

  // Checkout Dialog State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  // Fetch Packages
  const fetchPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const res = await getAdminPackages(1, 100, sessionType);
      if (res.success) {
        setPackages(res.data);
        // Auto-select first package if none selected or if session type changed
        if (res.data.length > 0) {
          setSelectedPackage(res.data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setIsLoadingPackages(false);
    }
  }, [sessionType]);

  const hasInitializedFromUrl = React.useRef(false);

  // Handle auto-select from URL params
  useEffect(() => {
    if (packages.length > 0 && searchParams && !hasInitializedFromUrl.current) {
      const packageId = searchParams.get('packageId');
      if (packageId) {
        const urlPkg = packages.find(p => p._id === packageId);
        if (urlPkg) {
          setSelectedPackage(urlPkg);
          hasInitializedFromUrl.current = true;
        }
      }
    }
  }, [packages, searchParams]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Fetch Schedules/Slots for selected date
  const fetchSchedules = useCallback(async (date: Date) => {
    setIsLoadingSchedules(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await getPublicAvailableSchedules(formattedDate);
      if (res.success) {
        setAvailableSchedules(res.data);
        setSelectedSlot(null); // Reset slot selection when date changes
      }
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules(selectedDate);
    }
  }, [selectedDate, fetchSchedules]);

  const getPackageIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('essential')) return <Camera className="w-5 h-5 shadow-sm" />;
    if (n.includes('editorial')) return <Sparkles className="w-5 h-5 shadow-sm" />;
    return <ImageIcon className="w-5 h-5 shadow-sm" />;
  };

  const isEditorial = (name: string) => name.toLowerCase().includes('editorial');

  const slots = availableSchedules.length > 0 ? availableSchedules[0].slots : [];

  const handleContinue = () => {
    if (!selectedPackage || !selectedDate || !selectedSlot) return;
    
    if (!session) {
      toast.error('Please log in first to continue booking.');
      router.push('/auth/login');
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    setIsLoadingBooking(true);
    try {
      const scheduleId = availableSchedules.find(s => 
        s.slots.some(slot => slot._id === selectedSlot?._id)
      )?._id;

      if (!scheduleId) throw new Error('Schedule ID not found');

      const res = await api.post('/bookings', {
        package_id: selectedPackage?._id,
        schedule_date_id: scheduleId,
        schedule_slot_id: selectedSlot?._id,
        metode_bayar: selectedPaymentMethod,
      });

      if (res.data.success) {
        setIsCheckoutOpen(false);
        const token = res.data.midtrans.token;
        // @ts-ignore
        window.snap.pay(token, {
          onSuccess: function(result: any){
            toast.success('Payment successful!');
            router.push('/my-bookings');
          },
          onPending: function(result: any){
            toast.success('Waiting your payment!');
            router.push('/my-bookings');
          },
          onError: function(result: any){
            toast.error('Payment failed!');
          },
          onClose: function(){
            toast.error('You closed the popup without finishing the payment');
          }
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#fafafa] selection:bg-[#7a6a1e]/20 text-[#1a1a1a]">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 h-auto">
          {/* Header Section */}
          <header className="mb-10">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold tracking-[0.2em] text-[#7a6a1e] uppercase mb-2 block"
            >
              Step 01 / 02
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-medium tracking-tight text-[#4a4a4a] mb-6"
            >
              Select Your Studio Experience.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[#666] max-w-2xl leading-relaxed"
            >
              Curate your perfect session from our handcrafted photography packages.
              Each designed to capture your narrative with cinematic precision.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
            {/* Left Column: Packages and Calendar */}
            <div className="space-y-10">
              
              {/* Session Type Filter */}
              <div className="flex justify-start">
                <div className="bg-[#f0f0f0] p-1.5 rounded-full flex items-center shadow-inner">
                  {(['solo', 'group'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={cn(
                        "px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                        sessionType === type 
                          ? "bg-white text-[#7a6a1e] shadow-md" 
                          : "text-[#888] hover:text-[#555] cursor-pointer"
                      )}
                    >
                      {type === 'solo' ? 'Solo' : 'Group'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AnimatePresence>
                  {isLoadingPackages ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-8 rounded-3xl border bg-white h-[380px] animate-pulse" />
                    ))
                  ) : (
                    packages.map((pkg, idx) => (
                      <motion.div
                        key={pkg._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4 }}
                        className={cn(
                          "relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full",
                          selectedPackage?._id === pkg._id && isEditorial(pkg.nama_paket)
                            ? "bg-[#5c5c5c] text-white border-transparent shadow-2xl" 
                            : selectedPackage?._id === pkg._id
                              ? "bg-white border-[#7a6a1e] shadow-lg"
                              : "bg-white border-[#eee] hover:border-[#7a6a1e]/30 shadow-sm"
                        )}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <div className="flex justify-between items-start mb-6">
                          {pkg.picture ? (
                            <div className="w-[100px] h-[75px] rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img src={pkg.picture} alt={pkg.nama_paket} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={cn(
                              "p-3 rounded-2xl flex-shrink-0",
                              selectedPackage?._id === pkg._id && isEditorial(pkg.nama_paket) ? "bg-white/10" : "bg-[#f5f5f5]"
                            )}>
                              {getPackageIcon(pkg.nama_paket)}
                            </div>
                          )}
                          <div className="text-right flex flex-col justify-end">
                            <span className="text-xl font-medium text-[#7a6a1e]">
                              {formatCurrency(pkg.harga)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                           <h3 className="text-2xl font-medium">{pkg.nama_paket}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold mb-4">
                            <Clock size={14} className="text-[#7a6a1e]" />
                            <span>{pkg.durasi_menit} Mins Duration</span>
                        </div>
                        
                        <p className={cn(
                          "text-sm leading-relaxed mb-6 flex-grow",
                          selectedPackage?._id === pkg._id && isEditorial(pkg.nama_paket) ? "text-gray-300" : "text-[#666]"
                        )}>
                          {pkg.deskripsi.join('. ')}
                        </p>

                        <button className={cn(
                          "w-full py-3.5 rounded-full text-sm font-medium border transition-all",
                          selectedPackage?._id === pkg._id
                            ? "bg-[#7a6a1e] border-transparent text-white"
                            : "bg-transparent border-[#eee] text-[#1a1a1a] hover:border-[#7a6a1e]"
                        )}>
                          {selectedPackage?._id === pkg._id ? 'Selected' : 'Select Package'}
                        </button>

                        {isEditorial(pkg.nama_paket) && (
                          <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none rotate-12">
                            <Star className="w-40 h-40 fill-current" />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Calendar Card */}
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-[#f0f0f0]">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-medium text-[#333]">
                      {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Date Selection'}
                    </h2>
                    <p className="text-sm text-[#888] mt-1.5">Pick an available date for your session</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="p-2.5 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-100">
                      <ChevronLeft className="w-5 h-5 text-[#666]" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-100">
                      <ChevronRight className="w-5 h-5 text-[#666]" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full flex justify-center"
                    classNames={{
                      months: "w-full",
                      month: "w-full space-y-8",
                      month_caption: "hidden", // Hide title as it is custom handled above
                      nav: "hidden", // Hide nav as it is custom handled above
                      month_grid: "w-full border-collapse",
                      weekdays: "grid grid-cols-7 gap-y-6 text-center mb-4",
                      weekday: "text-[10px] font-bold text-[#aaa] tracking-[0.2em] uppercase",
                      week: "grid grid-cols-7 gap-y-6 mb-2",
                      day: "h-12 w-full flex items-center justify-center text-sm rounded-2xl transition-all cursor-pointer",
                      day_button: "h-full w-full flex items-center justify-center",
                      selected: "bg-[#5c5c5c]! text-white! font-medium shadow-xl shadow-gray-200",
                      today: "text-[#7a6a1e] font-bold",
                      outside: "text-[#ddd]",
                      disabled: "text-[#eee] pointer-events-none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Sidebar */}
            <aside className="lg:sticky lg:top-8 space-y-8">
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-[#f0f0f0]">
                <h2 className="text-2xl font-medium mb-2 text-[#333]">Available Slots</h2>
                <p className="text-sm text-[#888] mb-8">
                  {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Please select a date'}
                </p>
                
                <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar mb-10">
                  {isLoadingSchedules ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#7a6a1e] animate-spin" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
                      <Clock className="w-6 h-6 mb-2" />
                      <p className="text-xs">No available slots</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      {slots.map(slot => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "py-4 px-4 rounded-2xl text-sm transition-all border",
                            selectedSlot?._id === slot._id
                              ? "bg-[#7a6a1e] border-transparent text-white font-medium shadow-lg shadow-[#7a6a1e]/20"
                              : "bg-white border-[#f0f0f0] text-[#333] hover:border-[#7a6a1e]/30 cursor-pointer"
                          )}
                        >
                          {slot.start_time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking Summary - "BOX" design from PDF */}
                <div className="p-8 bg-[#f5f5f5] rounded-3xl mb-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] mb-6">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Booking Summary
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#555]">{selectedPackage?.nama_paket || 'None'} Session</span>
                      <span className="text-sm font-bold text-[#333]">{selectedPackage ? formatCurrency(selectedPackage.harga) : '-'}</span>
                    </div>
                    {selectedSlot && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#555]">
                          {format(selectedDate!, 'MMM d')}, {selectedSlot.start_time}
                        </span>
                        <span className="text-[10px] font-bold text-[#7a6a1e] uppercase tracking-[0.15em]">Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <button 
                    onClick={handleContinue}
                    disabled={!selectedPackage || !selectedDate || !selectedSlot}
                    className={cn(
                      "relative w-full py-5 rounded-[2rem] font-medium transition-all shadow-2xl flex items-center justify-center gap-2",
                      selectedPackage && selectedSlot
                        ? "bg-[#5c5c5c] text-white hover:bg-[#4a4a4a] shadow-gray-300"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    Continue to Details
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#888]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Need help with your booking? <a href="#" className="text-[#7a6a1e] font-bold underline underline-offset-4 decoration-2">Chat with us</a>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Studio Info Section */}
          <section className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-[#eee] shadow-2xl shadow-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2878&auto=format&fit=crop" 
                  alt="Studio Space"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white">
                  <h4 className="text-2xl font-medium mb-1 tracking-tight">The Canvas Studio</h4>
                  <p className="text-sm text-gray-300">Downtown Art District, Floor 4</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-10">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-medium leading-[1.1] text-[#333] tracking-tight"
              >
                Your vision, captured in our boutique studio space.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-[#666] leading-relaxed font-light"
              >
                We provide a serene, minimalist environment designed to let your personality shine. 
                Our studio features natural north-facing light and professional-grade strobe equipment 
                for every artistic requirement.
              </motion.p>
              
              <ul className="space-y-6 pt-4">
                {[
                  'Unlimited Refreshments & Coffee',
                  'Private Dressing Room',
                  'On-site Retouching Consultation'
                ].map((feature, idx) => (
                  <motion.li 
                    key={feature} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-4 text-[#333] font-medium text-lg tracking-tight"
                  >
                    <div className="bg-[#7a6a1e] rounded-full p-1.5 shadow-lg shadow-[#7a6a1e]/20">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>
          {/* Checkout Dialog */}
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogContent className="sm:max-w-md p-8 rounded-3xl bg-white border border-[#f0f0f0] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium text-[#333]">Complete Booking</DialogTitle>
                <DialogDescription className="text-sm text-[#888]">
                  Please review your selected session details and select a payment method to proceed with the booking.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="bg-[#fcfcfc] p-6 rounded-2xl border border-[#f0f0f0]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-[#666]">Package</span>
                    <span className="text-sm font-bold text-[#333]">{selectedPackage?.nama_paket}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-[#666]">Total Price</span>
                    <span className="text-lg font-bold text-[#7a6a1e]">{selectedPackage ? formatCurrency(selectedPackage.harga) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#666]">Schedule</span>
                    <span className="text-sm text-[#444] text-right">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}<br/>
                      {selectedSlot?.start_time} - {selectedPackage ? `${selectedPackage.durasi_menit} mins` : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#444]">Payment Method</label>
                  <Select value={selectedPaymentMethod} onValueChange={(val: string | null) => { if (val) setSelectedPaymentMethod(val); }}>
                    <SelectTrigger className="w-full rounded-2xl h-12 bg-[#fafafa] border-[#e5e5e5]">
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#e5e5e5] shadow-lg">
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="gopay">GoPay</SelectItem>
                      <SelectItem value="shopeepay">ShopeePay</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="kredivo">Kredivo</SelectItem>
                      <SelectItem value="akulaku">Akulaku</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-[#888] mt-2">
                    <HelpCircle className="w-3 h-3 inline-block mr-1 mb-0.5" />
                    Only payment methods supporting refunds are shown.
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-8 flex gap-3 flex-col sm:flex-row">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="rounded-full h-12 flex-1 border-[#eee] text-[#666] hover:bg-[#f5f5f5]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmBooking}
                  disabled={isLoadingBooking || !selectedPaymentMethod}
                  className="rounded-full h-12 flex-1 bg-[#4a4a4a] hover:bg-[#333] text-white"
                >
                  {isLoadingBooking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm & Pay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>

        <Footer />
      </div>
  );
}
