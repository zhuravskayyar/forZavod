param(
  [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:$Port/"

function Get-PythonLauncher {
  foreach ($candidate in @('py', 'python')) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) {
      return $command.Source
    }
  }
  return $null
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1

if (-not $listener) {
  $pythonLauncher = Get-PythonLauncher
  if (-not $pythonLauncher) {
    Write-Host "Python launcher 'py' or 'python' was not found in PATH." -ForegroundColor Red
    exit 1
  }

  Start-Process `
    -FilePath $pythonLauncher `
    -ArgumentList @('-m', 'http.server', $Port, '--bind', '0.0.0.0') `
    -WorkingDirectory $rootDir `
    -WindowStyle Hidden | Out-Null

  Start-Sleep -Seconds 2

  $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if (-not $listener) {
    Write-Host "Failed to start the local server on port $Port." -ForegroundColor Red
    exit 1
  }
}

Start-Process $url | Out-Null

Write-Host "Server root: $rootDir"
Write-Host "Listening on: $url"
Write-Host "PID: $($listener.OwningProcess)"
