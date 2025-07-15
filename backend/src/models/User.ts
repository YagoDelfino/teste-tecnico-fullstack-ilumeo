// backend/src/models/User.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import { TimeEntry } from './TimeEntry';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  userCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public userCode?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getTimeEntries!: () => Promise<TimeEntry[]>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    userCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'user_code',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  }
);