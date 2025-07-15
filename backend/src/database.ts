// backend/src/config/database.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'time_tracker_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'db';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DIALECT = 'postgres';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DIALECT,
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  },
  dialectOptions: {

  }
});


export const createDatabaseIfNotExist = async () => {
  const sequelizeAdmin = new Sequelize('postgres', DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DIALECT,
    logging: false,
  });

  try {
    await sequelizeAdmin.authenticate();
    console.log('Conexão estabelecida com o banco de dados "postgres" (admin).');

    const [results]: any = await sequelizeAdmin.query(
      `SELECT FROM pg_database WHERE datname = '${DB_NAME}';`
    );

    if (results.length === 0) {
      console.log(`Banco de dados "${DB_NAME}" não existe. Criando...`);
      await sequelizeAdmin.query(`CREATE DATABASE "${DB_NAME}";`);
      console.log(`Banco de dados "${DB_NAME}" criado com sucesso.`);
    } else {
      console.log(`Banco de dados "${DB_NAME}" já existe.`);
    }
  } catch (error) {
    console.error('Erro ao criar ou verificar o banco de dados:', error);
    throw error;
  } finally {    await sequelizeAdmin.close();
  }
};


export default sequelize;