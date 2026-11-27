'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, X, Clock } from 'lucide-react';
import { ISchedule, ISlot, SlotStatus } from '@/types/schedule';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Partial<ISchedule>) => Promise<void>;
  initialData?: ISchedule | null;
  selectedDate?: Date | null;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate,
}: ScheduleModalProps) {
  const [date, setDate] = useState<string>(
    initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : 
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );
  const [isHoliday, setIsHoliday] = useState<boolean>(initialData?.is_holiday || false);
  const [slots, setSlots] = useState<ISlot[]>(initialData?.slots || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(format(new Date(initialData.date), 'yyyy-MM-dd'));
      setIsHoliday(initialData.is_holiday);
      setSlots(initialData.slots);
    } else if (selectedDate) {
      setDate(format(selectedDate, 'yyyy-MM-dd'));
      setIsHoliday(false);
      setSlots([]);
    }
  }, [initialData, selectedDate, isOpen]);

  const addSlot = () => {
    setSlots([
      ...slots,
      { start_time: '09:00', end_time: '10:00', status: SlotStatus.Available },
    ]);
  };

  const removeSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const updateSlot = (index: number, field: keyof ISlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const selectedDateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only prevent past dates for NEW schedules
    if (!initialData && selectedDateObj < today) {
      toast.error('Cannot create a schedule for a past date');
      return;
    }

    if (!isHoliday && slots.length > 0) {
      // 1. Check for end_time > start_time
      for (const slot of slots) {
        if (slot.end_time <= slot.start_time) {
          toast.error(`Invalid time range: Slot ${slot.start_time} - ${slot.end_time}. End time must be after start time.`);
          return;
        }
      }

      // 2. Check for duplicate slots
      const slotStrings = slots.map((s) => `${s.start_time}-${s.end_time}`);
      const uniqueSlots = new Set(slotStrings);
      if (uniqueSlots.size !== slotStrings.length) {
        toast.error('Duplicate time slots detected. Each slot must have a unique time range.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSave({
        date,
        is_holiday: isHoliday,
        slots,
      });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 pb-5 overflow-hidden rounded-3xl border-none">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-800">
              {initialData ? 'Edit Schedule' : 'Create New Schedule'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-8 bg-white max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Date & Holiday Section */}
          <div className="flex items-end justify-between gap-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date" className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
                Schedule Date
              </Label>
              <div className="relative group">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={!initialData ? format(new Date(), 'yyyy-MM-dd') : undefined}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500 h-11 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 min-h-[44px]">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-slate-700 leading-tight">Mark as Holiday</span>
                <span className="text-[0.6rem] text-slate-400">Public booking disabled</span>
              </div>
              <Switch
                checked={isHoliday}
                onCheckedChange={setIsHoliday}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>

          {/* Time Slots Section */}
          {!isHoliday && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                <h3 className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                  <Clock size={14} strokeWidth={2.5} />
                  Time Slots
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addSlot}
                  className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full font-bold text-[0.7rem] px-3 flex items-center gap-1"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Add Slot
                </Button>
              </div>

              <div className="space-y-3">
                {slots.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                    <Clock size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                    <p className="text-xs font-medium">No slots added yet</p>
                  </div>
                ) : (
                  slots.map((slot, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider ml-1">Start Time</Label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                            className="h-9 rounded-lg text-xs bg-white border-slate-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider ml-1">End Time</Label>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                            className="h-9 rounded-lg text-xs bg-white border-slate-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</Label>
                          <Select
                            value={slot.status}
                            onValueChange={(v) => updateSlot(index, 'status', v)}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-xs bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                              <SelectItem value={SlotStatus.Available} className="text-xs rounded-lg">Available</SelectItem>
                              <SelectItem value={SlotStatus.Pending} className="text-xs rounded-lg">Pending</SelectItem>
                              <SelectItem value={SlotStatus.Booked} className="text-xs rounded-lg">Booked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                        className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full mt-5 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-3 rounded-b-3xl">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-[0.8rem] h-10 font-bold text-slate-500 hover:bg-slate-100 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-xl text-[0.8rem] h-10 font-black bg-slate-900 hover:bg-black text-white px-8 shadow-lg shadow-slate-900/10 transition-transform active:scale-95"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
