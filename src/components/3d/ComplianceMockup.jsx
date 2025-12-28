'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/***************************  COMPLIANCE MOCKUP - PREMIUM  ***************************/

// Checkmark animation
const checkmarkDraw = keyframes`
  0% {
    stroke-dashoffset: 20;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

// Progress fill animation
const progressFill = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

// Badge glow animation
const badgeGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(40, 202, 66, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(40, 202, 66, 0.6), 0 0 30px rgba(40, 202, 66, 0.3);
  }
`;

// Document slide animation
const documentSlide = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

// Typing animation
const typing = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

/**
 * Premium Compliance Dashboard Mockup
 */
export default function ComplianceMockup({ scale = 1 }) {
  const baseWidth = 700 * scale;
  const baseHeight = 400 * scale;

  const frameworks = [
    { name: 'SOC 2', progress: 100, status: 'certified' },
    { name: 'GDPR', progress: 100, status: 'certified' },
    { name: 'ISO 27001', progress: 95, status: 'in-progress' },
    { name: 'HIPAA', progress: 88, status: 'in-progress' },
    { name: 'FedRAMP', progress: 72, status: 'pending' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'certified': return '#28CA42';
      case 'in-progress': return '#FFCC00';
      case 'pending': return '#5B8DEF';
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
          0 0 120px -30px rgba(40, 202, 66, 0.15)
        `,
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          height: 36 * scale,
          bgcolor: 'rgba(40, 202, 66, 0.08)',
          borderBottom: '1px solid rgba(40, 202, 66, 0.2)',
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
            color: '#28CA42',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
          ✓ COMPLIANCE CENTER
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            px: 1.5 * scale,
            py: 0.5 * scale,
            bgcolor: 'rgba(40, 202, 66, 0.15)',
            borderRadius: 1,
            border: '1px solid rgba(40, 202, 66, 0.3)',
          }}
        >
          <Typography sx={{ fontSize: 9 * scale, color: '#28CA42', fontFamily: 'monospace' }}>
            Last audit: 2h ago
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: `calc(100% - ${36 * scale}px)` }}>
        {/* Left panel - Framework status */}
        <Box sx={{ width: '40%', p: 2 * scale, borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography
            sx={{
              fontSize: 11 * scale,
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 1.5 * scale,
              fontWeight: 500,
            }}
          >
            Compliance Frameworks
          </Typography>

          <Stack spacing={1 * scale}>
            {frameworks.map((framework, i) => (
              <Box
                key={i}
                sx={{
                  p: 1.25 * scale,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: getStatusColor(framework.status),
                  },
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 * scale }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {framework.status === 'certified' && (
                      <Box
                        sx={{
                          width: 14 * scale,
                          height: 14 * scale,
                          borderRadius: '50%',
                          bgcolor: 'rgba(40, 202, 66, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          animation: `${badgeGlow} 2s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      >
                        <Typography sx={{ fontSize: 8 * scale, color: '#28CA42' }}>✓</Typography>
                      </Box>
                    )}
                    <Typography
                      sx={{
                        fontSize: 11 * scale,
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {framework.name}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 10 * scale,
                      color: getStatusColor(framework.status),
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}
                  >
                    {framework.progress}%
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
                      width: `${framework.progress}%`,
                      bgcolor: getStatusColor(framework.status),
                      borderRadius: 2,
                      transition: 'width 1s ease',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Right panel - Reports & Badges */}
        <Box sx={{ flex: 1, p: 2 * scale, display: 'flex', flexDirection: 'column', gap: 1.5 * scale }}>
          {/* Certification badges */}
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: 1.5 * scale,
            }}
          >
            <Typography
              sx={{ fontSize: 10 * scale, color: 'rgba(255, 255, 255, 0.5)', mb: 1 * scale }}
            >
              Active Certifications
            </Typography>
            <Stack direction="row" spacing={1 * scale} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {['SOC 2 Type II', 'GDPR', 'MITRE ATLAS', 'OWASP'].map((cert, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 1.5 * scale,
                    py: 0.75 * scale,
                    bgcolor: 'rgba(40, 202, 66, 0.1)',
                    borderRadius: 1,
                    border: '1px solid rgba(40, 202, 66, 0.3)',
                    animation: `${documentSlide} ${3 + i * 0.5}s ease-in-out infinite`,
                  }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 8 * scale, color: '#28CA42' }}>✓</Typography>
                    <Typography
                      sx={{
                        fontSize: 9 * scale,
                        color: '#28CA42',
                        fontWeight: 600,
                      }}
                    >
                      {cert}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Recent reports */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: 1.5 * scale,
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 * scale }}>
              <Typography sx={{ fontSize: 10 * scale, color: 'rgba(255, 255, 255, 0.5)' }}>
                Generated Reports
              </Typography>
              <Typography sx={{ fontSize: 9 * scale, color: '#5B8DEF', fontFamily: 'monospace' }}>
                View All →
              </Typography>
            </Stack>
            <Stack spacing={0.75 * scale}>
              {[
                { name: 'SOC2_Q4_2024_Report.pdf', size: '2.4 MB', time: '2 hours ago' },
                { name: 'GDPR_Compliance_Audit.pdf', size: '1.8 MB', time: '1 day ago' },
                { name: 'Security_Assessment.pdf', size: '3.2 MB', time: '3 days ago' },
              ].map((report, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1 * scale,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 28 * scale,
                      height: 32 * scale,
                      bgcolor: 'rgba(91, 141, 239, 0.1)',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(91, 141, 239, 0.3)',
                    }}
                  >
                    <Typography sx={{ fontSize: 8 * scale, color: '#5B8DEF' }}>PDF</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 10 * scale,
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {report.name}
                    </Typography>
                    <Typography sx={{ fontSize: 8 * scale, color: 'rgba(255, 255, 255, 0.4)' }}>
                      {report.size} • {report.time}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 10 * scale, color: '#5B8DEF' }}>↓</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Auto-generation status */}
          <Box
            sx={{
              bgcolor: 'rgba(91, 141, 239, 0.08)',
              borderRadius: 1.5,
              p: 1.25 * scale,
              border: '1px solid rgba(91, 141, 239, 0.2)',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 8 * scale,
                  height: 8 * scale,
                  borderRadius: '50%',
                  bgcolor: '#5B8DEF',
                  animation: `${typing} 1s ease-in-out infinite`,
                }}
              />
              <Typography
                sx={{
                  fontSize: 9 * scale,
                  color: '#5B8DEF',
                  fontFamily: 'monospace',
                }}
              >
                Generating ISO 27001 audit report...
              </Typography>
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
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

ComplianceMockup.propTypes = {
  scale: PropTypes.number,
};
