import { Router } from 'express';

import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from './books.controller';

const bookRoutes = Router();

bookRoutes.get('/', getAllBooks);
bookRoutes.get('/:id', getBookById);
bookRoutes.post('/', createBook);
bookRoutes.put('/:id', updateBook);
bookRoutes.delete('/:id', deleteBook);

export default bookRoutes;
