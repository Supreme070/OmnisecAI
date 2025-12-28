'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/***************************  DASHBOARD MOCKUP - PREMIUM  ***************************/

// Pulse animation for metrics
const metricPulse = keyframes`
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
`;

// Data flow animation
const dataFlow = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Activity bar animation
const activityBar = keyframes`
  0%, 100% {
    height: 40%;
  }
  25% {
    height: 70%;
  }
  50% {
    height: 55%;
  }
  75% {
    height: 85%;
  }
`;

/**
 * Premium Security Dashboard Mockup
 * A visual representation of a security dashboard using CSS
 */
export default function DashboardMockup({ scale = 1 }) {
  const baseWidth = 800 * scale;
  const baseHeight = 500 * scale;

  return (
    <Box
      sx={{
        position: 'relative',
        width: baseWidth,
        height: baseHeight,
        bgcolor: 'rgba(10, 10, 20, 0.95)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
          0 20px 60px -10px rgba(0, 0, 0, 0.5),
          0 0 100px -20px rgba(255, 204, 0, 0.15)
        `,
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          height: 40 * scale,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          px: 2 * scale,
          gap: 1,
        }}
      >
        {/* Window controls */}
        <Box sx={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', bgcolor: '#FF5F57' }} />
        <Box sx={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
        <Box sx={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', bgcolor: '#28CA42' }} />
        <Typography
          sx={{
            ml: 3,
            fontSize: 12 * scale,
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'monospace',
          }}
        >
          OmnisecAI Security Dashboard
        </Typography>
      </Box>

      {/* Dashboard content */}
      <Box sx={{ display: 'flex', height: `calc(100% - ${40 * scale}px)` }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 60 * scale,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            py: 2 * scale,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2 * scale,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                width: 32 * scale,
                height: 32 * scale,
                borderRadius: 1,
                bgcolor: i === 1 ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: i === 1 ? '1px solid rgba(255, 204, 0, 0.4)' : '1px solid transparent',
              }}
            />
          ))}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 2 * scale }}>
          {/* Metrics row */}
          <Stack direction="row" spacing={2 * scale} sx={{ mb: 2 * scale }}>
            {[
              { label: 'Threats Blocked', value: '12,847', color: '#FFCC00' },
              { label: 'Active Monitors', value: '1,234', color: '#28CA42' },
              { label: 'Risk Score', value: '98.7%', color: '#FFCC00' },
              { label: 'AI Models', value: '47', color: '#5B8DEF' },
            ].map((metric, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  p: 1.5 * scale,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animation: `${metricPulse} 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10 * scale,
                    color: 'rgba(255, 255, 255, 0.5)',
                    mb: 0.5,
                  }}
                >
                  {metric.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 20 * scale,
                    fontWeight: 700,
                    color: metric.color,
                    fontFamily: 'monospace',
                  }}
                >
                  {metric.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Chart and activity section */}
          <Stack direction="row" spacing={2 * scale}>
            {/* Threat map */}
            <Box
              sx={{
                flex: 2,
                height: 200 * scale,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                p: 1.5 * scale,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11 * scale,
                  color: 'rgba(255, 255, 255, 0.5)',
                  mb: 1,
                }}
              >
                Real-Time Threat Map
              </Typography>
              {/* Simulated network nodes */}
              {[
                { x: 20, y: 40, size: 8 },
                { x: 45, y: 25, size: 6 },
                { x: 70, y: 50, size: 10 },
                { x: 35, y: 65, size: 7 },
                { x: 60, y: 35, size: 5 },
                { x: 80, y: 70, size: 8 },
                { x: 15, y: 75, size: 6 },
              ].map((node, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: node.size * scale,
                    height: node.size * scale,
                    borderRadius: '50%',
                    bgcolor: i === 2 ? '#FF5F57' : '#FFCC00',
                    boxShadow: `0 0 ${10 * scale}px ${i === 2 ? 'rgba(255, 95, 87, 0.5)' : 'rgba(255, 204, 0, 0.5)'}`,
                    animation: `${metricPulse} ${2 + i * 0.3}s ease-in-out infinite`,
                  }}
                />
              ))}
              {/* Connection lines */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '40%',
                  left: '20%',
                  width: '25%',
                  height: 1,
                  bgcolor: 'rgba(255, 204, 0, 0.3)',
                  transformOrigin: 'left',
                  transform: 'rotate(-20deg)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '30%',
                  left: '45%',
                  width: '30%',
                  height: 1,
                  bgcolor: 'rgba(255, 204, 0, 0.3)',
                  transformOrigin: 'left',
                  transform: 'rotate(25deg)',
                }}
              />
              {/* Data flow indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10 * scale,
                  left: 0,
                  right: 0,
                  height: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '30%',
                    height: '100%',
                    bgcolor: '#FFCC00',
                    animation: `${dataFlow} 2s linear infinite`,
                  }}
                />
              </Box>
            </Box>

            {/* Activity bars */}
            <Box
              sx={{
                flex: 1,
                height: 200 * scale,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                p: 1.5 * scale,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11 * scale,
                  color: 'rgba(255, 255, 255, 0.5)',
                  mb: 1,
                }}
              >
                24h Activity
              </Typography>
              <Stack
                direction="row"
                spacing={0.5 * scale}
                sx={{
                  height: 'calc(100% - 30px)',
                  alignItems: 'flex-end',
                  pt: 2,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      bgcolor: i === 5 ? '#FF5F57' : '#FFCC00',
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.7,
                      animation: `${activityBar} ${3 + i * 0.2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* Bottom alerts section */}
          <Box
            sx={{
              mt: 2 * scale,
              height: 80 * scale,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: 1.5 * scale,
            }}
          >
            <Typography
              sx={{
                fontSize: 11 * scale,
                color: 'rgba(255, 255, 255, 0.5)',
                mb: 1,
              }}
            >
              Recent Security Events
            </Typography>
            <Stack spacing={0.5 * scale}>
              {[
                { text: 'Prompt injection blocked from IP 192.168.1.45', type: 'blocked' },
                { text: 'New AI model added to monitoring: GPT-4-Vision', type: 'info' },
                { text: 'Anomaly detected in data exfiltration pattern', type: 'warning' },
              ].map((event, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6 * scale,
                      height: 6 * scale,
                      borderRadius: '50%',
                      bgcolor:
                        event.type === 'blocked'
                          ? '#28CA42'
                          : event.type === 'warning'
                            ? '#FF5F57'
                            : '#5B8DEF',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 10 * scale,
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {event.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Reflection overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

DashboardMockup.propTypes = {
  scale: PropTypes.number,
};
