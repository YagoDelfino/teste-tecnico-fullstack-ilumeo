import sequelize from '../database';
import { User, TimeEntry } from '../models';
import { toZonedTime } from 'date-fns-tz'; 

const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

enum TimeEntryType {
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
}

interface SeedUser {
  id: string;
  name: string;
  email: string;
  userCode: string;
}

const seed = async () => {
  try {

    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('🔗 Conexão com o banco de dados estabelecida e modelos sincronizados.');

    await TimeEntry.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });


    const usersToSeed: SeedUser[] = [
      {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        name: 'Colaborador Ilumeo',
        email: 'colaborador@ilumeo.com',
        userCode: 'ILUMEO123',
      },
    ];

    const createdUsers = await User.bulkCreate(usersToSeed);


    const mainUser = createdUsers.find(u => u.userCode === 'ILUMEO123');
    if (!mainUser) {
      console.error('Erro: Usuário principal não encontrado após criação.');
      return;
    }


    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const createTimeEntryDate = (
      year: number,
      month: number,
      day: number,
      hours: number,
      minutes: number
    ): Date => {
      const dateInAppTimezone = new Date(year, month, day, hours, minutes);
      const zonedDate = toZonedTime(dateInAppTimezone, APP_TIMEZONE);
      return zonedDate;
    };

    const entriesToSeed = [];


    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 8, 9, 0), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 8, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );
    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 9, 8, 30), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 9, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );
    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 10, 9, 15), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 10, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );
    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 11, 8, 0), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, currentMonth, 11, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );

    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 5, 28, 9, 0), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 5, 28, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );
    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 5, 25, 9, 0), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 5, 25, 17, 15), type: TimeEntryType.CLOCK_OUT }
    );

    entriesToSeed.push(
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 4, 15, 10, 0), type: TimeEntryType.CLOCK_IN },
      { userId: mainUser.id, timestamp: createTimeEntryDate(currentYear, 4, 15, 17, 0), type: TimeEntryType.CLOCK_OUT }
    );


    await TimeEntry.bulkCreate(entriesToSeed);
    console.log('✅ Dados de seed inseridos com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao executar o seed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();