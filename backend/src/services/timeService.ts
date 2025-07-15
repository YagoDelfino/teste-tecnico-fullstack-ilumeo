// backend/src/services/timeService.ts

import { TimeEntry, TimeEntryType } from '../models/TimeEntry';
import { User } from '../models/User';
import { Op } from 'sequelize';
import { format, parseISO, startOfDay, endOfDay, subDays, addDays, differenceInMilliseconds } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { ApiStatusOutput, ApiDailySummary, ApiTimeEntry } from '../types';



const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

export class TimeService {
  static async clockIn(userId: string): Promise<TimeEntry> {
    const user = await User.findByPk(userId);
    if (!user) {
      const error: any = new Error('Usuário não encontrado.');
      error.status = 404;
      throw error;
    }

    
    const now = new Date();
    const nowInAppTimezone = toZonedTime(now, APP_TIMEZONE);

    const todayStartUtc = fromZonedTime(startOfDay(nowInAppTimezone), APP_TIMEZONE);
    const todayEndUtc = fromZonedTime(endOfDay(nowInAppTimezone), APP_TIMEZONE);

    const existingClockInToday = await TimeEntry.findOne({
      where: {
        userId,
        type: TimeEntryType.CLOCK_IN,
        timestamp: {
          [Op.between]: [todayStartUtc, todayEndUtc],
        },
      },
    });

    if (existingClockInToday) {
      const error: any = new Error('Você já registrou uma entrada (CLOCK_IN) hoje.');
      error.status = 409;
      throw error;
    }

    const newEntry = await TimeEntry.create({
      userId,
      timestamp: new Date(),
      type: TimeEntryType.CLOCK_IN,
    });

    return newEntry;
  }

  static async clockOut(userId: string): Promise<TimeEntry> {
    const user = await User.findByPk(userId);
    if (!user) {
      const error: any = new Error('Usuário não encontrado.');
      error.status = 404;
      throw error;
    }

    const now = new Date();
    const nowInAppTimezone = toZonedTime(now, APP_TIMEZONE);

    const todayStartUtc = fromZonedTime(startOfDay(nowInAppTimezone), APP_TIMEZONE);
    const todayEndUtc = fromZonedTime(endOfDay(nowInAppTimezone), APP_TIMEZONE);

    const existingClockOutToday = await TimeEntry.findOne({
      where: {
        userId,
        type: TimeEntryType.CLOCK_OUT,
        timestamp: {
          [Op.between]: [todayStartUtc, todayEndUtc],
        },
      },
    });

    if (existingClockOutToday) {
      const error: any = new Error('Você já registrou uma saída (CLOCK_OUT) hoje.');
      error.status = 409; 
      throw error;
    }

    const latestEntryToday = await TimeEntry.findOne({
      where: {
        userId,
        timestamp: {
          [Op.between]: [todayStartUtc, todayEndUtc],
        },
      },
      order: [['timestamp', 'DESC']],
    });

    if (!latestEntryToday || latestEntryToday.type === TimeEntryType.CLOCK_OUT) {
      const error: any = new Error('Você precisa registrar uma entrada (CLOCK_IN) antes de uma saída.');
      error.status = 409;
      throw error;
    }

    const newEntry = await TimeEntry.create({
      userId,
      timestamp: new Date(),
      type: TimeEntryType.CLOCK_OUT,
    });

    return newEntry;
  }

  static async getStatusAndEntriesToday(userId: string): Promise<ApiStatusOutput> {
    const now = new Date();
    const nowInAppTimezone = toZonedTime(now, APP_TIMEZONE);

    const todayStartUtc = fromZonedTime(startOfDay(nowInAppTimezone), APP_TIMEZONE);
    const todayEndUtc = fromZonedTime(endOfDay(nowInAppTimezone), APP_TIMEZONE);



    const entries = await TimeEntry.findAll({
      where: {
        userId,
        timestamp: {
          [Op.between]: [todayStartUtc, todayEndUtc],
        },
      },
      order: [['timestamp', 'ASC']],
    });


    let isClockedIn = false;
    let currentClockInTime: Date | null = null;
    let totalMsToday = 0;

    for (const entry of entries) {
      const entryTimeInAppTimezone = toZonedTime(entry.timestamp, APP_TIMEZONE);

      if (entry.type === TimeEntryType.CLOCK_IN) {
        currentClockInTime = entryTimeInAppTimezone;
        isClockedIn = true;
      } else if (entry.type === TimeEntryType.CLOCK_OUT && currentClockInTime) {
        totalMsToday += entryTimeInAppTimezone.getTime() - currentClockInTime.getTime();
        currentClockInTime = null;
        isClockedIn = false;
      }
    }

    if (isClockedIn && currentClockInTime) {
      totalMsToday += nowInAppTimezone.getTime() - currentClockInTime.getTime();
    }

    const totalHoursToday = totalMsToday / (1000 * 60 * 60);

    return {
      userId,
      isClockedIn,
      currentClockInTime: currentClockInTime ? currentClockInTime.toISOString() : null,
      entriesToday: entries.map(e => ({
        id: e.id,
        timestamp: e.timestamp.toISOString(),
        type: e.type,
      })),
      totalHoursToday: parseFloat(totalHoursToday.toFixed(2)),
    };
  }

