import { IAuthor } from '@modules/authors/author.interface';
import { Knex } from 'knex';

export interface IBook {
  id: number;
  title: string;
  description: string;
  published_date: Date;
  author_id: number;
}

export interface IBookWithAuthor extends IBook {
  author: IAuthor;
}

declare module 'knex/types/tables' {
  interface Tables {
    books: Knex.CompositeTableType<IBook, Omit<IBook, 'id'>, Partial<Omit<IBook, 'id'>>>;
  }
}
