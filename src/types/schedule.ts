export enum SlotStatus {
  Available = 'available',
  Pending = 'pending',
  Booked = 'booked',
}

export interface ISlot {
  _id?: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
}

export interface ISchedule {
  _id?: string;
  date: string;
  is_holiday: boolean;
  slots: ISlot[];
}
