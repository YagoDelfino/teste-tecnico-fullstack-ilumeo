// backend/src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class AuthController {
  static async loginWithUserCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { userCode } = req.body;

      if (!userCode) {
        const error: any = new Error('Código de usuário não fornecido.');
        error.status = 400;
        throw error;
      }

      const user = await UserService.getUserByUserCode(userCode);

      if (!user) {
        const error: any = new Error('Código de usuário inválido.');
        error.status = 401;
        throw error;
      }

      res.status(200).json({
        userId: user.id,
        name: user.name,
      });
    } catch (error) {
      next(error);
    }
  }
}