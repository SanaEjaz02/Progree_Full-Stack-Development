import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
  app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exitCode = 1;
}