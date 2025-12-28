'use client';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';

/***************************  ANIMATED GRADIENT MESH - LIGHT PREMIUM  ***************************/

// Gradient animation keyframes
const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
`;

const floatingOrb = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  25% {
    transform: translate(30px, -50px) scale(1.1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, -100px) scale(0.95);
    opacity: 0.3;
  }
  75% {
    transform: translate(-40px, -30px) scale(1.05);
    opacity: 0.5;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.15);
  }
`;

const gridPulse = keyframes`
  0%, 100% {
    opacity: 0.04;
  }
  50% {
    opacity: 0.08;
  }
`;

export default function AnimatedGradientMesh() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        // Light cream/warm white background
        background: 'linear-gradient(180deg, #FAFAF8 0%, #F5F5F0 50%, #FFFFFF 100%)',
      }}
    >
      {/* Animated gradient mesh layer - soft gold accents */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255, 204, 0, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255, 180, 0, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse 50% 60% at 60% 80%, rgba(26, 26, 46, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 90%, rgba(255, 204, 0, 0.06) 0%, transparent 40%)
          `,
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 20s ease-in-out infinite`,
        }}
      />

      {/* Floating gold orb 1 */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 204, 0, 0.2) 0%, rgba(255, 204, 0, 0) 70%)',
          filter: 'blur(80px)',
          animation: `${floatingOrb} 15s ease-in-out infinite`,
        }}
      />

      {/* Floating gold orb 2 */}
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 180, 0, 0.15) 0%, rgba(255, 180, 0, 0) 70%)',
          filter: 'blur(100px)',
          animation: `${floatingOrb} 18s ease-in-out infinite reverse`,
          animationDelay: '-5s',
        }}
      />

      {/* Subtle navy accent orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '60%',
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 26, 60, 0.06) 0%, rgba(26, 26, 46, 0) 60%)',
          filter: 'blur(120px)',
          animation: `${floatingOrb} 22s ease-in-out infinite`,
          animationDelay: '-8s',
        }}
      />

      {/* Center glow pulse */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 204, 0, 0.15) 0%, transparent 60%)',
          filter: 'blur(100px)',
          animation: `${pulseGlow} 8s ease-in-out infinite`,
        }}
      />

      {/* Grid pattern overlay - subtle */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(26, 26, 46, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26, 26, 46, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: `${gridPulse} 10s ease-in-out infinite`,
        }}
      />

      {/* Very subtle grain texture */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Soft bottom fade to white */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '40%',
          background: 'linear-gradient(to top, #FFFFFF 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
