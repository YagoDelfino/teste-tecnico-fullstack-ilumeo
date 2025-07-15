// backend/src/server.ts

import app from './app';
import { syncDatabase } from './models';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {

    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1); 
  }
};

startServer();