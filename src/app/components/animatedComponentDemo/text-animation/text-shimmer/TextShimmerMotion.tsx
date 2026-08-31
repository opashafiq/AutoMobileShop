'use client';
import { motion, Transition } from 'motion/react';
import { cn } from '@/lib/utils';

// motion-wrapped elements must be created at module scope — a component created
// during render is a new component type every render, so React resets its state.
const MotionTags = {
  p: motion.create('p'),
  div: motion.create('div'),
  span: motion.create('span'),
} as const;

 type TextShimmerWaveProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  transition?: Transition;
};

 function TextShimmerWave({
  children,
  as: Component = 'p',
  className,
  duration = 1,
  zDistance = 10,
  xDistance = 2,
  yDistance = -2,
  spread = 1,
  scaleDistance = 1.1,
  rotateYDistance = 10,
  transition,
}: TextShimmerWaveProps) {
  const MotionComponent =
    (Component as keyof typeof MotionTags) in MotionTags
      ? MotionTags[Component as keyof typeof MotionTags]
      : MotionTags.p;

  return (
    <MotionComponent
      className={cn(
        'relative inline-block [perspective:500px]',
        '[--base-color:#a1a1aa] [--base-gradient-color:#000]',
        'dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff]',
        className
      )}
      style={{ color: 'var(--base-color)' }}
    >
      {children.split('').map((char, i) => {
        const delay = (i * duration * (1 / spread)) / children.length;

        return (
          <motion.span
            key={i}
            className={cn(
              'inline-block whitespace-pre [transform-style:preserve-3d]'
            )}
            initial={{
              translateZ: 0,
              scale: 1,
              rotateY: 0,
              color: 'var(--base-color)',
            }}
            animate={{
              translateZ: [0, zDistance, 0],
              translateX: [0, xDistance, 0],
              translateY: [0, yDistance, 0],
              scale: [1, scaleDistance, 1],
              rotateY: [0, rotateYDistance, 0],
              color: [
                'var(--base-color)',
                'var(--base-gradient-color)',
                'var(--base-color)',
              ],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatDelay: (children.length * 0.05) / spread,
              delay,
              ease: 'easeInOut',
              ...transition,
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </MotionComponent>
  );
}

export default function TextShimmerMotion() {
  return (
    <TextShimmerWave
      className='[--base-color:var(--color-primary)] [--base-gradient-color:#5EB1EF]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Tailwind Admin generating your table...
    </TextShimmerWave>
  );
}
