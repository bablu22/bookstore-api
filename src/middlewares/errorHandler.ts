import { z } from 'zod';
import { ErrorRequestHandler, Response } from 'express';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';
import HTTPSTATUS from 'http-status-codes';
import config from '@config/app.config';

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Validation failed',
    errors
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, _next): any => {
  if (config.NODE_ENV === 'development') {
    logger.error(`Error occurred on PATH: ${req.path}`, error);
  }

  // Handling specific error types
  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format, please check your request body'
    });
  }

  if (error instanceof z.ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      error: error.message
    });
  }

  // Catch-all for other error types
  if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`, error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Unknown error occurred',
      error: error.message || 'Unknown error occurred'
    });
  }

  // Default to Internal Server Error for unknown errors
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred'
  });
};

export default errorHandler;
