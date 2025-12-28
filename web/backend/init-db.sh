#!/bin/bash
# Database initialization script for VeloMind Production
# This script sets up the PostgreSQL database schema and runs all migrations

echo "🚀 Initializing VeloMind Database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your Neon PostgreSQL connection string"
    exit 1
fi

echo "📊 Creating main schema..."
psql "$DATABASE_URL" -f src/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Error creating schema"
    exit 1
fi

echo ""
echo "🔄 Running migrations..."

# Run Strava columns migration
echo "  - Adding Strava columns..."
psql "$DATABASE_URL" -f src/migrations/add_strava_columns.sql

# Run performance indexes migration
echo "  - Adding performance indexes..."
psql "$DATABASE_URL" -f src/migrations/add_performance_indexes.sql

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Error running migrations"
    exit 1
fi

echo ""
echo "🎉 Database initialization complete!"
echo ""
echo "Testing connection..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

if [ $? -eq 0 ]; then
    echo "✅ Database is ready for use"
else
    echo "⚠️  Warning: Could not verify database connection"
fi
