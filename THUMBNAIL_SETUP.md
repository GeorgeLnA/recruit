# Video Thumbnail Setup Guide

## Problem
Videos were loading without thumbnails, making the page feel slow and unresponsive.

## Solution
Added poster/thumbnail images that load immediately, creating the impression videos loaded instantly even before the video files download.

## Setup Instructions

### Step 1: Create Thumbnails
Run the thumbnail creation script to extract frames from your videos:

```bash
npm run create:thumbnails
```

This will:
- Extract a frame at 1 second from each video
- Save as high-quality JPEG thumbnails
- Place them in `public/vids/thumbnails/`

### Step 2: Verify Thumbnails Created
Check that these files exist:
- `public/vids/thumbnails/CLIENTS.jpg`
- `public/vids/thumbnails/COMPANIES.jpg`
- `public/vids/thumbnails/SHORT_1.jpg`
- `public/vids/thumbnails/SHORT_2.jpg`
- `public/vids/thumbnails/SHORT_3.jpg`
- `public/vids/thumbnails/SHORT_4.jpg`
- `public/vids/thumbnails/SHORT_5.jpg`

### Step 3: Test
1. Open the "Work With Us" page
2. Videos should show thumbnails immediately
3. Thumbnails display even before video files load
4. Creates instant visual feedback

## How It Works

### VideoPlayer Component
- Main video player accepts `poster` prop
- Poster image loads immediately (not lazy)
- Shows thumbnail while video loads in background

### Card Videos
- All card videos have `poster` attribute
- Thumbnails load with page (eager loading)
- Videos lazy load when approaching viewport
- Creates instant visual impression

## Benefits

1. **Instant Visual Feedback**: Thumbnails appear immediately
2. **Perceived Performance**: Page feels faster
3. **Better UX**: Users see content right away
4. **Progressive Loading**: Videos load in background

## File Structure

```
public/vids/
├── CLIENTS.webm
├── COMPANIES.webm
├── SHORT 1.webm
├── SHORT 2.webm
├── SHORT 3.webm
├── SHORT 4.webm
├── SHORT 5.webm
└── thumbnails/
    ├── CLIENTS.jpg
    ├── COMPANIES.jpg
    ├── SHORT_1.jpg
    ├── SHORT_2.jpg
    ├── SHORT_3.jpg
    ├── SHORT_4.jpg
    └── SHORT_5.jpg
```

## Manual Thumbnail Creation

If the script doesn't work, you can create thumbnails manually with FFmpeg:

```bash
cd public/vids
mkdir thumbnails

# Extract frame at 1 second
ffmpeg -i "CLIENTS.webm" -ss 00:00:01 -vframes 1 -q:v 2 "thumbnails/CLIENTS.jpg"
ffmpeg -i "COMPANIES.webm" -ss 00:00:01 -vframes 1 -q:v 2 "thumbnails/COMPANIES.jpg"
ffmpeg -i "SHORT 1.webm" -ss 00:00:01 -vframes 1 -q:v 2 "thumbnails/SHORT_1.jpg"
# ... etc
```

## Optimization Tips

1. **Thumbnail Size**: Keep thumbnails under 200KB each
2. **Format**: JPEG is fine, but WebP would be smaller
3. **Quality**: `-q:v 2` gives high quality, increase to 5-7 for smaller files
4. **Frame Selection**: 1 second usually works, but adjust if needed

## Troubleshooting

**Thumbnails not showing?**
- Check file paths match exactly (case-sensitive)
- Verify thumbnails exist in `public/vids/thumbnails/`
- Check browser console for 404 errors

**Thumbnails too large?**
- Re-encode with lower quality: `-q:v 5` instead of `-q:v 2`
- Or convert to WebP for smaller file size

**Wrong frame extracted?**
- Adjust `-ss` time to get better frame
- Example: `-ss 00:00:02` for 2 seconds









