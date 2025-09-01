-- Initialize database for Billor application
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- The database will be created automatically by the postgres container

-- Create sample users (will be inserted after TypeORM creates the schema)
DO $$
BEGIN
    -- Wait for application to create tables, then insert sample data
    -- This is handled by the application startup process with synchronize: true
    RAISE NOTICE 'Database initialized. Sample data will be created by the application.';
END $$;