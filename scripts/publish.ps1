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

# Publish the package
try {
    # npm publish
    npm publish --dry-run
    Write-Host "Package published successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to publish package: $_" -ForegroundColor Red
}