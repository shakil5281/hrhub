$body = '{0}' -f '{"email":"superadmin@hrhub.local","password":"superadmin123!"}'
Write-Host "Body: $body"
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
Write-Host "Login:" ($login | ConvertTo-Json)
$token = $login.access_token
if ($token) {
    Write-Host "Token OK, length: $($token.Length)"
    $data = '[{"name":"Cutting","type":"section+group","section_names":["Cutting"],"group_names":["Worker"]}]'
    $headers = @{ Authorization = "Bearer $token" }
    $resp = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/attendance/custom-summary?company_id=b0b60d1f-1bd8-4803-98ab-ecd40d8162f5&date=2026-07-20" -Method Post -ContentType "application/json" -Body $data -Headers $headers
    Write-Host "Response:" ($resp | ConvertTo-Json -Depth 10)
} else {
    Write-Host "Login failed"
}
