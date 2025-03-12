param (
    [string]$folderName
)

# Check if the folder name parameter is provided
if (-not $folderName) {
    Write-Host "Error: No folder name provided. Please specify a folder name to delete."
    exit 1
}

# Confirm deletion
$confirmation = Read-Host "Are you sure you want to delete all folders named '$folderName'? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "Deletion canceled."
    exit 0
}

# Get the current directory
$currentDir = Get-Location

# Recursively find and delete the specified folders
Get-ChildItem -Path $currentDir -Directory -Recurse -Force | Where-Object { $_.Name -eq $folderName } | ForEach-Object {
    try {
        Remove-Item -Path $_.FullName -Recurse -Force
        Write-Host "Deleted folder: $($_.FullName)"
    } catch {
        Write-Host "Failed to delete folder: $($_.FullName). Error: $_"
    }
}
