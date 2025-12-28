'use client';
import PropTypes from 'prop-types';

// @third-party
import { motion } from 'motion/react';

/***************************  PREMIUM ANIMATIONS - OMNISECAI  ***************************/

// Easing functions for premium feel
export const premiumEasing = {
  smooth: [0.22, 1, 0.36, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  sharp: [0.4, 0, 0.2, 1],
  elastic: [0.68, -0.6, 0.32, 1.6],
};

// Animation variants for different effects
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: premiumEasing.smooth,
    },
  }),
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: premiumEasing.smooth,
    },
  }),
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: premiumEasing.smooth,
    },
  }),
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: premiumEasing.smooth,
    },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay,
      ease: premiumEasing.bounce,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: premiumEasing.smooth,
    },
  },
};

// Gold glow pulse animation
export const goldGlowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(255, 204, 0, 0.4), 0 0 40px rgba(255, 204, 0, 0.2)',
      '0 0 30px rgba(255, 204, 0, 0.6), 0 0 60px rgba(255, 204, 0, 0.3)',
      '0 0 20px rgba(255, 204, 0, 0.4), 0 0 40px rgba(255, 204, 0, 0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Floating animation
export const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    rotate: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Rotate animation for icons
export const rotateAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * FadeInView - Wrapper component that fades in content when in viewport
 */
export function FadeInView({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  once = true,
  amount = 0.3,
  className,
  style,
}) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 50 };
      case 'down':
        return { opacity: 0, y: -50 };
      case 'left':
        return { opacity: 0, x: -50 };
      case 'right':
        return { opacity: 0, x: 50 };
      case 'scale':
        return { opacity: 0, scale: 0.9 };
      default:
        return { opacity: 0 };
    }
  };

  const getAnimate = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'scale':
        return { opacity: 1, scale: 1 };
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: premiumEasing.smooth,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

FadeInView.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'scale', 'none']),
  delay: PropTypes.number,
  duration: PropTypes.number,
  once: PropTypes.bool,
  amount: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * StaggerChildren - Container that staggers child animations
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  containerDelay = 0.2,
  once = true,
  amount = 0.3,
  className,
  style,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: containerDelay,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

StaggerChildren.propTypes = {
  children: PropTypes.node.isRequired,
  staggerDelay: PropTypes.number,
  containerDelay: PropTypes.number,
  once: PropTypes.bool,
  amount: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * StaggerItem - Child item for StaggerChildren container
 */
export function StaggerItem({ children, className, style }) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * HoverScale - Wrapper that scales on hover
 */
export function HoverScale({
  children,
  scale = 1.05,
  tapScale = 0.98,
  className,
  style,
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.2, ease: premiumEasing.smooth }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

HoverScale.propTypes = {
  children: PropTypes.node.isRequired,
  scale: PropTypes.number,
  tapScale: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * FloatingElement - Element that floats continuously
 */
export function FloatingElement({
  children,
  amplitude = 10,
  duration = 6,
  className,
  style,
}) {
  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

FloatingElement.propTypes = {
  children: PropTypes.node.isRequired,
  amplitude: PropTypes.number,
  duration: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * ParallaxElement - Element with parallax scroll effect
 */
export function ParallaxElement({
  children,
  speed = 0.5,
  className,
  style,
}) {
  return (
    <motion.div
      initial={{ y: 0 }}
      style={{
        ...style,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 30,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

ParallaxElement.propTypes = {
  children: PropTypes.node.isRequired,
  speed: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * GlowButton - Button with animated gold glow
 */
export function GlowButton({ children, onClick, className, style }) {
  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 30px rgba(255, 204, 0, 0.6), 0 0 60px rgba(255, 204, 0, 0.3)',
      }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(255, 204, 0, 0.4), 0 0 40px rgba(255, 204, 0, 0.2)',
          '0 0 25px rgba(255, 204, 0, 0.5), 0 0 50px rgba(255, 204, 0, 0.25)',
          '0 0 20px rgba(255, 204, 0, 0.4), 0 0 40px rgba(255, 204, 0, 0.2)',
        ],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        scale: {
          duration: 0.2,
        },
      }}
      onClick={onClick}
      className={className}
      style={{
        background: '#FFCC00',
        color: '#0A0A14',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '50px',
        fontWeight: 600,
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

GlowButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};
