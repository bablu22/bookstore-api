import Knex from 'knex';

const db = Knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: true
    }
  },
  pool: {
    min: 2,
    max: 10
  }
});

export default db;
