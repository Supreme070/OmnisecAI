'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';

/***************************  CYBER SHIELD 3D - CSS ONLY  ***************************/

// Rotation animation
const rotate3d = keyframes`
  0% {
    transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
  }
  50% {
    transform: perspective(1000px) rotateY(15deg) rotateX(-5deg);
  }
  100% {
    transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
  }
`;

// Glow pulse animation
const glowPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(255, 204, 0, 0.4)) drop-shadow(0 0 40px rgba(255, 204, 0, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 204, 0, 0.6)) drop-shadow(0 0 60px rgba(255, 204, 0, 0.3));
  }
`;

// Scan line animation
const scanLine = keyframes`
  0% {
    top: -10%;
  }
  100% {
    top: 110%;
  }
`;

// Circuit pulse
const circuitPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
`;

/**
 * Premium CSS-based 3D Cyber Shield Visualization
 * A fallback when Spline 3D assets are not available
 */
export default function CyberShield3D({
  size = 300,
  animated = true,
  glowing = true,
  scanEffect = true,
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(animated && {
          animation: `${rotate3d} 8s ease-in-out infinite`,
        }),
      }}
    >
      {/* Main shield shape */}
      <Box
        sx={{
          position: 'relative',
          width: size * 0.6,
          height: size * 0.7,
          background: `
            linear-gradient(135deg,
              rgba(255, 204, 0, 0.15) 0%,
              rgba(255, 204, 0, 0.05) 50%,
              rgba(255, 204, 0, 0.1) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 204, 0, 0.4)',
          borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
          overflow: 'hidden',
          ...(glowing && {
            animation: `${glowPulse} 3s ease-in-out infinite`,
          }),
          // Inner glow
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 204, 0, 0.2) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Central lock icon */}
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.15,
            height: size * 0.12,
            border: '3px solid rgba(255, 204, 0, 0.8)',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.18,
            height: size * 0.15,
            bgcolor: 'rgba(255, 204, 0, 0.2)',
            border: '3px solid rgba(255, 204, 0, 0.8)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Keyhole
            '&::after': {
              content: '""',
              width: size * 0.03,
              height: size * 0.05,
              bgcolor: 'rgba(255, 204, 0, 0.8)',
              borderRadius: '50% 50% 0 0',
            },
          }}
        />

        {/* Circuit lines */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '20%',
            height: 2,
            bgcolor: 'rgba(255, 204, 0, 0.5)',
            borderRadius: 1,
            animation: `${circuitPulse} 2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '15%',
            width: '20%',
            height: 2,
            bgcolor: 'rgba(255, 204, 0, 0.5)',
            borderRadius: 1,
            animation: `${circuitPulse} 2s ease-in-out infinite`,
            animationDelay: '0.5s',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '15%',
            height: 2,
            bgcolor: 'rgba(255, 204, 0, 0.5)',
            borderRadius: 1,
            animation: `${circuitPulse} 2s ease-in-out infinite`,
            animationDelay: '1s',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '20%',
            width: '15%',
            height: 2,
            bgcolor: 'rgba(255, 204, 0, 0.5)',
            borderRadius: 1,
            animation: `${circuitPulse} 2s ease-in-out infinite`,
            animationDelay: '1.5s',
          }}
        />

        {/* Scan line effect */}
        {scanEffect && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '20%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 204, 0, 0.15) 50%, transparent 100%)',
              animation: `${scanLine} 3s linear infinite`,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      {/* Outer ring */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 0.85,
          height: size * 0.85,
          border: '1px solid rgba(255, 204, 0, 0.2)',
          borderRadius: '50%',
          animation: `${rotate3d} 12s ease-in-out infinite reverse`,
          // Decorative dots
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            bgcolor: 'rgba(255, 204, 0, 0.6)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            bgcolor: 'rgba(255, 204, 0, 0.6)',
            borderRadius: '50%',
          },
        }}
      />

      {/* Second outer ring */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 0.95,
          height: size * 0.95,
          border: '1px dashed rgba(255, 204, 0, 0.15)',
          borderRadius: '50%',
          animation: `${rotate3d} 15s linear infinite`,
        }}
      />
    </Box>
  );
}

CyberShield3D.propTypes = {
  size: PropTypes.number,
  animated: PropTypes.bool,
  glowing: PropTypes.bool,
  scanEffect: PropTypes.bool,
};
