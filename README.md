# Bookstore API

A RESTful API for managing a bookstore's inventory and operations.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) (optional - for local database setup)

## 🚀 Installation

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

## 💾 Database Setup

### Option 1: Local Database with Docker (Development)

1. Start the database services:

   ```bash
   docker-compose up -d
   ```

   This command will create and start:

   - PostgreSQL database server (accessible on port 5432)
   - pgAdmin 4 (accessible at http://localhost:5050)

2. Configure local environment variables:
   Create a `.env` file in the root directory with:
   ```
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=bookstore
   ```

### Option 2: Cloud Database (Production)

If you prefer not to use Docker, you can connect to a cloud-based PostgreSQL database:

1. Configure environment variables for production:
   Create a `.env` file in the root directory with your cloud database credentials:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=ep-long-river-a42zuta2-pooler.us-east-1.aws.neon.tech
   DB_USER=neondb_owner
   DB_PASSWORD=npg_4aUKWSxXTLd9
   DB_NAME=neondb
   ```

> **Note:** For production environments, store sensitive credentials securely and consider using environment variables rather than a .env file.

## 🔄 Database Migration & Seeding

After connecting to either a local or cloud database:

1. Run database migrations:

   ```bash
   npx knex migrate:latest
   ```

2. Seed the database with initial data:
   ```bash
   npx knex seed:run
   ```

## ▶️ Running the Application

Start the application:

```bash
npm start
```

The API will be available at `http://localhost:5000`.

For development with automatic reloading:

```bash
npm run dev
```

## 🔧 pgAdmin Access (Local Docker Setup Only)

If using the local Docker setup, you can access pgAdmin to manage your PostgreSQL database:

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

## 🛠️ Development

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

## 📝 License

[MIT](LICENSE)
