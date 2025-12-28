/***************************  OMNISECAI THEME - PALETTE  ***************************/

export default function palette() {
  const textPrimary = '#1A1A2E'; // Deep navy - on surface
  const textSecondary = '#4A4A5E'; // Muted navy - on surface variant
  const divider = '#C2C7CE'; // Neutral outline
  const background = '#FFF';

  const lightPalette = {
    primary: {
      lighter: '#FFF5CC', // Very light gold - primary container
      light: '#FFE066', // Light gold - primary fixed dim
      main: '#FFCC00', // Gold accent - primary
      dark: '#CC9900', // Dark gold - on primary fixed variant
      darker: '#996600', // Very dark gold - on primary container
      contrastText: '#000000' // Black text on gold
    },
    secondary: {
      lighter: '#E8E8F0', // Light navy tint - secondary container
      light: '#3D3D5C', // Light navy - secondary fixed dim
      main: '#1A1A2E', // Deep navy - secondary
      dark: '#0F0F1A', // Darker navy - on secondary fixed variant
      darker: '#050510', // Darkest navy - on secondary container
      contrastText: '#FFFFFF' // White text on navy
    },
    success: {
      lighter: '#D1FAE5',
      light: '#6EE7B7',
      main: '#10B981', // Emerald - security status
      dark: '#059669',
      darker: '#047857'
    },
    error: {
      lighter: '#FEE2E2',
      light: '#FCA5A5',
      main: '#EF4444', // Red - threats
      dark: '#DC2626',
      darker: '#B91C1C'
    },
    warning: {
      lighter: '#FEF3C7',
      light: '#FCD34D',
      main: '#F59E0B', // Amber - warnings
      dark: '#D97706',
      darker: '#B45309'
    },
    info: {
      lighter: '#DBEAFE',
      light: '#93C5FD',
      main: '#3B82F6', // Blue - info
      dark: '#2563EB',
      darker: '#1D4ED8'
    },
    grey: {
      50: '#F9FAFB', // Surface bright
      100: '#F3F4F6', // Surface container low
      200: '#E5E7EB', // Surface container
      300: '#D1D5DB', // Surface container high
      400: '#9CA3AF', // Surface container highest
      500: '#6B7280', // Surface dim
      600: divider, // Outline variant
      700: '#4B5563', // Outline
      800: textSecondary, // On surface variant
      900: textPrimary // On surface
    },
    text: {
      primary: textPrimary, // Deep navy - on surface
      secondary: textSecondary // Muted navy - on surface variant
    },
    divider,
    background: {
      default: background,
      paper: '#F9FAFB'
    }
  };

  return {
    ...lightPalette
  };
}
