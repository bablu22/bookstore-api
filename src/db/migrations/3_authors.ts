import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('authors', (table) => {
    table.text('bio').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('authors', (table) => {
    table.dropColumn('bio');
  });
}
