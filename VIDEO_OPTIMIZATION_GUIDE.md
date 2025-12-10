# Video Optimization Guide

## Problem
Your videos are currently **too large** (2-17 MB each), causing slow page loads. The consultant is correct - we need to compress them.

## Current Video Sizes
- CLIENTS.webm: **5.92 MB**
- COMPANIES.webm: **10.62 MB** ⚠️
- DUBAI.webm: **14.18 MB** ⚠️
- HERO.webm: **17.16 MB** ⚠️ (largest!)
- SHORT 1.webm: **2.43 MB**
- SHORT 2.webm: **4.73 MB**
- SHORT 3.webm: **2.78 MB**
- SHORT 4.webm: **2.46 MB**
- SHORT 5.webm: **5.53 MB**

## Target Sizes
For web delivery, aim for:
- **Short videos (SHORT 1-5)**: < 1 MB each
- **Medium videos (CLIENTS, COMPANIES)**: < 2 MB each
- **Large videos (HERO, DUBAI)**: < 3-4 MB each

## Compression Methods

### Option 1: FFmpeg (Recommended - Free & Best Quality)

#### Install FFmpeg
- **Windows**: Download from https://ffmpeg.org/download.html or use `winget install ffmpeg`
- **Mac**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

#### Compression Commands

**For all videos (balanced quality/size):**
```bash
# Navigate to public/vids directory
cd public/vids

# Compress with VP9 codec (best WebM compression)
# Target: ~50% file size reduction while maintaining good quality
ffmpeg -i "HERO.webm" -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 64k "HERO_optimized.webm"

ffmpeg -i "CLIENTS.webm" -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 64k "CLIENTS_optimized.webm"

ffmpeg -i "COMPANIES.webm" -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 64k "COMPANIES_optimized.webm"

ffmpeg -i "DUBAI.webm" -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 64k "DUBAI_optimized.webm"

# For SHORT videos (can be more aggressive)
ffmpeg -i "SHORT 1.webm" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 48k "SHORT 1_optimized.webm"
ffmpeg -i "SHORT 2.webm" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 48k "SHORT 2_optimized.webm"
ffmpeg -i "SHORT 3.webm" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 48k "SHORT 3_optimized.webm"
ffmpeg -i "SHORT 4.webm" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 48k "SHORT 4_optimized.webm"
ffmpeg -i "SHORT 5.webm" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 48k "SHORT 5_optimized.webm"
```

**Parameters explained:**
- `-c:v libvpx-vp9`: Use VP9 codec (best WebM compression)
- `-crf 32-35`: Quality setting (32 = good quality, 35 = smaller file)
- `-b:v 0`: Variable bitrate (let encoder decide)
- `-c:a libopus`: Opus audio codec
- `-b:a 48-64k`: Audio bitrate (lower = smaller file)

**More aggressive compression (smaller files, slightly lower quality):**
```bash
# For very large files like HERO.webm
ffmpeg -i "HERO.webm" -c:v libvpx-vp9 -crf 38 -b:v 0 -c:a libopus -b:a 48k -vf "scale=1920:-1" "HERO_optimized.webm"
```

**After compression:**
1. Check file sizes: `ls -lh *_optimized.webm` (or `dir *_optimized.webm` on Windows)
2. Test playback quality
3. If satisfied, replace originals:
   ```bash
   # Backup originals first!
   mkdir ../vids_backup
   cp *.webm ../vids_backup/
   
   # Replace with optimized versions
   mv HERO_optimized.webm HERO.webm
   mv CLIENTS_optimized.webm CLIENTS.webm
   # ... etc
   ```

### Option 2: Online Tools (Easier, but less control)

1. **CloudConvert** (https://cloudconvert.com/webm-to-webm)
   - Upload video
   - Set quality to "Medium" or "Low"
   - Download optimized version

2. **HandBrake** (https://handbrake.fr/)
   - GUI tool
   - Use WebM preset
   - Adjust quality slider

### Option 3: Automated Script (Windows PowerShell)

Create `optimize-videos.ps1`:
```powershell
# Install FFmpeg first: winget install ffmpeg

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

foreach ($video in $videos) {
    $output = $video -replace '\.webm$', '_optimized.webm'
    Write-Host "Compressing $video..."
    ffmpeg -i $video -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 64k $output
    Write-Host "Done: $output"
}
```

## Image Optimization

Netlify automatically optimizes images, but you can pre-optimize:

### Convert images to WebP
```bash
# Using cwebp (from WebP tools)
cwebp -q 80 input.jpg -o output.webp

# Or use online tool: https://squoosh.app/
```

## Testing After Optimization

1. **Check file sizes** - should be 50-70% smaller
2. **Test playback** - ensure quality is acceptable
3. **Test page load** - should be much faster
4. **Check Network tab** - verify caching headers work

## Netlify CDN Benefits

Once optimized:
- ✅ Videos cached globally via Netlify CDN
- ✅ Automatic compression
- ✅ Fast delivery worldwide
- ✅ Proper caching headers (already configured)

## Next Steps

1. **Compress videos** using FFmpeg (recommended)
2. **Replace original files** with optimized versions
3. **Test the site** - should load much faster
4. **Monitor** - check Netlify analytics for load times

## Expected Results

- **Before**: 17 MB HERO video = ~5-10 seconds load on slow connection
- **After**: 3-4 MB optimized = ~1-2 seconds load
- **With CDN caching**: Subsequent loads = instant


