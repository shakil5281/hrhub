<#
.SYNOPSIS
  Build and deploy HRHub project as "Hub" on IIS + Windows Services
.DESCRIPTION
  This script builds the Go backend, Next.js frontend, and a Go reverse proxy gateway,
  then configures IIS, installs WinSW services, and starts everything.
.PARAMETER NoIIS
  Skip IIS configuration
.PARAMETER NoServices
  Skip WinSW service installation (build only)
.PARAMETER SkipBuild
  Skip build steps (deploy only)
#>

param(
  [switch]$NoIIS,
  [switch]$NoServices,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ROOT = Resolve-Path "$PSScriptRoot\.."
$BINARY = "$ROOT\hub.exe"
$GATEWAY = "$ROOT\hub-gateway.exe"
$DEPLOY = "$ROOT\deploy"
$WWWROOT = "$ROOT\wwwroot"
$WINSW_URL = "https://github.com/winsw/winsw/releases/download/v3.1.0/WinSW-x64.exe"
$WINSW_EXE = "$DEPLOY\WinSW-x64.exe"

# ─── 1. Prerequisites ────────────────────────────────────────────────────────
Write-Host "=== Checking Prerequisites ===" -ForegroundColor Cyan

# Admin check
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Warning "Not running as Administrator. Some steps may fail (IIS, services, firewall)."
}

# Go
$goVer = go version 2>$null
if (-not $goVer) { Write-Error "Go not found. Install Go 1.26+"; return }
Write-Host "  Go: $goVer"

# Node
$nodeVer = node --version 2>$null
if (-not $nodeVer) { Write-Error "Node.js not found."; return }
Write-Host "  Node: $nodeVer"

# PostgreSQL
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) { Write-Warning "  psql not in PATH. Ensure PostgreSQL is running." }

# IIS
$iis = Get-Service W3SVC -ErrorAction SilentlyContinue
if ($iis -and $iis.Status -eq "Running") {
  Write-Host "  IIS: Running"
} else {
  Write-Warning "  IIS W3SVC is not running."
}

# URL Rewrite module
$rewriteModule = Get-WebGlobalModule | Where-Object { $_.Name -eq "RewriteModule" } 2>$null
if ($rewriteModule) {
  Write-Host "  URL Rewrite Module: Installed"
} else {
  Write-Warning "  URL Rewrite Module not detected. Trying to install..."
  $rewriteUrl = "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi"
  $rewriteOut = "$env:TEMP\rewrite_amd64_en-US.msi"
  try {
    Invoke-WebRequest -Uri $rewriteUrl -OutFile $rewriteOut -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i `"$rewriteOut`" /quiet /norestart" -Wait -NoNewWindow
    Write-Host "  URL Rewrite Module: Installed"
  } catch {
    Write-Warning "  Could not install URL Rewrite Module. Reverse proxy in web.config won't work."
  }
}

# ─── 1.5 Clean Old Binaries (hrhub rename → hub) ──────────────────────────
$oldBinaries = @(
    "$ROOT\hrhub.exe",
    "$ROOT\server.exe",
    "$ROOT\employee.exe",
    "$ROOT\reset.exe"
)
foreach ($f in $oldBinaries) {
    if (Test-Path $f) { Remove-Item $f -Force; Write-Host "  Removed old: $(Split-Path $f -Leaf)" }
}

# Remove old IIS sites
@("ERPHub") | ForEach-Object {
    $site = Get-Website -Name $_ -ErrorAction SilentlyContinue
    if ($site) { Remove-Website -Name $_; Write-Host "  Removed old IIS site: $_" }
}

# ─── 2. Build ────────────────────────────────────────────────────────────────
if (-not $SkipBuild) {
  Write-Host "`n=== Building Backend (hub.exe) ===" -ForegroundColor Cyan
  Set-Location $ROOT
  go build -o $BINARY -ldflags="-s -w" ./cmd/server
  if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; return }
  Write-Host "  → $BINARY"

  Write-Host "`n=== Building Gateway (hub-gateway.exe) ===" -ForegroundColor Cyan
  go build -o $GATEWAY -ldflags="-s -w" ./cmd/gateway
  if ($LASTEXITCODE -ne 0) { Write-Error "Gateway build failed"; return }
  Write-Host "  → $GATEWAY"

  Write-Host "`n=== Building Frontend (Next.js) ===" -ForegroundColor Cyan
  Set-Location "$ROOT\web"
  npm install --silent 2>$null
  npm run build
  if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; return }
  Write-Host "  → web\.next\standalone"

  # Copy standalone files correctly
  $standalone = "$ROOT\web\.next\standalone"
  if (Test-Path "$standalone\web") {
    Write-Host "  Restructuring standalone output..."
    Copy-Item "$standalone\web\*" "$standalone\" -Recurse -Force
    Remove-Item "$standalone\web" -Recurse -Force -ErrorAction SilentlyContinue
  }
  # Copy public and static assets
  if (Test-Path "$ROOT\web\public") {
    Copy-Item "$ROOT\web\public\*" "$standalone\public\" -Recurse -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path "$ROOT\web\.next\static") {
    New-Item -ItemType Directory -Force -Path "$standalone\.next\static" | Out-Null
    Copy-Item "$ROOT\web\.next\static\*" "$standalone\.next\static\" -Recurse -Force
  }

  Write-Host "`n=== Build Complete ===" -ForegroundColor Green
} else {
  Write-Host "`n=== Skipping Build ===" -ForegroundColor Yellow
}

