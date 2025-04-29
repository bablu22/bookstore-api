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
import { authorDetailsPage, homePage } from '@routes/views';
import expressLayouts from 'express-ejs-layouts';
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000 // Limit each IP to 1000 requests per window
});

const rootDir = process.cwd();

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
app.set('view engine', 'ejs');
app.set('views', `${rootDir}/src/views`);
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Routes Setup
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/', homePage);
router.get('/authors/details/:id', authorDetailsPage);
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
