// backend/src/models/index.ts

import sequelize,  { createDatabaseIfNotExist } from '../database';
import { User } from './User';
import { TimeEntry } from './TimeEntry';


User.hasMany(TimeEntry, {
  foreignKey: 'userId', 
  as: 'timeEntries',  
  onDelete: 'CASCADE',
});


TimeEntry.belongsTo(User, {
  foreignKey: 'userId', 
  as: 'user',           
});

export const syncDatabase = async () => {
  try {
    await createDatabaseIfNotExist();

    await sequelize.authenticate();
    console.log('Conexão com o banco de dados da aplicação estabelecida com sucesso.');

    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados (tabelas criadas/atualizadas).');
  } catch (error) {
    console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
    process.exit(1);
  }
};

export { User, TimeEntry };
