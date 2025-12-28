'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/***************************  THREAT DETECTION MOCKUP - PREMIUM  ***************************/

// Radar sweep animation
const radarSweep = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Threat pulse animation
const threatPulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

// Alert slide animation
const alertSlide = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
  90% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Scan line animation
const scanProgress = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

// Data stream animation
const dataStream = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 0% 100%;
  }
`;

/**
 * Premium Threat Detection Dashboard Mockup
 */
export default function ThreatDetectionMockup({ scale = 1 }) {
  const baseWidth = 700 * scale;
  const baseHeight = 400 * scale;

  const threats = [
    { x: 25, y: 30, severity: 'critical', label: 'Prompt Injection' },
    { x: 65, y: 45, severity: 'high', label: 'Jailbreak Attempt' },
    { x: 40, y: 70, severity: 'medium', label: 'Data Exfiltration' },
    { x: 80, y: 25, severity: 'low', label: 'Anomaly Detected' },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#5B8DEF';
      default: return '#28CA42';
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: baseWidth,
        height: baseHeight,
        bgcolor: 'rgba(10, 10, 20, 0.98)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
          0 25px 80px -10px rgba(0, 0, 0, 0.6),
          0 0 120px -30px rgba(255, 59, 48, 0.2)
        `,
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          height: 36 * scale,
          bgcolor: 'rgba(255, 59, 48, 0.1)',
          borderBottom: '1px solid rgba(255, 59, 48, 0.2)',
          display: 'flex',
          alignItems: 'center',
          px: 2 * scale,
          gap: 1,
        }}
      >
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#FF5F57' }} />
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#28CA42' }} />
        <Typography
          sx={{
            ml: 2,
            fontSize: 11 * scale,
            color: '#FF5F57',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
          🔴 THREAT DETECTION ACTIVE
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: 10 * scale,
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'monospace',
          }}
        >
          Last scan: 0.3s ago
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', height: `calc(100% - ${36 * scale}px)` }}>
        {/* Left panel - Radar */}
        <Box
          sx={{
            width: '45%',
            p: 2 * scale,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Typography
            sx={{
              fontSize: 11 * scale,
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 1.5 * scale,
              fontWeight: 500,
            }}
          >
            Real-Time Threat Radar
          </Typography>

          {/* Radar visualization */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              maxHeight: 220 * scale,
              borderRadius: '50%',
              border: '2px solid rgba(255, 59, 48, 0.3)',
              bgcolor: 'rgba(255, 59, 48, 0.02)',
              overflow: 'hidden',
              mx: 'auto',
            }}
          >
            {/* Radar rings */}
            {[0.75, 0.5, 0.25].map((r, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `${r * 100}%`,
                  height: `${r * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 59, 48, 0.15)',
                }}
              />
            ))}

            {/* Crosshairs */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 1,
                bgcolor: 'rgba(255, 59, 48, 0.2)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 1,
                bgcolor: 'rgba(255, 59, 48, 0.2)',
              }}
            />

            {/* Radar sweep */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '50%',
                height: 2,
                transformOrigin: 'left center',
                background: 'linear-gradient(90deg, rgba(255, 59, 48, 0.8) 0%, transparent 100%)',
                animation: `${radarSweep} 3s linear infinite`,
              }}
            />

            {/* Sweep trail */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '50%',
                height: '50%',
                transformOrigin: 'left top',
                background: 'conic-gradient(from 0deg, rgba(255, 59, 48, 0.15) 0deg, transparent 60deg)',
                animation: `${radarSweep} 3s linear infinite`,
              }}
            />

            {/* Threat points */}
            {threats.map((threat, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: `${threat.x}%`,
                  top: `${threat.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Box
                  sx={{
                    width: 12 * scale,
                    height: 12 * scale,
                    borderRadius: '50%',
                    bgcolor: getSeverityColor(threat.severity),
                    boxShadow: `0 0 ${15 * scale}px ${getSeverityColor(threat.severity)}`,
                    animation: `${threatPulse} ${1.5 + i * 0.3}s ease-in-out infinite`,
                  }}
                />
              </Box>
            ))}

            {/* Center dot */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8 * scale,
                height: 8 * scale,
                borderRadius: '50%',
                bgcolor: '#28CA42',
                boxShadow: '0 0 10px #28CA42',
              }}
            />
          </Box>
        </Box>

        {/* Right panel - Alerts & Stats */}
        <Box sx={{ flex: 1, p: 2 * scale, display: 'flex', flexDirection: 'column', gap: 1.5 * scale }}>
          {/* Stats row */}
          <Stack direction="row" spacing={1 * scale}>
            {[
              { label: 'Blocked', value: '2,847', color: '#28CA42' },
              { label: 'Critical', value: '3', color: '#FF3B30' },
              { label: 'Active', value: '1,234', color: '#5B8DEF' },
            ].map((stat, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  p: 1 * scale,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography
                  sx={{ fontSize: 9 * scale, color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 18 * scale,
                    fontWeight: 700,
                    color: stat.color,
                    fontFamily: 'monospace',
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Live alerts */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: 1.5 * scale,
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                fontSize: 10 * scale,
                color: 'rgba(255, 255, 255, 0.5)',
                mb: 1,
              }}
            >
              Live Threat Feed
            </Typography>
            <Stack spacing={0.75 * scale}>
              {[
                { time: '0.3s', text: 'Prompt injection blocked: "ignore instructions"', severity: 'critical' },
                { time: '1.2s', text: 'Jailbreak attempt detected from 192.168.1.45', severity: 'high' },
                { time: '2.8s', text: 'Unusual data pattern in GPT-4 response', severity: 'medium' },
                { time: '5.1s', text: 'Token limit anomaly detected', severity: 'low' },
              ].map((alert, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.75 * scale,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 1,
                    borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
                    animation: `${alertSlide} ${8 + i * 2}s linear infinite`,
                    animationDelay: `${i * 2}s`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 8 * scale,
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontFamily: 'monospace',
                      minWidth: 30 * scale,
                    }}
                  >
                    {alert.time}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 9 * scale,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {alert.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Scanning progress */}
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 1.5,
              p: 1 * scale,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 9 * scale, color: 'rgba(255, 255, 255, 0.5)' }}>
                Deep Scan Progress
              </Typography>
              <Typography sx={{ fontSize: 9 * scale, color: '#28CA42', fontFamily: 'monospace' }}>
                87%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 4 * scale,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: '87%',
                  bgcolor: '#28CA42',
                  borderRadius: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: `${scanProgress} 1.5s ease-in-out infinite`,
                  },
                }}
              />
            </Box>
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
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

ThreatDetectionMockup.propTypes = {
  scale: PropTypes.number,
};
