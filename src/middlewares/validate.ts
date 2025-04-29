import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

const validateBody = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.validateAsync(req.body, {
        abortEarly: false
      });

      req.body = validatedData;
      next();
    } catch (err) {
      next(err);
    }
  };
};

const validateParams = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate only the params against the schema
      const validatedData = await schema.validateAsync(req.params, {
        abortEarly: false
      });

      // Update the request params with validated data
      req.params = validatedData;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export { validateBody, validateParams };
