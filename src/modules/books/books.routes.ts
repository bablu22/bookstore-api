import { Router } from 'express';

import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from './books.controller';
import { createBookSchema, paramsSchema, updateBookSchema } from './book.validation';
import { validateBody, validateParams } from '@middlewares/validate';

const bookRoutes = Router();

bookRoutes.get('/', getAllBooks);
bookRoutes.get('/:id', getBookById);
bookRoutes.post('/', validateBody(createBookSchema), createBook);
bookRoutes.put('/:id', validateParams(paramsSchema), validateBody(updateBookSchema), updateBook);
bookRoutes.delete('/:id', validateParams(paramsSchema), deleteBook);

export default bookRoutes;
