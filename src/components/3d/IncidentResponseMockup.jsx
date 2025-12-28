'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/***************************  INCIDENT RESPONSE MOCKUP - PREMIUM  ***************************/

// Timeline pulse animation
const timelinePulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
`;

// Urgency flash animation
const urgencyFlash = keyframes`
  0%, 100% {
    opacity: 1;
    background-color: rgba(255, 59, 48, 0.15);
  }
  50% {
    opacity: 0.8;
    background-color: rgba(255, 59, 48, 0.25);
  }
`;

// Playbook step animation
const playbookStep = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Timer countdown animation
const timerTick = keyframes`
  0%, 100% {
    color: #FF3B30;
  }
  50% {
    color: #FF9500;
  }
`;

// Action button pulse
const actionPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 204, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 204, 0, 0);
  }
`;

/**
 * Premium Incident Response Dashboard Mockup
 */
export default function IncidentResponseMockup({ scale = 1 }) {
  const baseWidth = 700 * scale;
  const baseHeight = 400 * scale;

  const timelineEvents = [
    { time: '14:32:08', event: 'Threat detected', status: 'detected', icon: '🔴' },
    { time: '14:32:09', event: 'Auto-quarantine initiated', status: 'action', icon: '🛡️' },
    { time: '14:32:10', event: 'Playbook triggered', status: 'action', icon: '📋' },
    { time: '14:32:12', event: 'Team notified', status: 'notify', icon: '🔔' },
    { time: '14:32:15', event: 'Threat contained', status: 'resolved', icon: '✅' },
  ];

  const playbookSteps = [
    { step: 1, name: 'Isolate affected model', status: 'completed' },
    { step: 2, name: 'Block malicious IP', status: 'completed' },
    { step: 3, name: 'Capture forensic data', status: 'in-progress' },
    { step: 4, name: 'Notify security team', status: 'pending' },
    { step: 5, name: 'Generate incident report', status: 'pending' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'detected': return '#FF3B30';
      case 'action': return '#FF9500';
      case 'notify': return '#5B8DEF';
      case 'resolved': return '#28CA42';
      case 'completed': return '#28CA42';
      case 'in-progress': return '#FFCC00';
      case 'pending': return 'rgba(255, 255, 255, 0.3)';
      default: return '#888';
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
          0 0 120px -30px rgba(255, 149, 0, 0.15)
        `,
      }}
    >
      {/* Top bar - Urgent mode */}
      <Box
        sx={{
          height: 36 * scale,
          bgcolor: 'rgba(255, 59, 48, 0.12)',
          borderBottom: '1px solid rgba(255, 59, 48, 0.3)',
          display: 'flex',
          alignItems: 'center',
          px: 2 * scale,
          gap: 1,
          animation: `${urgencyFlash} 2s ease-in-out infinite`,
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
          ⚠️ INCIDENT IN PROGRESS - INC-2024-1847
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 10 * scale,
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'monospace',
            }}
          >
            Response Time:
          </Typography>
          <Typography
            sx={{
              fontSize: 12 * scale,
              color: '#28CA42',
              fontFamily: 'monospace',
              fontWeight: 700,
              animation: `${timerTick} 1s ease-in-out infinite`,
            }}
          >
            00:07s
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: `calc(100% - ${36 * scale}px)` }}>
        {/* Left panel - Timeline */}
        <Box
          sx={{
            width: '35%',
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
            Incident Timeline
          </Typography>

          <Box sx={{ position: 'relative' }}>
            {/* Timeline line */}
            <Box
              sx={{
                position: 'absolute',
                left: 6 * scale,
                top: 12 * scale,
                bottom: 12 * scale,
                width: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            <Stack spacing={1.5 * scale}>
              {timelineEvents.map((event, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    animation: `${playbookStep} 0.5s ease-out forwards`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0,
                  }}
                >
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      width: 14 * scale,
                      height: 14 * scale,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(event.status),
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      animation: i === timelineEvents.length - 1 ? `${timelinePulse} 1.5s ease-in-out infinite` : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: 7 * scale }}>{event.icon}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 9 * scale,
                        color: getStatusColor(event.status),
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {event.time}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10 * scale,
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {event.event}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Middle panel - Playbook */}
        <Box
          sx={{
            width: '35%',
            p: 2 * scale,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 * scale }}>
            <Typography
              sx={{
                fontSize: 11 * scale,
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
              }}
            >
              Active Playbook
            </Typography>
            <Box
              sx={{
                px: 1 * scale,
                py: 0.25 * scale,
                bgcolor: 'rgba(255, 204, 0, 0.15)',
                borderRadius: 0.5,
                border: '1px solid rgba(255, 204, 0, 0.3)',
              }}
            >
              <Typography sx={{ fontSize: 8 * scale, color: '#FFCC00', fontFamily: 'monospace' }}>
                AI-THREAT-001
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={0.75 * scale}>
            {playbookSteps.map((step, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1 * scale,
                  bgcolor: step.status === 'in-progress'
                    ? 'rgba(255, 204, 0, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 1,
                  border: `1px solid ${step.status === 'in-progress' ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                  animation: `${playbookStep} 0.4s ease-out forwards`,
                  animationDelay: `${0.3 + i * 0.1}s`,
                  opacity: 0,
                }}
              >
                <Box
                  sx={{
                    width: 20 * scale,
                    height: 20 * scale,
                    borderRadius: '50%',
                    bgcolor: step.status === 'completed'
                      ? 'rgba(40, 202, 66, 0.2)'
                      : step.status === 'in-progress'
                        ? 'rgba(255, 204, 0, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${getStatusColor(step.status)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.status === 'completed' ? (
                    <Typography sx={{ fontSize: 10 * scale, color: '#28CA42' }}>✓</Typography>
                  ) : step.status === 'in-progress' ? (
                    <Box
                      sx={{
                        width: 6 * scale,
                        height: 6 * scale,
                        borderRadius: '50%',
                        bgcolor: '#FFCC00',
                        animation: `${timelinePulse} 1s ease-in-out infinite`,
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 9 * scale, color: 'rgba(255, 255, 255, 0.3)' }}>
                      {step.step}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: 10 * scale,
                    color: step.status === 'pending' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                    flex: 1,
                  }}
                >
                  {step.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Right panel - Actions */}
        <Box sx={{ flex: 1, p: 2 * scale, display: 'flex', flexDirection: 'column', gap: 1.5 * scale }}>
          {/* Quick stats */}
          <Stack direction="row" spacing={1 * scale}>
            {[
              { label: 'Severity', value: 'Critical', color: '#FF3B30' },
              { label: 'Affected', value: '1 Model', color: '#FF9500' },
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
                <Typography sx={{ fontSize: 8 * scale, color: 'rgba(255, 255, 255, 0.5)' }}>
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13 * scale,
                    fontWeight: 700,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Expert support */}
          <Box
            sx={{
              bgcolor: 'rgba(91, 141, 239, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(91, 141, 239, 0.3)',
              p: 1.5 * scale,
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 24 * scale,
                  height: 24 * scale,
                  borderRadius: '50%',
                  bgcolor: 'rgba(91, 141, 239, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 12 * scale }}>👤</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontSize: 10 * scale, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}
                >
                  Expert On Call
                </Typography>
                <Typography sx={{ fontSize: 8 * scale, color: 'rgba(255, 255, 255, 0.5)' }}>
                  Sarah Chen • Senior Security Analyst
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1 * scale,
                  py: 0.5 * scale,
                  bgcolor: '#28CA42',
                  borderRadius: 0.5,
                }}
              >
                <Typography sx={{ fontSize: 8 * scale, color: '#000', fontWeight: 600 }}>
                  ONLINE
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Action buttons */}
          <Stack spacing={0.75 * scale} sx={{ flex: 1, justifyContent: 'flex-end' }}>
            <Box
              sx={{
                p: 1.25 * scale,
                bgcolor: 'rgba(255, 204, 0, 0.15)',
                borderRadius: 1.5,
                border: '1px solid rgba(255, 204, 0, 0.4)',
                textAlign: 'center',
                cursor: 'pointer',
                animation: `${actionPulse} 2s ease-in-out infinite`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 204, 0, 0.25)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 11 * scale,
                  color: '#FFCC00',
                  fontWeight: 600,
                }}
              >
                Escalate to CISO
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.25 * scale,
                bgcolor: 'rgba(40, 202, 66, 0.1)',
                borderRadius: 1.5,
                border: '1px solid rgba(40, 202, 66, 0.3)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(40, 202, 66, 0.2)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 11 * scale,
                  color: '#28CA42',
                  fontWeight: 600,
                }}
              >
                Mark as Resolved
              </Typography>
            </Box>
          </Stack>
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

IncidentResponseMockup.propTypes = {
  scale: PropTypes.number,
};
