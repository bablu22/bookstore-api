import bookRoutes from '@modules/books/books.routes';
import { Router } from 'express';

const router = Router();

const moduleRoutes = [
  {
    path: '/books',
    routes: bookRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.routes);
});

export default router;
