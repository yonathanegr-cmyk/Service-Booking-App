import { useMemo } from 'react';

export interface TimeSlot {
  value: string;
  label: string;
  disabled: boolean;
}

const ALL_TIME_SLOTS = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00'
];

const BUFFER_MINUTES = 60;

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

function parseTimeSlot(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function getMinimumAllowedTime(): { hours: number; minutes: number } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const minimumMinutes = currentMinutes + BUFFER_MINUTES;
  return {
    hours: Math.floor(minimumMinutes / 60),
    minutes: minimumMinutes % 60
  };
}

function isTimeSlotAvailable(timeStr: string, selectedDate: Date | null): boolean {
  if (!selectedDate) return true;
  if (isPastDate(selectedDate)) return false;
  if (!isToday(selectedDate)) return true;
  
  const { hours, minutes } = parseTimeSlot(timeStr);
  const slotMinutes = hours * 60 + minutes;
  
  const { hours: minHours, minutes: minMins } = getMinimumAllowedTime();
  const minimumMinutes = minHours * 60 + minMins;
  
  return slotMinutes >= minimumMinutes;
}

export function getAvailableTimeSlots(selectedDate: Date | string | null): TimeSlot[] {
  const date = selectedDate 
    ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate)
    : null;
  
  return ALL_TIME_SLOTS.map(time => ({
    value: time,
    label: time,
    disabled: !isTimeSlotAvailable(time, date)
  }));
}

export function getFirstAvailableSlot(selectedDate: Date | string | null): string | null {
  const slots = getAvailableTimeSlots(selectedDate);
  const firstAvailable = slots.find(slot => !slot.disabled);
  return firstAvailable?.value ?? null;
}

export function useAvailableSlots(selectedDate: Date | string | null) {
  const slots = useMemo(() => {
    return getAvailableTimeSlots(selectedDate);
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    return slots.filter(slot => !slot.disabled);
  }, [slots]);

  const firstAvailable = useMemo(() => {
    return availableSlots[0]?.value ?? null;
  }, [availableSlots]);

  const isDateValid = useMemo(() => {
    if (!selectedDate) return true;
    const date = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
    return !isPastDate(date);
  }, [selectedDate]);

  const hasAvailableSlots = availableSlots.length > 0;

  const isSlotValid = (time: string): boolean => {
    const slot = slots.find(s => s.value === time);
    return slot ? !slot.disabled : false;
  };

  return {
    slots,
    availableSlots,
    firstAvailable,
    isDateValid,
    hasAvailableSlots,
    isSlotValid
  };
}

export function getMinDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatScheduledDateTime(date: string, time: string): string {
  if (!date || !time) return '';
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('he-IL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  return `${formattedDate} בשעה ${time}`;
}
