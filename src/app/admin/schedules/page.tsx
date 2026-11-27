'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarPlus,
  AlertCircle
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ScheduleCard from '@/components/admin/ScheduleCard';
import ScheduleModal from '@/components/admin/ScheduleModal';
import { ISchedule, SlotStatus } from '@/types/schedule';
import { getAdminSchedules, createAdminSchedule, updateAdminSchedule, deleteAdminSchedule } from '@/lib/adminApi';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function SchedulesPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ISchedule | null>(null);

  const fetchSchedules = async (selectedDate?: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
      const response = await getAdminSchedules(formattedDate);
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(date);
  }, [date]);

  const handleSaveSchedule = async (data: Partial<ISchedule>) => {
    try {
      if (editingSchedule?._id) {
        await updateAdminSchedule(editingSchedule._id, data);
        toast.success('Schedule updated successfully');
      } else {
        await createAdminSchedule(data);
        toast.success('Schedule created successfully');
      }
      fetchSchedules(date);
    } catch (error: any) {
      throw error;
    }
  };

  const handleToggleHoliday = async (schedule: ISchedule) => {
    try {
      await updateAdminSchedule(schedule._id!, { is_holiday: !schedule.is_holiday });
      toast.success(`Schedule marked as ${!schedule.is_holiday ? 'holiday' : 'active'}`);
      fetchSchedules(date);
    } catch (error) {
      toast.error('Failed to update holiday status');
    }
  };

  const selectedSchedule = schedules[0];
  const availableSlotsCount = selectedSchedule?.slots.filter(s => s.status === SlotStatus.Available).length || 0;
  const bookedSlotsCount = selectedSchedule?.slots.filter(s => s.status === SlotStatus.Booked).length || 0;

  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#84752b]/20">
      <div className="max-w-[1280px] mx-auto p-6 md:p-10 flex flex-col gap-8 md:gap-10">
        
        {/* Sub Header - Main Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mt-4">
          <div className="animate-in slide-in-from-left duration-500">
            <p className="text-[#84752b] font-black text-[10px] tracking-[0.4em] uppercase mb-1.5 ml-1">CURATION HUB</p>
            <h1 className="text-3xl md:text-5xl font-bold text-[#333] tracking-tighter">Schedule Management</h1>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
            {selectedSchedule && (
              <button 
                onClick={() => handleToggleHoliday(selectedSchedule)}
                className="flex-1 md:flex-none px-7 md:px-8 py-3.5 bg-[#e9ecef] text-[#495057] font-black text-[0.75rem] uppercase tracking-wider rounded-2xl hover:bg-[#dee2e6] shadow-sm transform active:scale-95 transition-all outline-none"
              >
                {selectedSchedule.is_holiday ? 'Enable Booking' : 'Toggle Holiday Status'}
              </button>
            )}
            <button 
              onClick={() => {
                setEditingSchedule(null);
                setIsModalOpen(true);
              }}
              className="flex-1 md:flex-none px-7 md:px-8 py-3.5 bg-[#1a1a1a] text-white font-black text-[0.75rem] uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 hover:bg-[#333] transition-all shadow-xl shadow-black/10 transform active:scale-95 outline-none"
            >
              <CalendarPlus className="w-4 h-4" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* Aside Section - Calendar & Media */}
          <aside className="col-span-1 lg:col-span-4 flex flex-col gap-8 lg:gap-10 order-2 lg:order-1">
            
            {/* Calendar Card */}
            <Card className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden ring-1 ring-black/2 relative">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                classNames={{
                  months: "w-full",
                  month: "w-full",
                  month_caption: "flex justify-between items-center mb-8 h-auto w-full px-0",
                  caption_label: "font-black text-xl text-[#333] tracking-tight",
                  nav: "flex gap-4",
                  button_previous: "p-1 h-auto w-auto hover:text-[#84752b] text-gray-300 transition-colors bg-transparent border-none shadow-none cursor-pointer",
                  button_next: "p-1 h-auto w-auto hover:text-[#84752b] text-gray-300 transition-colors bg-transparent border-none shadow-none cursor-pointer",
                  month_grid: "w-full",
                  weekdays: "grid grid-cols-7 mb-4",
                  weekday: "text-gray-300 font-black text-[10px] uppercase tracking-[0.2em] text-center",
                  week: "grid grid-cols-7 mb-3",
                  day: "h-10 w-10 p-0 font-bold text-sm tracking-tighter text-[#333] rounded-full hover:bg-[#84752b]/5 hover:text-[#84752b] transition-all flex items-center justify-center mx-auto",
                  day_button: "h-full w-full flex items-center justify-center",
                  selected: "bg-[#84752b]! text-white! shadow-xl shadow-[#84752b]/30 scale-110",
                  today: "text-[#84752b] font-black relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#84752b] after:rounded-full",
                  outside: "text-gray-100 opacity-50",
                  disabled: "text-gray-100 opacity-50",
                }}
              />
            </Card>

            {/* Next Session Image Content */}
            <div className="relative group rounded-[2.5rem] overflow-hidden aspect-[4/3.2] shadow-2xl ring-1 ring-white/20">
              <img 
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Studio setup" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent p-10 flex flex-col justify-end">
                <p className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase mb-3">NEXT SESSION</p>
                <h3 className="text-white text-3xl font-black tracking-tighter leading-tight">Portrait Studio A</h3>
              </div>
            </div>
          </aside>

          {/* Main List Section */}
          <main className="col-span-1 lg:col-span-8 flex flex-col gap-8 lg:gap-10 order-1 lg:order-2">
            
            {/* List Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0">
              <div className="flex items-center gap-5">
                <h2 className="text-2xl md:text-4xl font-bold text-[#333] tracking-tighter">
                  {date ? format(date, 'EEEE, MMM d') : 'Select a date'}
                </h2>
                {!selectedSchedule?.is_holiday && selectedSchedule && (
                  <Badge className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-black px-5 py-2 rounded-full tracking-widest uppercase border-none hover:bg-[#e8f5e9]">ACTIVE DAY</Badge>
                )}
                {selectedSchedule?.is_holiday && (
                  <Badge className="bg-rose-50 text-rose-600 text-[10px] font-black px-5 py-2 rounded-full tracking-widest uppercase border-none hover:bg-rose-50">HOLIDAY</Badge>
                )}
              </div>
              
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#84752b] rounded-full shadow-lg shadow-[#84752b]/20"></span>
                  <span className="text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase">{availableSlotsCount} AVAILABLE</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-gray-200 rounded-full"></span>
                  <span className="text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase">{bookedSlotsCount} BOOKED</span>
                </div>
              </div>
            </div>

            {/* Slots Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div key="loading" className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#84752b] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedSchedule?.slots.length ? (
                <motion.div 
                  key="slots-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                >
                  {selectedSchedule.slots.map((slot, index) => {
                    const isLast = index === selectedSchedule.slots.length - 1;
                    const isDark = selectedSchedule.slots.length >= 3 && isLast;
                    
                    return (
                      <ScheduleCard 
                        key={slot._id || index} 
                        slot={slot} 
                        isDark={isDark}
                        onEdit={() => {
                          setEditingSchedule(selectedSchedule);
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}

                </motion.div>
              ) : (
                <div key="empty" className="h-64 flex flex-col items-center justify-center text-gray-300 gap-4 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                   <CalendarIcon size={40} className="opacity-20" />
                   <p className="text-sm font-bold uppercase tracking-widest opacity-50">No schedule found</p>
                </div>
              )}
            </AnimatePresence>

            {/* Efficiency Box Content */}
            <div className="mt-4 bg-[#f1f3f5] p-10 md:p-14 rounded-[3.52rem] relative overflow-hidden group shadow-sm">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3 text-[#495057]">
                   <AlertCircle className="w-6 h-6 opacity-40" />
                   <h3 className="text-xl md:text-2xl font-black tracking-tight">Schedule Efficiency Notes</h3>
                </div>
                <p className="text-[#495057]/60 leading-relaxed max-w-xl text-lg font-medium">
                  Current bookings for {date ? format(date, 'MMM d') : 'this day'} are at 35% capacity. Consider adding a promotional "Golden Hour" package to the 16:00 slot to increase conversion.
                </p>
              </div>
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-700 hover:rotate-12">
                <div className="w-64 h-64 border-24 border-[#495057] rounded-full scale-110"></div>
                <div className="w-20 h-20 bg-[#495057] rounded-full absolute -bottom-8 -right-8"></div>
              </div>
            </div>
          </main>
        </div>

        {/* Floating Add Schedule Button */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="lg:hidden fixed bottom-12 right-12 w-16 h-16 bg-[#84752b] text-white rounded-full shadow-2xl shadow-[#84752b]/40 flex items-center justify-center hover:bg-[#6d6023] transition-colors z-50 p-0 border-none outline-none cursor-pointer"
        >
          <CalendarPlus className="w-7 h-7" />
        </motion.button>
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
        selectedDate={date}
      />
    </div>
  );
}
