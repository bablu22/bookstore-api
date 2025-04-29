# Bookstore API

A RESTful API for managing a bookstore's inventory and operations.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bablu22/bookstore-api.git
   ```

2. Navigate to the project directory:

   ```bash
   cd bookstore-api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup

The project uses PostgreSQL as its database, which is containerized using Docker.

1. Start the database services:

   ```bash
   docker-compose up -d
   ```

   This command will create and start the following services:

   - PostgreSQL database server (accessible on port 5432)
   - pgAdmin 4 (accessible at http://localhost:5050)

2. Run database migrations:

   ```bash
   npx knex migrate:latest
   ```

3. Seed the database with initial data:
   ```bash
   npx knex seed:run
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bookstore
```

## Running the Application

Start the application:

```bash
npm start
```

The API will be available at `http://localhost:5000`.

For development with automatic reloading:

```bash
npm run dev
```

## pgAdmin Access

You can access pgAdmin to manage your PostgreSQL database:

1. Navigate to http://localhost:5050
2. Login with:
   - Email: admin@example.com
   - Password: admin
3. To connect to the PostgreSQL server:
   - Right-click on "Servers" and select "Create" > "Server"
   - Name: Bookstore (or any name you prefer)
   - Connection tab:
     - Host: postgres (use the service name, not localhost)
     - Port: 5432
     - Username: postgres
     - Password: postgres
     - Database: bookstore

## Development

### Available Scripts

- `npm start`: Start the application
- `npm run dev`: Start the application with nodemon for development
- `npm test`: Run tests
- `npm run lint`: Run ESLint

### Database Management

- Run migrations: `npx knex migrate:latest`
- Create a new migration: `npx knex migrate:make migration_name`
- Run seeds: `npx knex seed:run`
- Create a new seed: `npx knex seed:make seed_name`

## License

[MIT](LICENSE)
