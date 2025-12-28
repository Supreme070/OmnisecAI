'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';

/***************************  GLASSMORPHISM CARD - PREMIUM  ***************************/

// Gold border glow animation
const borderGlow = keyframes`
  0%, 100% {
    border-color: rgba(255, 204, 0, 0.1);
    box-shadow: 0 0 20px rgba(255, 204, 0, 0.05);
  }
  50% {
    border-color: rgba(255, 204, 0, 0.25);
    box-shadow: 0 0 30px rgba(255, 204, 0, 0.1);
  }
`;

/**
 * Premium glassmorphism card component with dark theme and gold accents
 * Variants:
 * - 'default': Standard glass effect
 * - 'dark': Darker glass background
 * - 'gold': Gold-tinted glass effect
 * - 'glow': Animated gold border glow
 */
export default function GlassmorphismCard({
  sx,
  children,
  variant = 'default',
  hoverEffect = true,
  glowAnimation = false,
  borderRadius = 4,
  ...rest
}) {
  // Variant styles
  const variantStyles = {
    default: {
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dark: {
      bgcolor: 'rgba(10, 10, 20, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    gold: {
      bgcolor: 'rgba(255, 204, 0, 0.05)',
      borderColor: 'rgba(255, 204, 0, 0.15)',
    },
    glow: {
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 204, 0, 0.1)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        bgcolor: currentVariant.bgcolor,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: currentVariant.borderColor,
        borderRadius,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',

        // Glow animation for 'glow' variant
        ...(glowAnimation && {
          animation: `${borderGlow} 4s ease-in-out infinite`,
        }),

        // Hover effects
        ...(hoverEffect && {
          '&:hover': {
            bgcolor:
              variant === 'gold'
                ? 'rgba(255, 204, 0, 0.08)'
                : variant === 'dark'
                  ? 'rgba(10, 10, 20, 0.8)'
                  : 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 204, 0, 0.3)',
            boxShadow: `
              0 0 0 1px rgba(255, 204, 0, 0.1) inset,
              0 20px 40px -10px rgba(0, 0, 0, 0.4),
              0 0 60px -10px rgba(255, 204, 0, 0.15)
            `,
            transform: 'translateY(-4px)',
          },
        }),

        ...sx,
      }}
      {...rest}
    >
      {/* Inner glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </Card>
  );
}

GlassmorphismCard.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'dark', 'gold', 'glow']),
  hoverEffect: PropTypes.bool,
  glowAnimation: PropTypes.bool,
  borderRadius: PropTypes.number,
};
