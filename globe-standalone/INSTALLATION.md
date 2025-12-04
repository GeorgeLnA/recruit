# Installation Guide

## Quick Start

1. **Copy the files** to your project:
   - `RotatingEarth.tsx` - Main component
   - `gsap.ts` - GSAP configuration

2. **Install dependencies**:
```bash
npm install d3 gsap @gsap/react
# or
pnpm add d3 gsap @gsap/react
# or
yarn add d3 gsap @gsap/react
```

3. **Install TypeScript types** (if using TypeScript):
```bash
npm install --save-dev @types/d3 @types/react @types/react-dom typescript
```

4. **Import and use**:
```tsx
import RotatingEarth, { EarthPin } from './RotatingEarth';

const locations: EarthPin[] = [
  { id: '1', name: 'Location 1', lat: 51.5074, lon: -0.1278 }
];

<RotatingEarth pins={locations} />
```

## Integration with Different Frameworks

### Next.js

1. Install dependencies (same as above)
2. Copy `RotatingEarth.tsx` to `components/` folder
3. Copy `gsap.ts` to `lib/` folder
4. Use in your page:

```tsx
// app/page.tsx or pages/index.tsx
'use client'; // If using App Router

import RotatingEarth, { EarthPin } from '@/components/RotatingEarth';

export default function Home() {
  const locations: EarthPin[] = [...];
  return <RotatingEarth pins={locations} />;
}
```

### Create React App

1. Install dependencies
2. Copy files to `src/components/` and `src/lib/`
3. Import and use in your components

### Vite + React

1. Install dependencies
2. Copy files to your components folder
3. Use as shown in the example

## Styling Setup

### With Tailwind CSS

If you're using Tailwind CSS, the component will work out of the box. Just make sure Tailwind is configured in your project.

### Without Tailwind CSS

You'll need to add custom CSS or replace Tailwind classes with inline styles. Here's a CSS file you can use:

```css
/* globe-styles.css */
.globe-container {
  position: relative;
  width: 100%;
}

.globe-canvas {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
}

.pin-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pin-wrapper {
  position: absolute;
  pointer-events: auto;
  will-change: transform;
}

.pin-button {
  position: relative;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

.pin-dot-container {
  position: relative;
  width: 1rem;
  height: 1rem;
}

.pin-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #00BFFF;
  opacity: 0.3;
  transform-origin: center center;
}

.pin-dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #00BFFF;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  transform-origin: center center;
}

.pin-label {
  position: absolute;
  left: 100%;
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  transition: opacity 0.3s;
}

.pin-card {
  position: absolute;
  left: 50%;
  width: 600px;
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform-origin: center top;
  top: calc(50% + 2rem);
}

.pin-card-image {
  width: 100%;
  height: 16rem;
  object-fit: cover;
}

.pin-card-content {
  padding: 2rem;
}

.pin-card-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #111827;
}

.pin-card-description {
  font-size: 1.125rem;
  color: #374151;
  line-height: 1.75;
}
```

Then update `RotatingEarth.tsx` to use these classes instead of Tailwind classes, or add the CSS file to your project.

## Troubleshooting

### Module not found errors

Make sure all dependencies are installed:
```bash
npm list d3 gsap @gsap/react
```

### TypeScript errors

Install type definitions:
```bash
npm install --save-dev @types/d3 @types/react @types/react-dom
```

### GSAP not working

Ensure GSAP is properly registered. Check that `gsap.ts` is imported before using the component.

### Globe not rendering

- Check browser console for errors
- Verify D3.js is loaded
- Check that the world data URL is accessible (should load from GitHub)

### Pins not showing

- Verify pin coordinates are valid
- Check that pins array is not empty
- Ensure pins are on the visible side of the globe (they hide when on the back)

