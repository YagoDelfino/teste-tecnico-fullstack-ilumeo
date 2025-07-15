// backend/src/types/index.ts

import { TimeEntryType } from '../models/TimeEntry';

export interface ApiTimeEntry {
  id: string;
  timestamp: string; 
  type: TimeEntryType;
}

export interface ApiStatusOutput {
  userId: string;
  isClockedIn: boolean;
  currentClockInTime: string | null; 
  entriesToday: ApiTimeEntry[]; 
  totalHoursToday: number;
}

export interface ApiDailySummary {
  date: string; 
  totalHours: number;
  startTime?: string; 
  endTime?: string;
}