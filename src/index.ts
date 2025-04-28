import 'module-alias/register';
import 'dotenv/config';

import config from '@config/app.config';
import notFound from '@middlewares/404';
import errorHandler from '@middlewares/errorHandler';
import router from '@routes/index';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '@utils/logger';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000 // Limit each IP to 1000 requests per window
});

// make uploads folder public to access images
const rootDir = process.cwd();
app.use(`/uploads`, express.static(`${rootDir}/uploads`));

// General middleware initialization
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

app.use(limiter);
app.use(helmet());

// Routes Setup
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/', router);

app.use(notFound);
app.use(errorHandler);

// Log all global incoming requests
app.use((req, res, next) => {
  logger.info(`[Global] Incoming request: ${req.method} ${req.url}`);
  next();
});

app.listen(config.PORT, async () => {
  console.log(
    chalk.black.bgWhite(`🛜 Server listening on port ${config.PORT} in ${config.NODE_ENV} mode ✅ `)
  );
});
