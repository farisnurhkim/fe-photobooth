import { ISlot, SlotStatus } from '@/types/schedule';
import { Edit2, Eye, Lock as LockIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  slot: ISlot;
  onEdit?: (slot: ISlot) => void;
  onView?: (slot: ISlot) => void;
  isDark?: boolean;
}

export default function ScheduleCard({ 
  slot, 
  onEdit, 
  onView,
  isDark = false 
}: ScheduleCardProps) {
  const statusLabels = {
    [SlotStatus.Available]: 'AVAILABLE',
    [SlotStatus.Booked]: 'BOOKED',
    [SlotStatus.Pending]: 'PENDING',
  };

  const status = statusLabels[slot.status] || 'AVAILABLE';
  const isLocked = slot.status === SlotStatus.Booked;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl shadow-sm border transition-all duration-200",
        isDark 
          ? "bg-[#1a1a1a] text-white border-white/10 md:col-span-2" 
          : "bg-white border-gray-100/50 hover:shadow-md"
      )}
    >
      {/* Time Section */}
      <div className={cn(
        "flex flex-row sm:flex-col items-center justify-center pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r min-w-full sm:min-w-[80px] pb-4 sm:pb-0 mb-4 sm:mb-0 gap-2 sm:gap-0",
        isDark ? "border-white/10" : "border-gray-100"
      )}>
        <span className="text-lg font-bold tracking-tight">{slot.start_time}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">START</span>
      </div>
      
      {/* Content Section */}
      <div className="sm:pl-6 flex-1 w-full">
        <h3 className={cn(
          "font-bold text-lg tracking-tight",
          isDark ? "text-white" : "text-[#333]"
        )}>
          Photography Session
        </h3>
        <p className="text-sm font-medium opacity-40">
          Ends at {slot.end_time}
        </p>
      </div>

      {/* Status & Actions Section */}
      <div className={cn(
        "flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0",
        isDark ? "border-white/5" : "border-gray-100/50"
      )}>
        <span className={cn(
          "px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase whitespace-nowrap",
          slot.status === SlotStatus.Available ? "bg-[#e8f5e9] text-[#2e7d32]" : 
          slot.status === SlotStatus.Booked ? "bg-[#f5f5f5] text-[#757575]" : 
          "bg-[#333] text-white/80"
        )}>
          {status}
        </span>
        
        <div className="flex items-center gap-3">
          {slot.status === SlotStatus.Available && (
            <Edit2 
              className="w-4 h-4 text-gray-300 cursor-pointer hover:text-[#84752b] transition-colors" 
              onClick={() => onEdit?.(slot)}
            />
          )}
          {slot.status === SlotStatus.Booked && (
            <Eye 
              className="w-4 h-4 text-gray-300 cursor-pointer hover:text-[#84752b] transition-colors" 
              onClick={() => onView?.(slot)}
            />
          )}
          {isDark && (
            <LockIcon className="w-4 h-4 text-white/20" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
