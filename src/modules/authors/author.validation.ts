import Joi from 'joi';

export const createAuthorSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Please provide a name'
  }),

  birthdate: Joi.date().required().messages({
    'any.required': 'Please provide a birthdate'
  }),

  bio: Joi.string().required().messages({
    'any.required': 'Please provide a biography'
  })
});

export const updateAuthorSchema = Joi.object({
  name: Joi.string().optional().messages({
    'any.required': 'Please provide a name'
  }),

  birthdate: Joi.date().optional().messages({
    'any.required': 'Please provide a birthdate'
  }),

  bio: Joi.string().optional().messages({
    'any.required': 'Please provide a biography'
  })
}).or('name', 'birthdate', 'bio');

export const paramsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'ID must be a positive number',
    'any.required': 'Params ID is required'
  })
});
