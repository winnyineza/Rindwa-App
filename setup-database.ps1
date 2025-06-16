# Rindwa App Database Setup Script
Write-Host "🚀 Setting up Rindwa App Database..." -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    $psqlVersion = psql --version 2>$null
    if ($psqlVersion) {
        Write-Host "✅ PostgreSQL is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ PostgreSQL is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or use Docker: docker-compose up postgres" -ForegroundColor Yellow
    exit 1
}

# Create database
Write-Host "📦 Creating database..." -ForegroundColor Blue
try {
    psql -U postgres -c "CREATE DATABASE rindwa_db;" 2>$null
    Write-Host "✅ Database 'rindwa_db' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database might already exist or there was an error" -ForegroundColor Yellow
}

# Run Prisma migrations
Write-Host "🔄 Setting up database schema..." -ForegroundColor Blue
cd backend
npx prisma generate
npx prisma db push

Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "You can now start the backend with: npm run dev" -ForegroundColor Cyan 