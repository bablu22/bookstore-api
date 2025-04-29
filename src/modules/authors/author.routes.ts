import { Router } from 'express';

import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from './author.controller';

import { createAuthorSchema, updateAuthorSchema, paramsSchema } from './author.validation';
import { validateBody, validateParams } from '@middlewares/validate';

const authorRoutes = Router();

authorRoutes.get('/', getAllAuthors);
authorRoutes.get('/:id', validateParams(paramsSchema), getAuthorById);
authorRoutes.post('/', validateBody(createAuthorSchema), createAuthor);
authorRoutes.put(
  '/:id',
  validateParams(paramsSchema),
  validateBody(updateAuthorSchema),
  updateAuthor
);
authorRoutes.delete('/:id', validateParams(paramsSchema), deleteAuthor);

export default authorRoutes;
