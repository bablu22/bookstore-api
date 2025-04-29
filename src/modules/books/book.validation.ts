import Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Please provide a title'
  }),

  description: Joi.string().required().messages({
    'any.required': 'Please provide a description'
  }),

  published_date: Joi.date().required().messages({
    'any.required': 'Please provide a published date'
  }),

  author_id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Author ID must be a positive number',
    'any.required': 'Author ID is required'
  })
});

export const updateBookSchema = Joi.object({
  title: Joi.string().optional().messages({
    'any.required': 'Please provide a title'
  }),

  description: Joi.string().optional().messages({
    'any.required': 'Please provide a description'
  }),

  published_date: Joi.date().optional().messages({
    'any.required': 'Please provide a published date'
  }),

  author_id: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Author ID must be a positive number',
    'any.required': 'Author ID is required'
  })
}).or('title', 'description', 'published_date', 'author_id');

export const paramsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'ID must be a positive number',
    'any.required': 'Params ID is required'
  })
});
