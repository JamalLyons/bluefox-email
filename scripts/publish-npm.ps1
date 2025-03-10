# Check if --final flag is provided
$isFinalPublish = $args -contains "--final"

# Show warning if not running in final mode
if (-not $isFinalPublish) {
    Write-Host "Running in dry-run mode. Use --final flag to perform actual publish." -ForegroundColor Yellow
}

# Define the relative path to your package directory
$packagePath = "packages\core"

# Change to the package directory
try {
    Set-Location -Path $packagePath -ErrorAction Stop
}
catch {
    Write-Host "Failed to change directory: $_" -ForegroundColor Red
    exit 1
}

# Run pre-publish checks
try {
    Write-Host "Running pre-publish checks..." -ForegroundColor Cyan
    
    # Run formatting
    Write-Host "Running formatter..." -ForegroundColor Cyan
    pnpm run format
    
    # Run linting
    Write-Host "Running linter..." -ForegroundColor Cyan
    pnpm run lint
    
    # Run type checking
    Write-Host "Running type check..." -ForegroundColor Cyan
    pnpm run typecheck
    
    # Build the project
    Write-Host "Building project..." -ForegroundColor Cyan
    pnpm run build
}
catch {
    Write-Host "Pre-publish checks failed: $_" -ForegroundColor Red
    exit 1
}

# Publish the package
try {
    if ($isFinalPublish) {
        Write-Host "Publishing package..." -ForegroundColor Cyan
        npm publish
    } else {
        Write-Host "Running publish in dry-run mode..." -ForegroundColor Cyan
        npm publish --dry-run
    }
    Write-Host "Package published successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to publish package: $_" -ForegroundColor Red
    exit 1
}