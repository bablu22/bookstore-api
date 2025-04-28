import db from '@config/knex';
import { IBook, IBookWithAuthor } from './books.interface';
import QueryBuilder from '@utils/queryBuilder';
import { TMeta } from '@utils/sendResponse';

const getBooks = async (
  query: Record<string, unknown>
): Promise<{
  books: IBookWithAuthor[];
  pagination: TMeta;
}> => {
  try {
    // Define parameter mappings for the books table
    const paramMappings = {
      author: 'author_id'
      // Add any other mappings here
    };

    // Define allowed columns explicitly (optional, will be fetched from DB if not provided)
    const allowedColumns = ['id', 'title', 'description', 'published_date', 'author_id'];

    // Create and initialize the query builder
    const qb = new QueryBuilder<any>(db, 'books', query, paramMappings, allowedColumns);
    await qb.initialize();

    // Sanitize the query to remove invalid parameters
    qb.sanitizeQuery();

    qb.search(['title', 'description']);

    if (query.sort) {
      qb.sort();
    } else {
      qb.queryBuilder = qb.queryBuilder.orderBy('books.id', 'asc');
    }

    qb.filter();
    qb.paginate();

    qb.queryBuilder = qb.queryBuilder.join('authors', 'books.author_id', '=', 'authors.id');

    const results = await qb.getResult();

    const pagination = await qb.countTotal();

    const books = results.map((row): IBookWithAuthor => {
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        published_date: row.published_date,
        author_id: row.author_id,
        author: {
          id: row.author_id,
          name: row.name,
          birthdate: row.birthdate,
          bio: row.bio
        }
      };
    });

    return {
      books,
      pagination
    };
  } catch (error) {
    // Handle errors gracefully
    console.error('Error fetching books:', error);
    // Return empty results rather than exposing the error
    return {
      books: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPage: 0
      }
    };
  }
};

export const bookService = {
  getBooks
  // Other methods...
};
