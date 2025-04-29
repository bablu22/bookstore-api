import authorRoutes from '@modules/authors/author.routes';
import bookRoutes from '@modules/books/books.routes';
import { Router } from 'express';

const router = Router();

const moduleRoutes = [
  {
    path: '/books',
    routes: bookRoutes
  },
  {
    path: '/authors',
    routes: authorRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.routes);
});

export default router;
