// backend/src/services/userService.ts

import { User } from '../models/User';

export class UserService {

  static async createUser(name: string, email: string, userCode?: string): Promise<User> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error: any = new Error('Usuário com este e-mail já existe.');
      error.status = 409;
      throw error;
    }
    if (userCode) {
        const existingUserCodeUser = await User.findOne({ where: { userCode } });
        if (existingUserCodeUser) {
            const error: any = new Error('Este código de usuário já está em uso.');
            error.status = 409;
            throw error;
        }
    }

    try {
      const newUser = await User.create({ name, email, userCode });
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Não foi possível criar o usuário.');
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  static async getUserByUserCode(userCode: string): Promise<User | null> {
      if (!userCode) {
          const error: any = new Error('Código de usuário é obrigatório.');
          error.status = 400;
          throw error;
      }
      return await User.findOne({ where: { userCode } });
  }
}