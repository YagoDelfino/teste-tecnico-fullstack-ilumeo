// backend/src/controllers/userController.ts

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class UserController {

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, userCode } = req.body;
      if (!name || !email || !userCode) {
        const error: any = new Error('Nome, e-mail e um código de acesso são obrigatórios para criar um usuário.');
        error.status = 400;
        throw error;
      }
      const newUser = await UserService.createUser(name, email, userCode);
      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userCode: newUser.userCode,
        createdAt: newUser.createdAt.toISOString(),
      });
    } catch (error) {
      next(error); 
    }
  }
  
}