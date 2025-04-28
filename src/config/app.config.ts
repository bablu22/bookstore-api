import { getEnv } from '@utils/get-env';

const appConfig = () => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '5000')
});

const config = appConfig();

export default config;
