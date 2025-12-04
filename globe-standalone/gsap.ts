import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Free plugins that come with GSAP
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register free plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Export GSAP and useGSAP for use in components
export { gsap, useGSAP, ScrollTrigger, TextPlugin };

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

