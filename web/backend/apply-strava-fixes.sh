#!/bin/bash
# Quick setup script to apply Strava import fixes

set -e

echo "🚴 VeloMind - Strava Advanced Data Import Fix"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from web/backend directory"
    exit 1
fi

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "📝 Loading environment variables from .env..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
    echo "✅ Environment loaded"
    echo ""
else
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "📊 Step 1: Applying database migration..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set in .env"
    exit 1
fi

psql "$DATABASE_URL" -f src/migrations/add_max_hr_cadence_columns.sql
echo "✅ Database migration applied"
echo ""

echo "🔄 Step 2: Recalculating normalized power for existing sessions..."
node src/scripts/recalculate-normalized-power.js
echo ""

echo "✅ All fixes applied successfully!"
echo ""
echo "Next steps:"
echo "1. Restart the backend server if running"
echo "2. Test by syncing Strava activities from Settings"
echo "3. Check session detail pages for power curves and normalized power"
echo ""
echo "For sessions with missing data, use the 'Sync Strava Data' button"
echo "on the session detail page to manually re-fetch stream data."
