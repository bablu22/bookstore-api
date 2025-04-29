import db from '@config/knex';
import { IBook, IBookWithAuthor } from './books.interface';
import QueryBuilder from '@utils/queryBuilder';
import { TMeta } from '@utils/sendResponse';
import { AppError } from '@utils/AppError';
import { Request } from 'express';

const getBooks = async (
  query: Record<string, unknown>
): Promise<{
  books: IBookWithAuthor[];
  pagination: TMeta;
}> => {
  const paramMappings = {
    author: 'author_id'
  };

  const allowedColumns = ['id', 'title', 'description', 'published_date', 'author_id'];

  // Create and initialize the query builder
  const qb = new QueryBuilder<any>(db, 'books', query, paramMappings, allowedColumns);
  await qb.initialize();

  qb.sanitizeQuery();

  qb.search(['title', 'description']);

  if (query.sort) {
    qb.sort();
  } else {
    qb.queryBuilder = qb.queryBuilder.orderBy('books.id', 'asc');
  }

  qb.filter();
  qb.paginate();

  qb.queryBuilder = qb.queryBuilder
    .join('authors', 'books.author_id', '=', 'authors.id')
    .select(
      'books.*',
      { author_id: 'authors.id' },
      { author_name: 'authors.name' },
      { author_birthdate: 'authors.birthdate' },
      { author_bio: 'authors.bio' }
    );

  const results = await qb.getResult();

  const pagination = await qb.countTotal();

  const books = results.map((book) => {
    return {
      id: book.id,
      title: book.title,
      description: book.description,
      published_date: book.published_date,
      author_id: book.author_id,
      author: {
        id: book.author_id,
        name: book.author_name,
        birthdate: book.author_birthdate,
        bio: book.author_bio
      }
    };
  });

  return {
    books,
    pagination
  };
};

const getBook = async (id: number): Promise<IBookWithAuthor | null> => {
  const rawBook = await db('books')
    .join('authors', 'books.author_id', '=', 'authors.id')
    .where('books.id', id)
    .select(
      'books.id',
      'books.title',
      'books.description',
      'books.published_date',
      'books.created_at',
      'books.updated_at',
      'books.author_id',
      { author_id: 'authors.id' },
      { author_name: 'authors.name' },
      { author_birthdate: 'authors.birthdate' },
      { author_bio: 'authors.bio' }
    )
    .first();

  if (!rawBook) {
    throw new AppError("The book doesn't exist", 404);
  }

  // ✅ Transform the flat result into nested `author`
  const book = {
    id: rawBook.id,
    title: rawBook.title,
    description: rawBook.description,
    published_date: rawBook.published_date,
    created_at: rawBook.created_at,
    updated_at: rawBook.updated_at,
    author_id: rawBook.author_id,
    author: {
      id: rawBook.author_id,
      name: rawBook.author_name,
      birthdate: rawBook.author_birthdate,
      bio: rawBook.author_bio
    }
  };

  return book;
};

const createBook = async (req: Request): Promise<IBook> => {
  const { title, description, published_date, author_id } = req.body as IBook;

  // check if the author exists
  const author = await db('authors').where('id', author_id).first();

  if (!author) {
    throw new AppError("The author doesn't exist", 404);
  }

  const [book] = await db('books').insert(
    {
      title,
      description,
      published_date,
      author_id
    },
    ['*']
  );

  return book;
};

const updateBook = async (req: Request): Promise<IBook> => {
  const bookId = Number(req.params.id);
  const { title, description, published_date, author_id } = req.body as IBook;

  // check if the book exists

  const bookExists = await db('books').where('id', bookId).first();

  if (!bookExists) {
    throw new AppError("The book doesn't exist", 404);
  }

  // check if the author exists
  const author = await db('authors').where('id', author_id).first();

  if (!author) {
    throw new AppError("The author doesn't exist", 404);
  }

  const updatedBook = await db('books').where('id', bookId).update(
    {
      title,
      description,
      published_date,
      author_id
    },
    ['*']
  );

  return updatedBook[0];
};

const deleteBook = async (req: Request): Promise<null> => {
  const bookId = Number(req.params.id);

  // check if the book exists
  const bookExists = await db('books').where('id', bookId).first();

  if (!bookExists) {
    throw new AppError("The book doesn't exist", 404);
  }

  await db('books').where('id', bookId).del(['*']);

  return null;
};

export const bookService = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};
