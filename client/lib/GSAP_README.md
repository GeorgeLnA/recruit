# GSAP Configuration and Usage Guide

This project includes GSAP (GreenSock Animation Platform) with proper configuration for both free and premium plugins.

## What's Included

### Free Plugins (Already Configured)
- **ScrollTrigger**: Scroll-based animations
- **TextPlugin**: Text animation effects

### Premium Plugins (Require License)
The following premium plugins are commented out in `client/lib/gsap.ts` but ready to use if you have a Club GreenSock license:

- CustomEase, CustomBounce, CustomWiggle
- EasePack (RoughEase, ExpoScaleEase, SlowMo)
- Draggable, DrawSVGPlugin, EaselPlugin
- Flip, GSDevTools, InertiaPlugin
- MotionPathHelper, MotionPathPlugin, MorphSVGPlugin
- Observer, Physics2DPlugin, PhysicsPropsPlugin
- PixiPlugin, ScrambleTextPlugin
- ScrollSmoother, ScrollToPlugin, SplitText

## Getting Started

### Basic Usage

```typescript
import { gsap, useGSAP } from "@/lib/gsap";

function MyComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(elementRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    );
  });

  return <div ref={elementRef}>Animated content</div>;
}
```

### Using Utility Functions

```typescript
import { gsapUtils } from "@/lib/gsap";

// Fade in
gsapUtils.fadeIn(element, 0.5);

// Slide up with stagger
gsapUtils.staggerIn([element1, element2, element3], 0.6, 0.1);
```

### ScrollTrigger Example

```typescript
import { gsap, ScrollTrigger } from "@/lib/gsap";

useGSAP(() => {
  gsap.fromTo(".animate-on-scroll", {
    opacity: 0,
    y: 100
  }, {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: ".animate-on-scroll",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse"
    }
  });
});
```

## Demo

Visit `/gsap-demo` to see a working example of GSAP animations in action.

## Premium Plugin Setup

If you have a Club GreenSock license:

1. Install the premium plugins:
   ```bash
   npm install gsap/Draggable gsap/Flip gsap/ScrollSmoother
   # ... install other premium plugins as needed
   ```

2. Uncomment the premium plugin imports in `client/lib/gsap.ts`

3. Uncomment the plugin registrations

4. Uncomment the exports

## Best Practices

1. **Use useGSAP hook**: Always wrap GSAP code in the `useGSAP` hook for proper cleanup
2. **Scope animations**: Use the `scope` option to limit animations to specific containers
3. **Clean up**: GSAP automatically cleans up when using `useGSAP`
4. **Performance**: Use `will-change` CSS property for elements that will be animated
5. **Responsive**: Test animations on different screen sizes

## Common Patterns

### Timeline Animations
```typescript
const tl = gsap.timeline();
tl.to(element1, { x: 100, duration: 1 })
  .to(element2, { y: 100, duration: 1 }, "-=0.5")
  .to(element3, { rotation: 360, duration: 1 });
```

### Stagger Animations
```typescript
gsap.fromTo(".stagger-item", 
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
);
```

### ScrollTrigger with Timeline
```typescript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".container",
    start: "top center",
    end: "bottom center",
    scrub: 1
  }
});
```

## Troubleshooting

- **Animations not working**: Check if elements exist in the DOM when GSAP runs
- **Performance issues**: Use `will-change` CSS property and avoid animating too many properties
- **ScrollTrigger not firing**: Ensure the trigger element is visible and has proper dimensions
- **Premium plugins not working**: Verify you have a valid Club GreenSock license and the plugins are properly installed

