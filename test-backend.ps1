# Test Backend Endpoints

Write-Host "Testing Backend Endpoints..." -ForegroundColor Green

# Test health endpoint
Write-Host "`nTesting Health Endpoint:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7777/api/v1/health" -Method GET
    Write-Host "Health Check: SUCCESS" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test communities endpoint
Write-Host "`nTesting Communities Endpoint:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7777/api/v1/communities?page=0&size=10" -Method GET
    Write-Host "Communities: SUCCESS" -ForegroundColor Green
    Write-Host "Found $($response.content.Count) communities" -ForegroundColor Cyan
} catch {
    Write-Host "Communities: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test posts endpoint
Write-Host "`nTesting Posts Endpoint:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7777/api/v1/posts?page=0&size=10" -Method GET
    Write-Host "Posts: SUCCESS" -ForegroundColor Green
    Write-Host "Found $($response.content.Count) posts" -ForegroundColor Cyan
} catch {
    Write-Host "Posts: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBackend test completed!" -ForegroundColor Green