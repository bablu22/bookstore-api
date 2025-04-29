import { IBook } from '@modules/books/books.interface';
import { Knex } from 'knex';

export interface IAuthor {
  id: number;
  name: string;
  birthdate: Date;
  bio: string;
}

export interface IAuthorWithBooks extends IAuthor {
  books: IBook[];
}

declare module 'knex/types/tables' {
  interface Tables {
    authors: Knex.CompositeTableType<IAuthor, Omit<IAuthor, 'id'>, Partial<Omit<IAuthor, 'id'>>>;
  }
}
