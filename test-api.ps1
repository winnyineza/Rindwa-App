# Rindwa App API Test Script
Write-Host "Testing Rindwa App API Endpoints" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
    Write-Host "Health Check: $($health.StatusCode) - $($health.Content)" -ForegroundColor Green
} catch {
    Write-Host "Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: User Registration
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        name = "Test User"
        email = "test@example.com"
        password = "password123"
        phone = "+1234567890"
    } | ConvertTo-Json
    
    $register = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $registerData = $register.Content | ConvertFrom-Json
    $token = $registerData.token
    Write-Host "User Registration: $($register.StatusCode) - User ID: $($registerData.user.id)" -ForegroundColor Green
} catch {
    Write-Host "User Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: User Login
Write-Host "3. Testing User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    $login = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginData = $login.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "User Login: $($login.StatusCode) - Token received" -ForegroundColor Green
} catch {
    Write-Host "User Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create Incident
Write-Host "4. Testing Incident Creation..." -ForegroundColor Yellow
try {
    $incidentBody = @{
        type = "Emergency"
        description = "Test emergency incident"
        location = "Test Location"
        priority = "high"
        latitude = 40.7128
        longitude = -74.0060
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $incident = Invoke-WebRequest -Uri "http://localhost:3000/api/incidents" -Method POST -Body $incidentBody -Headers $headers
    $incidentData = $incident.Content | ConvertFrom-Json
    Write-Host "Incident Creation: $($incident.StatusCode) - Incident ID: $($incidentData.id)" -ForegroundColor Green
} catch {
    Write-Host "Incident Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Incidents
Write-Host "5. Testing Get Incidents..." -ForegroundColor Yellow
try {
    $incidents = Invoke-WebRequest -Uri "http://localhost:3000/api/incidents" -Method GET
    $incidentsData = $incidents.Content | ConvertFrom-Json
    Write-Host "Get Incidents: $($incidents.StatusCode) - Found $($incidentsData.Count) incidents" -ForegroundColor Green
} catch {
    Write-Host "Get Incidents Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "API Testing Complete!" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3001 for Admin Dashboard" -ForegroundColor White
Write-Host "2. Use Expo Go app to scan QR code for Mobile App" -ForegroundColor White
Write-Host "3. Test the mobile app with the created user account" -ForegroundColor White 