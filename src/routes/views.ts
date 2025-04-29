import { authorService } from '@modules/authors/author.service';
import { Request, Response } from 'express';

export const homePage = async (req: Request, res: Response) => {
  const authors = await authorService.getAuthors(req.query);

  // Add pagination data to the response
  const pagination = {
    page: authors.pagination.page,
    limit: authors.pagination.limit,
    totalPage: authors.pagination.totalPage
  };

  res.render('home', {
    title: 'Home',
    currentPage: 'home',
    authors: authors.authors,
    pagination
  });
};

export const authorDetailsPage = async (req: Request, res: Response) => {
  const author = await authorService.getAuthor(Number(req.params.id));

  if (!author) {
    return res.status(404).render('404', {
      title: 'Author Not Found',
      currentPage: 'home'
    });
  }

  res.render('authorDetails', {
    title: `Author Details - ${author.name}`,
    currentPage: 'home',
    author
  });
};
