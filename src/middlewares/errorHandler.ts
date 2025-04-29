import { ErrorRequestHandler, Response, Request, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';
import HTTPSTATUS from 'http-status-codes';
import config from '@config/app.config';
import Joi from 'joi';
import { Knex } from 'knex';

interface ErrorResponse {
  message: string;
  errors?: any[];
  error?: string;
  stack?: string;
}

/**
 * Format Joi validation errors into a consistent response format
 */
const formatJoiError = (error: Joi.ValidationError): { message: string; errors: any[] } => {
  const formattedErrors = error.details.map((err) => ({
    field: err.context?.key || 'unknown',
    message: err.message
  }));

  return {
    message: 'Validation error',
    errors: formattedErrors
  };
};

/**
 * Format database constraint errors into a consistent response format
 */
const formatDatabaseError = (error: any): { message: string; errors: any[] } => {
  // Common PostgreSQL error codes
  const errorCode = error.code;
  let message = 'Database error';
  let field = 'unknown';

  // Extract constraint name if available
  const constraintMatch = error.message.match(/constraint\s+"([^"]+)"/i);
  const constraintName = constraintMatch ? constraintMatch[1] : '';

  // Extract column name if available
  const columnMatch = error.message.match(/column\s+"([^"]+)"/i);
  const columnName = columnMatch ? columnMatch[1] : '';

  // Handle specific PostgreSQL error codes
  switch (errorCode) {
    case '23505': // unique_violation
      message = `Duplicate value for ${columnName || constraintName || 'a unique field'}`;
      field = columnName || constraintName;
      break;
    case '23503': // foreign_key_violation
      message = `Referenced record does not exist for ${columnName || constraintName || 'a foreign key'}`;
      field = columnName || constraintName;
      break;
    case '23502': // not_null_violation
      message = `Required field ${columnName || 'unknown'} cannot be null`;
      field = columnName;
      break;
    case '22P02': // invalid_text_representation (often when UUID is invalid)
      message = 'Invalid data format';
      field = columnName || 'unknown';
      break;
    case '42P01': // undefined_table
      message = 'Table does not exist';
      break;
    case '42703': // undefined_column
      message = `Column ${columnName || 'unknown'} does not exist`;
      field = columnName;
      break;
    default:
      message = 'Database error occurred';
  }

  return {
    message,
    errors: [
      {
        field,
        message,
        code: errorCode
      }
    ]
  };
};

/**
 * Check if an error is a PostgreSQL/Knex database error
 */
const isPostgresError = (error: any): boolean => {
  // PostgreSQL errors typically have a code property that is a string
  return Boolean(
    error && typeof error.code === 'string' && error.code.match(/^[0-9A-Z]{5}$/) // PostgreSQL error codes are 5 characters
  );
};

/**
 * Check if an error is a Knex.js database error
 */
const isKnexError = (error: any): boolean => {
  return Boolean(
    error &&
      (error.name === 'KnexError' ||
        (error instanceof Error && error.message.includes('knex')) ||
        error.stack?.includes('knex'))
  );
};

/**
 * Send a formatted error response
 */
const sendErrorResponse = (
  res: Response,
  statusCode: number,
  errorResponse: ErrorResponse
): Response => {
  return res.status(statusCode).json(errorResponse);
};

const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Log all errors in development mode
  if (config.NODE_ENV === 'development') {
    logger.error(`Error occurred on ${req.method} ${req.path}`, {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    // In production, only log unexpected errors
    if (!(error instanceof AppError) && !(error instanceof Joi.ValidationError)) {
      logger.error(`Unexpected error on ${req.method} ${req.path}`, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  // Prepare base error response
  const errorResponse: ErrorResponse = {
    message: 'Internal Server Error'
  };

  // Add stack trace in development
  if (config.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Handle specific error types

  // 1. JSON Syntax Errors
  if (error instanceof SyntaxError && 'body' in error) {
    errorResponse.message = 'Invalid JSON format, please check your request body';
    return sendErrorResponse(res, HTTPSTATUS.BAD_REQUEST, errorResponse);
  }

  // 2. Joi Validation Errors
  if (error instanceof Joi.ValidationError) {
    const formattedError = formatJoiError(error);
    errorResponse.message = formattedError.message;
    errorResponse.errors = formattedError.errors;
    return sendErrorResponse(res, HTTPSTATUS.BAD_REQUEST, errorResponse);
  }

  // 3. PostgreSQL/Knex Database Errors
  if (isPostgresError(error) || isKnexError(error)) {
    const formattedError = formatDatabaseError(error);
    errorResponse.message = formattedError.message;
    errorResponse.errors = formattedError.errors;

    // Choose appropriate status code based on error
    let statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR;

    if (error.code === '23505') {
      // unique_violation
      statusCode = HTTPSTATUS.CONFLICT;
    } else if (['23503', '23502', '22P02', '42P01', '42703'].includes(error.code)) {
      statusCode = HTTPSTATUS.BAD_REQUEST;
    }

    return sendErrorResponse(res, statusCode, errorResponse);
  }

  // 4. Custom AppError
  if (error instanceof AppError) {
    errorResponse.message = error.message;
    errorResponse.error = error.name;
    return sendErrorResponse(res, error.statusCode, errorResponse);
  }

  // 5. Regular Error objects
  if (error instanceof Error) {
    errorResponse.message = error.message || 'Unknown error occurred';
    errorResponse.error = error.name;
    return sendErrorResponse(res, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorResponse);
  }

  // 6. Default case - unknown errors
  errorResponse.message = 'Internal Server Error';
  errorResponse.error = error?.message || 'Unknown error occurred';
  return sendErrorResponse(res, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorResponse);
};

export default errorHandler;
