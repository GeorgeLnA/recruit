# Interactive Rotating Globe Component

A fully interactive 3D globe component built with React, D3.js, and GSAP. Features auto-rotation, drag-to-rotate, clickable pins with location cards, and smooth animations.

## Features

- 🌍 **Auto-rotating 3D globe** with D3.js orthographic projection
- 📍 **Interactive pins** that show location information
- 🖱️ **Drag to rotate** - click and drag to manually rotate the globe
- 🎯 **Click pins** to center the globe and show location cards
- ✨ **Smooth animations** powered by GSAP
- 📱 **Responsive** design that adapts to screen size
- 🎨 **Customizable** colors and styling

## Installation

```bash
npm install d3 gsap @gsap/react
# or
pnpm add d3 gsap @gsap/react
# or
yarn add d3 gsap @gsap/react
```

## Usage

### Basic Example

```tsx
import RotatingEarth, { EarthPin } from './RotatingEarth';

const locations: EarthPin[] = [
  { 
    id: 'london', 
    name: 'London', 
    lat: 51.5074, 
    lon: -0.1278,
    image: '/london.jpg',
    description: 'Our headquarters in the heart of London.'
  },
  { 
    id: 'newyork', 
    name: 'New York', 
    lat: 40.7128, 
    lon: -74.0060,
    image: '/newyork.jpg',
    description: 'Our office in the Big Apple.'
  },
];

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <RotatingEarth
        width={1600}
        height={900}
        pins={locations}
        onSelectPin={(id) => {
          console.log('Selected pin:', id);
        }}
      />
    </div>
  );
}
```

### Props

#### `RotatingEarthProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `1200` | Width of the globe container |
| `height` | `number` | `800` | Height of the globe container |
| `className` | `string` | `""` | Additional CSS classes |
| `pins` | `EarthPin[]` | `[]` | Array of location pins to display |
| `onSelectPin` | `(id: string) => void` | `undefined` | Callback when a pin is selected |

#### `EarthPin`

```typescript
interface EarthPin {
  id: string;           // Unique identifier
  name: string;         // Display name
  lat: number;          // Latitude in degrees (-90 to 90)
  lon: number;          // Longitude in degrees (-180 to 180)
  image?: string;       // Optional image URL for the location card
  description?: string; // Optional description text
}
```

## Styling

The component uses Tailwind CSS classes. Make sure you have Tailwind CSS configured in your project, or replace the classes with your own styling.

### Custom Colors

To change the globe colors, modify these values in `RotatingEarth.tsx`:

- **Ocean color**: `#FF914D` (line 123)
- **Land color**: `#ffffff` (line 147)
- **Pin color**: `#00BFFF` (multiple locations)
- **Grid lines**: `#ffffff` with opacity (line 137)

### Custom Styling Without Tailwind

If you're not using Tailwind CSS, you can replace the className props with inline styles or your own CSS classes. The component uses these Tailwind classes:

- `relative`, `absolute`, `inset-0`
- `w-full`, `h-auto`
- `flex`, `items-center`, `justify-center`
- `rounded-full`, `rounded-xl`
- `bg-white`, `bg-black/50`
- `text-white`, `text-gray-900`
- `shadow-lg`, `shadow-xl`
- `transition-all`, `duration-300`

## Interactions

### Auto-Rotation
The globe automatically rotates when not being dragged. The rotation pauses when:
- User clicks and drags the globe
- A pin is clicked (resumes after animation completes)

### Drag to Rotate
Click and drag anywhere on the globe to manually rotate it. The auto-rotation will pause and resume after 200ms of inactivity.

### Pin Interactions
- **Hover**: Pins scale up slightly on hover
- **Click**: 
  - Globe smoothly rotates to center the selected pin
  - A location card appears below the pin with image and description
  - Clicking the same pin again closes the card
  - Clicking a different pin closes the previous card and opens the new one

## Performance

The component is optimized for performance:
- Uses `requestAnimationFrame` for smooth animations
- GPU-accelerated transforms for pin positioning
- Batched DOM updates
- Efficient visibility culling (pins on the back of the globe are hidden)

## Browser Support

- Modern browsers with Canvas API support
- ES6+ JavaScript features
- CSS transforms and transitions

## Dependencies

- **d3**: ^7.9.0 - For geographic projections and calculations
- **gsap**: ^3.13.0 - For smooth animations
- **@gsap/react**: ^2.1.2 - React hooks for GSAP
- **react**: ^18.3.1
- **react-dom**: ^18.3.1

## Example Locations Data

```typescript
const exampleLocations: EarthPin[] = [
  { 
    id: 'harrogate', 
    name: 'Harrogate', 
    lat: 53.9921, 
    lon: -1.5418, 
    image: '/harrogate.jpg', 
    description: 'Our main office location.' 
  },
  { 
    id: 'dubai', 
    name: 'Dubai', 
    lat: 25.2048, 
    lon: 55.2708, 
    image: '/dubai.jpg', 
    description: 'Middle Eastern operations.' 
  },
  { 
    id: 'barcelona', 
    name: 'Barcelona', 
    lat: 41.3851, 
    lon: 2.1734, 
    image: '/barcelona.jpg', 
    description: 'European conference location.' 
  },
];
```

## Troubleshooting

### Globe not rendering
- Check that D3.js is properly installed
- Verify the world data URL is accessible
- Check browser console for errors

### Pins not appearing
- Verify pin coordinates are valid (lat: -90 to 90, lon: -180 to 180)
- Check that pins array is not empty
- Ensure pins are on the visible side of the globe

### Animations not working
- Verify GSAP is properly installed
- Check that `@gsap/react` is installed
- Ensure GSAP plugins are registered in `gsap.ts`

## License

This component is provided as-is for use in your projects.

