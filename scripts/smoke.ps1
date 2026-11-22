$ErrorActionPreference = "Stop"

$Port = if ($env:PORT) { $env:PORT } else { "3100" }
$Url = "http://127.0.0.1:$Port/"

try {
  $testClient = [System.Net.Http.HttpClient]::new()
  $testClient.Timeout = [System.TimeSpan]::FromSeconds(1)
  $testRes = $testClient.GetAsync($Url).GetAwaiter().GetResult()
  $testClient.Dispose()
  [Console]::Error.WriteLine("An HTTP server is already running at $Url.")
  exit 1
} catch {}

$SmokeDir = Join-Path ([System.IO.Path]::GetTempPath()) ("smoke-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $SmokeDir -Force | Out-Null
$ServerLog = Join-Path $SmokeDir "server.log"
$ResponseBody = Join-Path $SmokeDir "home.html"

$ServerProcess = Start-Process -FilePath "node" `
  -ArgumentList "node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port $Port" `
  -RedirectStandardOutput $ServerLog `
  -RedirectStandardError $ServerLog `
  -PassThru `
  -NoNewWindow

function Cleanup {
  param([int]$ExitCode)
  if ($ServerProcess -and -not $ServerProcess.HasExited) {
    Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
    $ServerProcess.WaitForExit(3000)
  }
  if ($ExitCode -ne 0 -and (Test-Path $ServerLog)) {
    Get-Content $ServerLog | ForEach-Object { [Console]::Error.WriteLine($_) }
  }
  if (Test-Path $SmokeDir) {
    Remove-Item -Path $SmokeDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

$Deadline = (Get-Date).AddSeconds(30)
$Passed = $false

while ((Get-Date) -lt $Deadline) {
  if ($ServerProcess.HasExited) {
    [Console]::Error.WriteLine("Next.js exited before the smoke test completed.")
    Cleanup 1
    exit 1
  }

  try {
    $HttpClient = [System.Net.Http.HttpClient]::new()
    $HttpClient.Timeout = [System.TimeSpan]::FromSeconds(3)
    $Response = $HttpClient.GetAsync($Url).GetAwaiter().GetResult()
    $StatusCode = [int]$Response.StatusCode
    $ContentType = if ($Response.Content.Headers.ContentType) { $Response.Content.Headers.ContentType.ToString() } else { "" }
    $Body = $Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $HttpClient.Dispose()

    if ($StatusCode -ne 200 -or -not $ContentType.StartsWith("text/html")) {
      [Console]::Error.WriteLine("Expected HTTP 200 and HTML from $Url, received $StatusCode $ContentType.")
      Cleanup 1
      exit 1
    }

    if ($Body -notmatch '(?i)<html[ >]') {
      [Console]::Error.WriteLine("The response from $Url is missing an HTML document.")
      Cleanup 1
      exit 1
    }

    [System.IO.File]::WriteAllText($ResponseBody, $Body)
    Write-Output "Smoke test passed for $Url."
    $Passed = $true
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}

if (-not $Passed) {
  [Console]::Error.WriteLine("No HTTP response from $Url within 30 seconds.")
  Cleanup 1
  exit 1
}

Cleanup 0
exit 0
