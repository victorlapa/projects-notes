const { Client } = require("pg");

async function createDatabase() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "root",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL server");

    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'billor'"
    );

    if (checkResult.rows.length === 0) {
      await client.query('CREATE DATABASE "billor"');
      console.log('Database "billor" created successfully');
    } else {
      console.log('Database "billor" already exists');
    }
  } catch (error) {
    console.error("Error creating database:", error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

createDatabase();
