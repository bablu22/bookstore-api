import db from '@config/knex';
import { Request } from 'express';
import { AppError } from '@utils/AppError';
import { TMeta } from '@utils/sendResponse';
import QueryBuilder from '@utils/queryBuilder';
import { IAuthor, IAuthorWithBooks } from './author.interface';

const getAuthors = async (
  query: Record<string, unknown>
): Promise<{
  authors: IAuthor[];
  pagination: TMeta;
}> => {
  const allowedColumns = ['id', 'name', 'birthdate', 'bio'];

  const qb = new QueryBuilder<any>(db, 'authors', query, {}, allowedColumns);
  await qb.initialize();

  qb.sanitizeQuery();

  qb.search(['name', 'bio']);

  if (query.sort) {
    qb.sort();
  } else {
    qb.queryBuilder = qb.queryBuilder.orderBy('authors.id', 'asc');
  }

  qb.filter();
  qb.paginate();

  // qb.queryBuilder = qb.queryBuilder
  //   .select(
  //     'authors.*',
  //     db.raw(`
  //     COALESCE(
  //       JSON_AGG(
  //         JSON_BUILD_OBJECT(
  //           'id', books.id,
  //           'title', books.title,
  //           'description', books.description
  //         )
  //       ) FILTER (WHERE books.id IS NOT NULL),
  //       '[]'
  //     ) as books
  //   `)
  //   )
  //   .leftJoin('books', 'authors.id', '=', 'books.author_id')
  //   .groupBy('authors.id');

  const authors = await qb.getResult();
  const pagination = await qb.countTotal();

  // authors with books

  const result = authors.map((author) => {
    return author;
  });

  return { authors: result, pagination };
};

const getAuthor = async (id: number): Promise<IAuthorWithBooks | null> => {
  const author = await db('authors')
    .where('authors.id', id)
    .select(
      'authors.*',
      db.raw(`
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', books.id,
              'title', books.title,
              'description', books.description
            )
          ) FILTER (WHERE books.id IS NOT NULL),
          '[]'
        ) as books
      `)
    )
    .leftJoin('books', 'authors.id', '=', 'books.author_id')
    .groupBy('authors.id');

  if (!author) {
    throw new AppError("The author doesn't exist", 404);
  }

  return author[0];
};

const createAuthor = async (req: Request): Promise<IAuthor> => {
  const { name, birthdate, bio } = req.body as IAuthor;

  const [author] = await db('authors').insert(
    {
      name,
      birthdate,
      bio
    },
    ['*']
  );

  return author;
};

const updateAuthor = async (req: Request): Promise<IAuthor> => {
  const authorId = Number(req.params.id);
  const { name, birthdate, bio } = req.body as IAuthor;

  const authorExists = await db('authors').where('id', authorId).first();

  if (!authorExists) {
    throw new AppError("The author doesn't exist", 404);
  }

  const updatedAuthor = await db('authors').where('id', authorId).update(
    {
      name,
      birthdate,
      bio
    },
    ['*']
  );

  return updatedAuthor[0];
};

const deleteAuthor = async (req: Request): Promise<null> => {
  const authorId = Number(req.params.id);

  const authorExists = await db('authors').where('id', authorId).first();

  if (!authorExists) {
    throw new AppError("The author doesn't exist", 404);
  }

  await db('authors').where('id', authorId).del();

  return null;
};

export const authorService = {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