# ─── 3. WinSW Setup ─────────────────────────────────────────────────────────
if (-not $NoServices) {
  Write-Host "`n=== Setting up Windows Services ===" -ForegroundColor Cyan

  # Download WinSW if not present
  if (-not (Test-Path $WINSW_EXE)) {
    Write-Host "  Downloading WinSW..."
    Invoke-WebRequest -Uri $WINSW_URL -OutFile $WINSW_EXE -UseBasicParsing
  }

  # Stop existing services if any
  @("HubAPI", "HubWeb", "HubGateway") | ForEach-Object {
    $svc = Get-Service $_ -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq "Running") {
      Stop-Service $_ -Force
      Start-Sleep 1
    }
  }

  # Install services
  $services = @(
    @{ Name="HubAPI"; Xml="hub-service-backend.xml" },
    @{ Name="HubWeb"; Xml="hub-service-frontend.xml" },
    @{ Name="HubGateway"; Xml="hub-service-gateway.xml" }
  )

  foreach ($svc in $services) {
    $svcExe = "$DEPLOY\$($svc.Name)-service.exe"
    $svcXml = "$DEPLOY\$($svc.Xml)"

    # Remove old service if exists
    $existing = Get-Service $svc.Name -ErrorAction SilentlyContinue
    if ($existing) {
      sc.exe delete $svc.Name 2>$null
      Start-Sleep 1
    }

    # Copy WinSW as the service exe
    Copy-Item $WINSW_EXE $svcExe -Force

    # Copy XML to match exe name
    $targetXml = "$DEPLOY\$($svc.Name)-service.xml"
    Copy-Item $svcXml $targetXml -Force

    # Replace %BASE% with actual path
    (Get-Content $targetXml) -replace '%BASE%', $ROOT.Replace('\','\\') | Set-Content $targetXml

    # Install
    Write-Host "  Installing $($svc.Name)..."
    & $svcExe install
    Start-Sleep 1
  }

  Write-Host "  Starting services..."
  Start-Service HubAPI
  Start-Sleep 3
  Start-Service HubWeb
  Start-Sleep 2
  Start-Service HubGateway

  Write-Host "  Services installed and started." -ForegroundColor Green
} else {
  Write-Host "`n=== Skipping Service Installation ===" -ForegroundColor Yellow
}

# ─── 4. IIS Configuration ──────────────────────────────────────────────────
if (-not $NoIIS) {
  Write-Host "`n=== Configuring IIS ===" -ForegroundColor Cyan

  Import-Module WebAdministration -Force -ErrorAction SilentlyContinue

  # Stop Default Web Site if using port 80 (gateway handles port 80 now)
  $defaultSite = Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
  if ($defaultSite) {
    $defaultBindings = $defaultSite.bindings.Collection
    $hasPort80 = $defaultBindings | Where-Object { $_.bindingInformation -match ":80:" }
    if ($hasPort80 -and (Get-Service -Name HubGateway -ErrorAction SilentlyContinue).Status -eq "Running") {
      Write-Host "  Stopping Default Web Site (port 80 used by gateway)..."
      Stop-Website -Name "Default Web Site"
    }
  }

  # Create Hub App Pool
  $appPoolName = "HubAppPool"
  $existingPool = Get-ChildItem "IIS:\AppPools\$appPoolName" -ErrorAction SilentlyContinue
  if (-not $existingPool) {
    New-Item "IIS:\AppPools\$appPoolName" -Force | Out-Null
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedRuntimeVersion -Value ""
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name startMode -Value "AlwaysRunning"
    Write-Host "  App Pool '$appPoolName' created."
  } else {
    Write-Host "  App Pool '$appPoolName' already exists."
  }

  # Create/Update Hub Site on port 8081 (for admin/status)
  $siteName = "HubSite"
  $existingSite = Get-Website -Name $siteName -ErrorAction SilentlyContinue
  if (-not $existingSite) {
    New-Website -Name $siteName -PhysicalPath $WWWROOT -Port 8081 -ApplicationPool $appPoolName -Force
    Write-Host "  Site '$siteName' created on :8081."
  } else {
    Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $WWWROOT
    Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $appPoolName
    Write-Host "  Site '$siteName' updated."
  }

  # Start the site
  Start-Website -Name $siteName

  Write-Host "  IIS Configuration complete." -ForegroundColor Green
} else {
  Write-Host "`n=== Skipping IIS Configuration ===" -ForegroundColor Yellow
}

# ─── 5. Firewall Rules ──────────────────────────────────────────────────────
Write-Host "`n=== Configuring Firewall ===" -ForegroundColor Cyan
$fwRuleName = "Hub-Gateway-80"
$existingRule = netsh advfirewall firewall show rule name="$fwRuleName" 2>$null
if (-not $existingRule) {
  netsh advfirewall firewall add rule name="$fwRuleName" dir=in action=allow protocol=TCP localport=80 profile=any
  Write-Host "  Firewall rule '$fwRuleName' created."
} else {
  Write-Host "  Firewall rule '$fwRuleName' already exists."
}

# ─── 6. Summary ─────────────────────────────────────────────────────────────
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:80 (via gateway → :3000)"
Write-Host "  API:       http://localhost:80/api/v1 (→ :5000)"
Write-Host "  Swagger:   http://localhost:80/swagger/index.html"
Write-Host "  IIS Admin: http://localhost:8081"
Write-Host ""
Write-Host "  Services:"
Write-Host "    HubAPI     → $ROOT\hub.exe"
Write-Host "    HubWeb     → Next.js on port 3000"
Write-Host "    HubGateway → $ROOT\hub-gateway.exe on port 80"
Write-Host ""
Write-Host "  Logs: $DEPLOY\*.log"
Write-Host "============================================" -ForegroundColor Green
