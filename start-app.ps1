# Rindwa App Startup Script
# This script starts all services for the Rindwa App

Write-Host "🚀 Starting Rindwa App Services..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Blue

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start database and backend services
Write-Host "🗄️  Starting database and backend services..." -ForegroundColor Yellow
try {
    docker-compose up -d postgres
    Write-Host "✅ PostgreSQL started" -ForegroundColor Green
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Start backend
    Write-Host "🔧 Starting backend API..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal
    Write-Host "✅ Backend API started" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to start database/backend services" -ForegroundColor Red
    exit 1
}

# Start admin dashboard
Write-Host "📊 Starting admin dashboard..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-dashboard; npm start" -WindowStyle Normal
    Write-Host "✅ Admin dashboard started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start admin dashboard" -ForegroundColor Red
}

# Start frontend (Expo)
Write-Host "📱 Starting Expo development server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal
    Write-Host "✅ Expo development server started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start Expo server" -ForegroundColor Red
}

# Wait a moment for services to start
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Run health check
Write-Host "🔍 Running health check..." -ForegroundColor Yellow
try {
    node scripts/health-check.js
} catch {
    Write-Host "⚠️  Health check failed, but services may still be starting..." -ForegroundColor Yellow
}

Write-Host "`n🎉 Rindwa App Services Started!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Blue
Write-Host "📱 Mobile App: Scan QR code from Expo" -ForegroundColor Cyan
Write-Host "📊 Admin Dashboard: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔧 API Documentation: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "🗄️  Database: localhost:5432" -ForegroundColor Cyan

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "- Use 'docker-compose logs -f' to view service logs" -ForegroundColor White
Write-Host "- Use 'docker-compose down' to stop all services" -ForegroundColor White
Write-Host "- Check DEPLOYMENT.md for detailed instructions" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 