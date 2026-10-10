@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing workspace dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

powershell -NoProfile -Command "$busy = @(4000,5173 | Where-Object { $client = New-Object Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', $_); $true } catch { $false } finally { $client.Dispose() } }); if ($busy.Count -gt 0) { Write-Error ('Required port(s) already in use: ' + ($busy -join ', ')); exit 1 }"
if errorlevel 1 (
  echo Close the process using port 4000 or 5173, then run this file again.
  pause
  exit /b 1
)

start "Serein API" cmd /k "cd /d ""%~dp0"" && npm run dev:server"
start "Serein Storefront" cmd /k "cd /d ""%~dp0"" && npm run dev:client"

echo Waiting for API and storefront health checks...
powershell -NoProfile -Command "$deadline = (Get-Date).AddSeconds(180); $api = $false; $web = $false; while ((Get-Date) -lt $deadline -and (-not $api -or -not $web)) { try { $null = Invoke-RestMethod 'http://localhost:4000/api/health' -TimeoutSec 3; $api = $true } catch { }; try { $page = Invoke-WebRequest 'http://localhost:5173' -TimeoutSec 3 -UseBasicParsing; $web = ($page.StatusCode -eq 200) } catch { }; if (-not $api -or -not $web) { Start-Sleep -Seconds 2 } }; if (-not $api) { Write-Error 'The API did not respond on port 4000. Check the Serein API window.'; exit 1 }; if (-not $web) { Write-Error 'The storefront did not respond on port 5173. Check the Serein Storefront window.'; exit 1 }"
if errorlevel 1 (
  echo Startup did not complete. Review the API and storefront windows for details.
  pause
  exit /b 1
)

start "" "http://localhost:5173"
echo Serein Maison is ready at http://localhost:5173
