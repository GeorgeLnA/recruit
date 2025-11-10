'use client';

import * as React from 'react';

import {
  type HTMLMotionProps,
  type Transition,
  type Variant,
  motion,
} from 'framer-motion';

import { cn } from '@/lib/utils';

type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

type FlipButtonBaseProps = {
  frontText: string;
  backText: string;
  transition?: Transition;
  frontClassName?: string;
  backClassName?: string;
  from?: FlipDirection;
};

type FlipButtonAsButton = FlipButtonBaseProps & HTMLMotionProps<'button'> & {
  href?: never;
};

type FlipButtonAsAnchor = FlipButtonBaseProps & HTMLMotionProps<'a'> & {
  href: string;
};

type FlipButtonProps = FlipButtonAsButton | FlipButtonAsAnchor;

const defaultSpanClassName =
  'absolute inset-0 flex items-center justify-center rounded-lg';

const FlipButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, FlipButtonProps>(
  (
    {
      frontText,
      backText,
      transition = { type: 'spring', stiffness: 280, damping: 20 },
      className,
      frontClassName,
      backClassName,
      from = 'top',
      href,
      ...props
    },
    ref,
  ) => {
    const isVertical = from === 'top' || from === 'bottom';
    const rotateAxis = isVertical ? 'rotateX' : 'rotateY';
    const frontOffset = from === 'top' || from === 'left' ? '50%' : '-50%';
    const backOffset = from === 'top' || from === 'left' ? '-50%' : '50%';

    const buildVariant = (
      opacity: number,
      rotation: number,
      offset: string | null = null,
    ): Variant => ({
      opacity,
      [rotateAxis]: rotation,
      ...(isVertical && offset !== null ? { y: offset } : {}),
      ...(!isVertical && offset !== null ? { x: offset } : {}),
    });

    const frontVariants = {
      initial: buildVariant(1, 0, '0%'),
      hover: buildVariant(0, 90, frontOffset),
    };

    const backVariants = {
      initial: buildVariant(0, 90, backOffset),
      hover: buildVariant(1, 0, '0%'),
    };

    const commonProps = {
      initial: "initial" as const,
      whileHover: "hover" as const,
      whileTap: { scale: 0.95 },
      className: cn(
        'relative inline-block px-4 py-2 text-sm font-medium cursor-pointer perspective-[1000px] focus:outline-none',
        className,
      ),
      children: (
        <>
          <motion.span
            variants={frontVariants}
            transition={transition}
            className={cn(
              defaultSpanClassName,
              'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-white',
              frontClassName,
            )}
          >
            {frontText}
          </motion.span>
          <motion.span
            variants={backVariants}
            transition={transition}
            className={cn(
              defaultSpanClassName,
              'bg-neutral-800 text-white dark:bg-white dark:text-neutral-800',
              backClassName,
            )}
          >
            {backText}
          </motion.span>
          <span className="invisible">{frontText}</span>
        </>
      ),
    };

    if (href) {
      return (
        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          {...commonProps}
          {...(props as HTMLMotionProps<'a'>)}
        />
      );
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        {...commonProps}
        {...(props as HTMLMotionProps<'button'>)}
      />
    );
  },
);

FlipButton.displayName = 'FlipButton';

export { FlipButton, type FlipButtonProps, type FlipDirection };

