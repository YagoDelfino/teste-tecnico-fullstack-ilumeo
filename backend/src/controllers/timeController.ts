// backend/src/controllers/timeController.ts

import { Request, Response, NextFunction } from 'express';
import { TimeService } from '../services/timeService';

export class TimeController {

  static async clockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      if (!userId) {
        const error: any = new Error('ID do usuário é obrigatório para bater o ponto.');
        error.status = 400;
        throw error;
      }
      const entry = await TimeService.clockIn(userId);
      res.status(201).json({
        id: entry.id,
        userId: entry.userId,
        timestamp: entry.timestamp.toISOString(),
        type: entry.type,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      if (!userId) {
        const error: any = new Error('ID do usuário é obrigatório para bater o ponto.');
        error.status = 400;
        throw error;
      }
      const entry = await TimeService.clockOut(userId);
      res.status(201).json({
        id: entry.id,
        userId: entry.userId,
        timestamp: entry.timestamp.toISOString(),
        type: entry.type,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatusAndEntriesToday(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) {
        const error: any = new Error('ID do usuário é obrigatório para obter o status.');
        error.status = 400;
        throw error;
      }
      const status = await TimeService.getStatusAndEntriesToday(userId);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  static async getDailySummaries(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { daysBack, startDate, endDate } = req.query;
      if (!userId) {
        const error: any = new Error('ID do usuário é obrigatório para obter os resumos.');
        error.status = 400;
        throw error;
      }

      const summaries = await TimeService.getDailySummaries(
        userId,
        daysBack ? parseInt(daysBack as string, 10) : undefined,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(summaries);
    } catch (error) {
      next(error);
    }
  }
}   