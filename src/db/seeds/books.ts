import { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('books').del();

  const authors = await knex('authors').select('id');

  const books = authors.map((author) => {
    return {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      published_date: faker.date.past({ years: 10 }),
      created_at: new Date(),
      updated_at: new Date(),
      author_id: author.id
    };
  });

  await knex('books').insert(books);
}
