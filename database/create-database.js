const { Client } = require('pg');

async function createDatabase() {
  // Connect to PostgreSQL server (not to a specific database)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    // Don't specify database to connect to server level
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'project-notes'"
    );

    if (checkResult.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE "project-notes"');
      console.log('Database "project-notes" created successfully');
    } else {
      console.log('Database "project-notes" already exists');
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createDatabase();