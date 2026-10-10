import { app } from './app.js';
import { connectDatabase, seedCatalog, seedDemoUser } from './config/database.js';
import { env } from './config/env.js';

try {
  const connection = await connectDatabase();
  await seedCatalog();
  await seedDemoUser();
  app.listen(env.PORT, () => {
    const databaseLabel = connection.mode === 'memory' ? ' (local fallback DB)' : '';
    console.log(`API listening on port ${env.PORT}${databaseLabel}`);
  });
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exitCode = 1;
}