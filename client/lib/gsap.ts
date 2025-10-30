import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Free plugins that come with GSAP
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register free plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Premium plugins (require Club GreenSock license)
// Uncomment these if you have a valid license and have installed the premium plugins
/*
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { EaselPlugin } from "gsap/EaselPlugin";
import { Flip } from "gsap/Flip";
import { GSDevTools } from "gsap/GSDevTools";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Observer } from "gsap/Observer";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PhysicsPropsPlugin } from "gsap/PhysicsPropsPlugin";
import { PixiPlugin } from "gsap/PixiPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

// Register premium plugins (uncomment if you have a license)
gsap.registerPlugin(
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  Draggable,
  DrawSVGPlugin,
  EaselPlugin,
  Flip,
  GSDevTools,
  InertiaPlugin,
  MotionPathHelper,
  MotionPathPlugin,
  MorphSVGPlugin,
  Observer,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  PixiPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText
);
*/

// Export GSAP and useGSAP for use in components
export { gsap, useGSAP, ScrollTrigger, TextPlugin };

// Export premium plugins (uncomment if you have a license)
/*
export {
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  Draggable,
  DrawSVGPlugin,
  EaselPlugin,
  Flip,
  GSDevTools,
  InertiaPlugin,
  MotionPathHelper,
  MotionPathPlugin,
  MorphSVGPlugin,
  Observer,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  PixiPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText
};
*/

// Common GSAP configurations
export const gsapConfig = {
  // Default ease
  defaultEase: "power2.out",
  
  // Common durations
  durations: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  
  // Common delays
  delays: {
    stagger: 0.1,
    sequence: 0.2,
  },
};

// Utility functions for common animations
export const gsapUtils = {
  // Fade in animation
  fadeIn: (element: gsap.TweenTarget, duration = gsapConfig.durations.normal) => {
    return gsap.fromTo(element, 
      { opacity: 0 }, 
      { opacity: 1, duration }
    );
  },
  
  // Fade out animation
  fadeOut: (element: gsap.TweenTarget, duration = gsapConfig.durations.normal) => {
    return gsap.to(element, { opacity: 0, duration });
  },
  
  // Slide up animation
  slideUp: (element: gsap.TweenTarget, duration = gsapConfig.durations.normal) => {
    return gsap.fromTo(element,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: gsapConfig.defaultEase }
    );
  },
  
  // Slide down animation
  slideDown: (element: gsap.TweenTarget, duration = gsapConfig.durations.normal) => {
    return gsap.fromTo(element,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: gsapConfig.defaultEase }
    );
  },
  
  // Scale animation
  scaleIn: (element: gsap.TweenTarget, duration = gsapConfig.durations.normal) => {
    return gsap.fromTo(element,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration, ease: gsapConfig.defaultEase }
    );
  },
  
  // Stagger animation for multiple elements
  staggerIn: (elements: gsap.TweenTarget[], duration = gsapConfig.durations.normal, stagger = gsapConfig.delays.stagger) => {
    return gsap.fromTo(elements,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration, stagger, ease: gsapConfig.defaultEase }
    );
  },
};