  static async getDailySummaries(
    userId: string,
    daysBack?: number,
    startDateStr?: string,
    endDateStr?: string
  ): Promise<ApiDailySummary[]> {
    const summaries: ApiDailySummary[] = [];
    const todayInAppTimezone = toZonedTime(new Date(), APP_TIMEZONE);

    let queryStartDateAppTimezone: Date;
    let queryEndDateAppTimezone: Date;

    if (startDateStr && endDateStr) {
      const startZoned = startOfDay(toZonedTime(parseISO(startDateStr), APP_TIMEZONE));
      const endZoned = endOfDay(toZonedTime(parseISO(endDateStr), APP_TIMEZONE));
      queryStartDateAppTimezone = fromZonedTime(startZoned, APP_TIMEZONE);
      queryEndDateAppTimezone = fromZonedTime(endZoned, APP_TIMEZONE);     
    } else {
      const numDays = daysBack !== undefined ? daysBack : 30;
      const endZoned = startOfDay(todayInAppTimezone);
      const startZoned = subDays(endZoned, numDays);
      queryEndDateAppTimezone = fromZonedTime(endZoned, APP_TIMEZONE);
      queryStartDateAppTimezone = fromZonedTime(startZoned, APP_TIMEZONE);
    }
    if (queryEndDateAppTimezone > todayInAppTimezone) {
      queryEndDateAppTimezone = fromZonedTime(startOfDay(todayInAppTimezone), APP_TIMEZONE);
    }

    const allEntriesInPeriod = await TimeEntry.findAll({
      where: {
        userId,
        timestamp: {
          [Op.between]: [queryStartDateAppTimezone, queryEndDateAppTimezone],
        },
      },
      order: [['timestamp', 'ASC']],
    });

    const entriesByDay: { [key: string]: TimeEntry[] } = {};
    for (const entry of allEntriesInPeriod) {
        const entryDate = format(toZonedTime(entry.timestamp, APP_TIMEZONE), 'yyyy-MM-dd');
        if (!entriesByDay[entryDate]) {
            entriesByDay[entryDate] = [];
        }
        entriesByDay[entryDate].push(entry);
    }

    let currentDateIterator = queryStartDateAppTimezone;
    while (currentDateIterator <= queryEndDateAppTimezone) {
        const formattedDate = format(currentDateIterator, 'yyyy-MM-dd');
        const dailyEntries = entriesByDay[formattedDate] || [];

        let totalMs = 0;
        let clockInTime: Date | null = null;
        let dayStartTime: Date | null = null;
        let dayEndTime: Date | null = null;

        for (const entry of dailyEntries) {
            const entryTime = toZonedTime(entry.timestamp, APP_TIMEZONE);

            if (!dayStartTime) {
                dayStartTime = entryTime;
            }
            dayEndTime = entryTime;

            if (entry.type === TimeEntryType.CLOCK_IN) {
                clockInTime = entryTime;
            } else if (entry.type === TimeEntryType.CLOCK_OUT && clockInTime) {
                totalMs += differenceInMilliseconds(entryTime, clockInTime);
                clockInTime = null;
            }
        }

        summaries.push({
            date: formattedDate,
            totalHours: parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2)),
            startTime: dayStartTime ? format(dayStartTime, 'HH:mm') : undefined,
            endTime: dayEndTime ? format(dayEndTime, 'HH:mm') : undefined,
        });

        currentDateIterator = addDays(currentDateIterator, 1);
    }

    return summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}