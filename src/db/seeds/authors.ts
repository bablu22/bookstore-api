import { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('authors').del();

  const authors = Array(10)
    .fill(null)
    .map((_, index) => {
      return {
        id: index + 1,
        name: faker.person.fullName(),
        bio: faker.person.bio(),
        birthdate: faker.date.birthdate({ min: 1950, max: 2000, mode: 'age' }),
        created_at: new Date(),
        updated_at: new Date()
      };
    });

  await knex('authors').insert(authors);
}
