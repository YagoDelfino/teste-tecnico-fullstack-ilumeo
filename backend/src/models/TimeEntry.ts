// backend/src/models/TimeEntry.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import { User } from './User';


export enum TimeEntryType {
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
}


interface TimeEntryAttributes {
  id: string;
  userId: string; 
  timestamp: Date;
  type: TimeEntryType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TimeEntryCreationAttributes extends Optional<TimeEntryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TimeEntry extends Model<TimeEntryAttributes, TimeEntryCreationAttributes> implements TimeEntryAttributes {
  public id!: string;
  public userId!: string;
  public timestamp!: Date;
  public type!: TimeEntryType;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: () => Promise<User>; 
}


TimeEntry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TimeEntryType)), 
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'time_entries',
    modelName: 'TimeEntry',
  }
);