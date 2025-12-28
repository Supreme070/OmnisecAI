'use client';
import PropTypes from 'prop-types';
import { Suspense, lazy } from 'react';

// @mui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Lazy load Spline to avoid SSR issues and improve performance
const Spline = lazy(() => import('@splinetool/react-spline'));

/***************************  SPLINE 3D VIEWER - PREMIUM  ***************************/

/**
 * Loading placeholder for Spline 3D scenes
 */
function Spline3DLoader({ message = 'Loading 3D Experience...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 300,
        gap: 2,
        bgcolor: 'rgba(10, 10, 20, 0.4)',
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: '#FFCC00',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.5)',
          letterSpacing: '0.05em',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

Spline3DLoader.propTypes = {
  message: PropTypes.string,
};

/**
 * Premium Spline 3D Viewer Component
 *
 * Usage:
 * <Spline3DViewer scene="https://prod.spline.design/XXXXX/scene.splinecode" />
 *
 * Free 3D Assets for Cybersecurity Theme:
 * - Shield: https://app.spline.design/community/file/shield
 * - Lock: https://app.spline.design/community/file/lock
 * - Network nodes: https://app.spline.design/community/file/network
 */
export default function Spline3DViewer({
  scene,
  onLoad,
  onError,
  fallback,
  containerSx,
  loadingMessage,
}) {
  if (!scene) {
    return fallback || null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 300,
        overflow: 'hidden',
        ...containerSx,
      }}
    >
      <Suspense fallback={<Spline3DLoader message={loadingMessage} />}>
        <Spline
          scene={scene}
          onLoad={onLoad}
          onError={onError}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Suspense>
    </Box>
  );
}

Spline3DViewer.propTypes = {
  /** URL to the Spline scene (.splinecode file) */
  scene: PropTypes.string.isRequired,
  /** Callback when scene is loaded */
  onLoad: PropTypes.func,
  /** Callback on error */
  onError: PropTypes.func,
  /** Custom fallback component */
  fallback: PropTypes.node,
  /** Custom container styles */
  containerSx: PropTypes.object,
  /** Custom loading message */
  loadingMessage: PropTypes.string,
};

/**
 * Preset Spline scenes for OmnisecAI
 * Add your Spline scene URLs here after creating them
 */
export const SplineScenes = {
  // Hero section 3D shield
  heroShield: null, // Add Spline URL
  // Dashboard preview
  dashboard: null, // Add Spline URL
  // Security network visualization
  securityNetwork: null, // Add Spline URL
  // AI brain visualization
  aiBrain: null, // Add Spline URL
};

/**
 * PresetSpline3D - Quick access to preset scenes
 */
export function PresetSpline3D({ preset, ...props }) {
  const sceneUrl = SplineScenes[preset];

  if (!sceneUrl) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          bgcolor: 'rgba(10, 10, 20, 0.4)',
          borderRadius: 4,
          border: '1px dashed rgba(255, 204, 0, 0.2)',
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
        >
          3D Scene: {preset} (URL not configured)
        </Typography>
      </Box>
    );
  }

  return <Spline3DViewer scene={sceneUrl} {...props} />;
}

PresetSpline3D.propTypes = {
  preset: PropTypes.oneOf(['heroShield', 'dashboard', 'securityNetwork', 'aiBrain']).isRequired,
};
