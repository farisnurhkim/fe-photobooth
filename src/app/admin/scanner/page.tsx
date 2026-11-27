"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Flashlight, RefreshCcw, CheckCircle2, XCircle, User, Loader2 } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  kode_booking: string;
  status_booking: string;
  user_id: { nama_lengkap: string; email: string };
  package_id: { nama_paket: string };
  schedule_date_id: { date: string };
  createdAt: string;
}

interface ScanHistoryItem {
  id: string;
  type: 'valid' | 'invalid';
  title: string;
  subtitle: string;
  time: string;
}

export default function AdminScannerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedData, setScannedData] = useState<Booking | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [cameraActive, setCameraActive] = useState(true);

  // Sound effect for successful scan
  const playBeep = () => {
    try {
      const audio = new Audio('/beep.mp3'); // Optional, assuming exists or fail gracefully
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleSearch = async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    setScannedData(null);
    setScanError(null);
    
    try {
      const res = await axiosInstance.get('/bookings/search', {
        params: { kode_booking: code }
      });
      const booking = res.data.data;
      
      if (booking.status_booking.toLowerCase() === 'completed') {
        toast.warning('Booking has already been checked in!');
      } else if (booking.status_booking.toLowerCase() !== 'confirmed') {
        toast.error(`Cannot check-in booking. Status: ${booking.status_booking}`);
      } else {
        // Only beep if it's valid and ready to check in
        playBeep();
      }

      setScannedData(booking);
      
      // Add to recent
      addToRecent({
        id: Math.random().toString(),
        type: booking.status_booking.toLowerCase() === 'confirmed' ? 'valid' : 'invalid',
        title: booking.user_id.nama_lengkap,
        subtitle: `${booking.package_id?.nama_paket || '-'} • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
      
    } catch (error: any) {
      setScanError(error.response?.data?.message || 'Booking not found or invalid');
      addToRecent({
        id: Math.random().toString(),
        type: 'invalid',
        title: 'Invalid Ticket',
        subtitle: `Unknown Code • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDetect = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0 && !isLoading) {
      const code = detectedCodes[0].rawValue;
      setSearchQuery(code);
      handleSearch(code);
      // Temporarily pause camera to prevent multiple scans
      setCameraActive(false);
      setTimeout(() => setCameraActive(true), 3000);
    }
  };

  const addToRecent = (item: ScanHistoryItem) => {
    setRecentScans(prev => [item, ...prev].slice(0, 5));
  };

  const handleConfirmCheckIn = async () => {
    if (!scannedData) return;
    setIsConfirming(true);
    try {
      const res = await axiosInstance.post('/bookings/scan', {
        kode_booking: scannedData.kode_booking
      });
      toast.success(res.data.message || 'Check-in confirmed successfully');
      setScannedData(prev => prev ? { ...prev, status_booking: 'Completed' } : null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm check-in');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setScanError(null);
    setSearchQuery('');
    setCameraActive(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-700 tracking-tight mb-2">Booking Validation</h1>
        <p className="text-slate-500 font-medium">Point the camera at the client's booking QR code for instant check-in.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        
        {/* LEFT COLUMN: SCANNER */}
        <div className="flex flex-col gap-6">
          <div className="relative w-full aspect-4/3 bg-[#0c0f12] rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center ring-1 ring-black/5">
             
             {cameraActive ? (
                <div className="w-full h-full [&>div>video]:object-cover">
                   <Scanner 
                     onScan={onDetect} 
                     formats={['qr_code']}

                     styles={{
                       container: { width: '100%', height: '100%' },
                       video: { objectFit: 'cover' }
                     }}
                   />
                </div>
             ) : (
                <div className="text-white/50 font-medium">Camera Paused</div>
             )}

             {/* Decorative Scanner Box Overlay */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 relative">
                   {/* Golden Corners */}
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500 rounded-tl-xl"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500 rounded-tr-xl"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500 rounded-bl-xl"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500 rounded-br-xl"></div>
                </div>
             </div>

             {/* Camera Active Pill */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-800">Camera Active</span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
             <button className="flex-1 bg-[#4a4f54] hover:bg-[#3d4246] transition-colors text-white py-4 rounded-full flex items-center justify-center gap-3 font-semibold shadow-md active:scale-95">
                <Flashlight size={18} />
                Toggle Flash
             </button>
             <button onClick={resetScanner} className="flex-1 bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-colors text-slate-700 py-4 rounded-full flex items-center justify-center gap-3 font-semibold shadow-sm active:scale-95">
                <RefreshCcw size={18} className="text-yellow-600" />
                <span className="text-yellow-700">Reset Scanner</span>
             </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCH & RESULT */}
        <div className="flex flex-col gap-6">
          
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <Input 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                 placeholder="Search booking code (e.g., BK-12345)" 
                 className="w-full pl-11 h-14 bg-white border-0 shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-yellow-500/50 text-sm font-medium text-slate-700"
               />
            </div>
            <Button 
               onClick={() => handleSearch(searchQuery)}
               disabled={isLoading || !searchQuery}
               className="h-14 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
            </Button>
          </div>

          {/* Result Card */}
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[32px] w-full p-8 relative overflow-hidden">
             
             {!scannedData && !scanError && (
                <div className="py-16 text-center flex flex-col items-center justify-center opacity-50">
                   <Search size={48} className="text-slate-300 mb-4" />
                   <p className="text-slate-500 font-medium">No booking scanned yet.<br/>Please scan a QR code or search manually.</p>
                </div>
             )}

             {scanError && (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <XCircle size={32} className="text-red-500" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Booking</h2>
                   <p className="text-slate-500 font-medium max-w-xs mx-auto">{scanError}</p>
                </div>
             )}

             {scannedData && (
                <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                   
                   {/* Top Header */}
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-100/50 flex items-center justify-center">
                               <CheckCircle2 size={18} className="text-yellow-700" />
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-yellow-700 uppercase">Successfully Validated</span>
                         </div>
                         <h2 className="text-3xl font-bold text-slate-800 mt-2">{scannedData.user_id.nama_lengkap}</h2>
                      </div>
                      
                      {/* Badge Icon Mockup */}
                      <div className="w-12 h-12 relative flex items-center justify-center opacity-80">
                         <svg viewBox="0 0 24 24" fill="#e5e5e5" className="w-full h-full absolute">
                            <path d="M12 2l2.4 2.8 3.7-.6 1.2 3.5 3.3 1.8-1.5 3.4 1.5 3.4-3.3 1.8-1.2 3.5-3.7-.6L12 22l-2.4-2.8-3.7.6-1.2-3.5-3.3-1.8 1.5-3.4-1.5-3.4 3.3-1.8 1.2-3.5 3.7.6L12 2z" />
                         </svg>
                         <CheckCircle2 size={16} className="text-white relative z-10" />
                      </div>
                   </div>

                   <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

                   {/* Details Grid */}
                   <div className="space-y-5 mb-8">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Package</span>
                         <span className="text-sm font-bold text-slate-700">{scannedData.package_id?.nama_paket || '-'}</span>
                      </div>
                      <div className="w-full h-[1px] bg-slate-50"></div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Check-in Time</span>
                         <span className="text-sm font-bold text-slate-700">{new Date(scannedData.schedule_date_id?.date || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="w-full h-[1px] bg-slate-50"></div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">ID Status</span>
                         <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Verified</span>
                      </div>
                   </div>

                   {/* Action */}
                   <Button 
                      onClick={handleConfirmCheckIn}
                      disabled={isConfirming || scannedData.status_booking.toLowerCase() !== 'confirmed'}
                      className={`w-full h-14 text-white rounded-xl font-bold tracking-wide text-sm shadow-md mt-auto ${
                        scannedData.status_booking.toLowerCase() === 'confirmed' 
                          ? 'bg-[#7c630f] hover:bg-[#634e0b]' 
                          : 'bg-slate-400 cursor-not-allowed'
                      }`}
                   >
                     {isConfirming ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                     {scannedData.status_booking.toLowerCase() === 'completed' 
                       ? 'ALREADY CHECKED IN' 
                       : scannedData.status_booking.toLowerCase() !== 'confirmed' 
                         ? `STATUS: ${scannedData.status_booking.toUpperCase()}` 
                         : 'Confirm Check-in'}
                   </Button>
                </div>
             )}
          </Card>

          {/* Recent Scans */}
          <div className="mt-4">
             <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="text-lg font-bold text-slate-700">Recent Scans</h3>
             </div>
             
             <div className="flex flex-col gap-3">
                {recentScans.length === 0 ? (
                   <div className="text-sm text-slate-400 text-center py-4">No recent scans yet</div>
                ) : (
                   recentScans.map((scan) => (
                      <div key={scan.id} className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm ${scan.type === 'invalid' ? 'bg-red-50/50' : 'bg-slate-50/50'}`}>
                         
                         {/* Avatar */}
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${scan.type === 'invalid' ? 'bg-red-100' : 'bg-slate-200 overflow-hidden'}`}>
                            {scan.type === 'invalid' ? (
                               <User className="text-red-400" size={20} />
                            ) : (
                               <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${scan.title}`} alt="avatar" className="w-full h-full object-cover opacity-80" />
                            )}
                         </div>

                         {/* Info */}
                         <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate ${scan.type === 'invalid' ? 'text-slate-800' : 'text-slate-700'}`}>{scan.title}</h4>
                            <p className="text-xs font-medium text-slate-500 truncate">{scan.subtitle}</p>
                         </div>

                         {/* Status */}
                         <div className="flex flex-col items-end justify-center">
                            {scan.type === 'invalid' ? (
                               <>
                                  <div className="w-6 h-6 rounded-full border border-red-200 flex items-center justify-center text-red-500 mb-1">
                                     <span className="text-xs font-black">!</span>
                                  </div>
                                  <span className="text-[8px] font-black tracking-widest text-red-500 uppercase">Failed</span>
                               </>
                            ) : (
                               <>
                                  <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                                  <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Validated</span>
                               </>
                            )}
                         </div>

                      </div>
                   ))
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
