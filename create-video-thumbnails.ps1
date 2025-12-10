# Create Video Thumbnails Script
# Extracts a frame from each video to use as poster/thumbnail
# Requires FFmpeg: Install with: winget install ffmpeg

Write-Host "Video Thumbnail Creation Script" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

# Check if FFmpeg is installed
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "ERROR: FFmpeg not found!" -ForegroundColor Red
    Write-Host "Install FFmpeg with: winget install ffmpeg" -ForegroundColor Yellow
    Write-Host "Or download from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Navigate to videos directory
$vidsPath = Join-Path $PSScriptRoot "public\vids"
if (-not (Test-Path $vidsPath)) {
    Write-Host "ERROR: public\vids directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $vidsPath

# Create thumbnails directory
$thumbnailsPath = Join-Path $vidsPath "thumbnails"
if (-not (Test-Path $thumbnailsPath)) {
    New-Item -ItemType Directory -Path $thumbnailsPath | Out-Null
    Write-Host "Created thumbnails directory: $thumbnailsPath" -ForegroundColor Yellow
}

# Video files to create thumbnails for
$videos = @(
    "HERO.webm",
    "CLIENTS.webm",
    "COMPANIES.webm",
    "DUBAI.webm",
    "SHORT 1.webm",
    "SHORT 2.webm",
    "SHORT 3.webm",
    "SHORT 4.webm",
    "SHORT 5.webm"
)

Write-Host "Creating thumbnails from videos..." -ForegroundColor Cyan
Write-Host ""

foreach ($video in $videos) {
    if (-not (Test-Path $video)) {
        Write-Host "SKIP: $video not found" -ForegroundColor Yellow
        continue
    }
    
    # Create thumbnail filename (replace spaces and extension)
    $thumbnailName = $video -replace ' ', '_' -replace '\.webm$', '.jpg'
    $thumbnailPath = Join-Path $thumbnailsPath $thumbnailName
    
    Write-Host "Processing: $video" -ForegroundColor White
    
    # Extract frame at 0.5 seconds (or 1 second if video is longer)
    # Use -ss to seek, -vframes 1 to extract one frame, -q:v 2 for high quality JPEG
    $ffmpegArgs = @(
        "-i", "`"$video`"",
        "-ss", "00:00:01",  # Extract frame at 1 second
        "-vframes", "1",
        "-q:v", "2",  # High quality JPEG (2 = best quality, 31 = worst)
        "-y",  # Overwrite output file
        "`"$thumbnailPath`""
    )
    
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0 -and (Test-Path $thumbnailPath)) {
        $size = (Get-Item $thumbnailPath).Length / 1KB
        Write-Host "  ✓ Created: $thumbnailName ($([math]::Round($size, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to create thumbnail for $video" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Thumbnail creation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Thumbnails saved to: $thumbnailsPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Update video elements to use these thumbnails as poster images" -ForegroundColor Yellow


