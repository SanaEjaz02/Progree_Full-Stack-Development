import { app } from './app.js';
import { connectDatabase, seedCatalogIfEmpty } from './config/database.js';
import { env } from './config/env.js';

try {
  const connection = await connectDatabase();
  await seedCatalogIfEmpty();
  app.listen(env.PORT, () => {
    const databaseLabel = connection.mode === 'memory' ? ' (local fallback DB)' : '';
    console.log(`API listening on port ${env.PORT}${databaseLabel}`);
  });
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exitCode = 1;
}