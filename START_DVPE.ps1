[CmdletBinding()]
param(
    [switch]$CheckOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$repoRoot = $PSScriptRoot
$appRoot = Join-Path $repoRoot 'dvpe_CLD'
$packageJson = Join-Path $appRoot 'package.json'
$lockFile = Join-Path $appRoot 'package-lock.json'
$nodeModules = Join-Path $appRoot 'node_modules'
$lockMarker = Join-Path $nodeModules '.dvpe-package-lock.sha256'
$dvpeUrl = 'http://127.0.0.1:1420/'

function Test-DvpeServer {
    try {
        $response = Invoke-WebRequest -Uri $dvpeUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content -match 'DVPE'
    }
    catch {
        return $false
    }
}

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)][string]$LiteralPath)

    $stream = [System.IO.File]::OpenRead($LiteralPath)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha256.ComputeHash($stream)
        return [System.BitConverter]::ToString($hashBytes).Replace('-', '')
    }
    finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

try {
    if (-not (Test-Path -LiteralPath $packageJson)) {
        throw "DVPE package not found at $packageJson"
    }
    if (-not (Test-Path -LiteralPath $lockFile)) {
        throw "DVPE lockfile not found at $lockFile"
    }

    $nodeCommand = Get-Command 'node.exe' -ErrorAction Stop
    $npmCommand = Get-Command 'npm.cmd' -ErrorAction Stop
    $nodeVersion = [string](& $nodeCommand.Path --version)
    if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v([0-9]+)') {
        throw "Unable to read the installed Node.js version. Found: $nodeVersion"
    }

    $nodeMajor = [int]$Matches[1]
    if ($nodeMajor -lt 20) {
        throw "Node.js 20 or newer is required. Found $nodeVersion."
    }

    $lockHash = Get-FileSha256 -LiteralPath $lockFile
    $installedHash = if (Test-Path -LiteralPath $lockMarker) {
        [System.IO.File]::ReadAllText($lockMarker).Trim()
    }
    else {
        ''
    }
    $dependenciesCurrent =
        (Test-Path -LiteralPath $nodeModules) -and ($installedHash -eq $lockHash)

    Write-Host "DVPE environment: Node $nodeVersion"
    if ($CheckOnly) {
        $dependencyState = if ($dependenciesCurrent) { 'current' } else { 'install required' }
        Write-Host "DVPE dependencies: $dependencyState"
        Write-Host "DVPE URL: $dvpeUrl"
        exit 0
    }

    if (Test-DvpeServer) {
        Write-Host "DVPE is already running at $dvpeUrl"
        if (-not $NoBrowser) {
            Start-Process $dvpeUrl
        }
        exit 0
    }

    if (-not $dependenciesCurrent) {
        Write-Host 'Installing the locked DVPE dependencies (first run or lockfile changed)...'
        Push-Location $appRoot
        try {
            & $npmCommand.Path ci
            if ($LASTEXITCODE -ne 0) {
                throw "npm ci failed with exit code $LASTEXITCODE"
            }
        }
        finally {
            Pop-Location
        }
        [System.IO.File]::WriteAllText($lockMarker, $lockHash, [System.Text.Encoding]::ASCII)
    }

    Write-Host "Starting DVPE at $dvpeUrl"
    Write-Host 'Keep this window open. Press Ctrl+C to stop the server.'

    $npmArguments = @('run', 'dev')
    if (-not $NoBrowser) {
        $npmArguments += @('--', '--open')
    }

    Push-Location $appRoot
    try {
        & $npmCommand.Path @npmArguments
        $devExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($devExitCode -ne 0) {
        throw "DVPE development server exited with code $devExitCode"
    }
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
