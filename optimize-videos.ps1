# Video Optimization Script for Windows
# Requires FFmpeg: Install with: winget install ffmpeg

Write-Host "Video Optimization Script" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
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

# Create backup directory
$backupPath = Join-Path $vidsPath "..\vids_backup"
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
    Write-Host "Created backup directory: $backupPath" -ForegroundColor Yellow
}

# Video files to optimize
$videos = @(
    @{Name="HERO.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="CLIENTS.webm"; Crf=32; AudioBitrate="64k"},
    @{Name="COMPANIES.webm"; Crf=32; AudioBitrate="64k"},
    @{Name="DUBAI.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="SHORT 1.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="SHORT 2.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="SHORT 3.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="SHORT 4.webm"; Crf=35; AudioBitrate="48k"},
    @{Name="SHORT 5.webm"; Crf=35; AudioBitrate="48k"}
)

Write-Host "Starting video optimization..." -ForegroundColor Cyan
Write-Host ""

foreach ($video in $videos) {
    $inputFile = $video.Name
    $outputFile = $inputFile -replace '\.webm$', '_optimized.webm'
    
    if (-not (Test-Path $inputFile)) {
        Write-Host "SKIP: $inputFile not found" -ForegroundColor Yellow
        continue
    }
    
    # Get original file size
    $originalSize = (Get-Item $inputFile).Length / 1MB
    Write-Host "Processing: $inputFile ($([math]::Round($originalSize, 2)) MB)" -ForegroundColor White
    
    # Backup original
    $backupFile = Join-Path $backupPath $inputFile
    if (-not (Test-Path $backupFile)) {
        Copy-Item $inputFile $backupFile
        Write-Host "  Backed up to: $backupFile" -ForegroundColor Gray
    }
    
    # Compress video
    $crf = $video.Crf
    $audioBitrate = $video.AudioBitrate
    
    Write-Host "  Compressing with CRF=$crf, audio=$audioBitrate..." -ForegroundColor Gray
    
    $ffmpegArgs = @(
        "-i", "`"$inputFile`"",
        "-c:v", "libvpx-vp9",
        "-crf", $crf,
        "-b:v", "0",
        "-c:a", "libopus",
        "-b:a", $audioBitrate,
        "-y",  # Overwrite output file
        "`"$outputFile`""
    )
    
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0 -and (Test-Path $outputFile)) {
        $newSize = (Get-Item $outputFile).Length / 1MB
        $savings = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
        Write-Host "  ✓ Optimized: $outputFile ($([math]::Round($newSize, 2)) MB) - $savings% smaller" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to optimize $inputFile" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the optimized files (*_optimized.webm)" -ForegroundColor White
Write-Host "2. Test playback quality" -ForegroundColor White
Write-Host "3. If satisfied, replace originals:" -ForegroundColor White
Write-Host "   Get-ChildItem '*_optimized.webm' | ForEach-Object { Rename-Item `$_.FullName (`$_.Name -replace '_optimized', '') }" -ForegroundColor Gray
Write-Host ""
Write-Host "Original files backed up to: $backupPath" -ForegroundColor Cyan






