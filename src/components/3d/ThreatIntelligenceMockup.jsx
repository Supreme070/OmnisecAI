'use client';
import PropTypes from 'prop-types';

// @mui
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/***************************  THREAT INTELLIGENCE MOCKUP - PREMIUM 8K STYLE  ***************************/

// Neural pulse animation
const neuralPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

// Data flow through network
const dataFlow = keyframes`
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
`;

// Learning progress animation
const learningProgress = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

// Node activation animation
const nodeActivate = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 204, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 204, 0, 0.8), 0 0 40px rgba(255, 204, 0, 0.4);
  }
`;

// Pattern recognition scan
const patternScan = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// Floating orb animation
const floatOrb = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(90deg);
  }
  50% {
    transform: translateY(0) rotate(180deg);
  }
  75% {
    transform: translateY(10px) rotate(270deg);
  }
`;

// Connection line pulse
const connectionPulse = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
`;

/**
 * Premium AI Threat Intelligence Learning Visualization
 * Photorealistic 8K-style neural network with ML automation flow
 */
export default function ThreatIntelligenceMockup({ scale = 1 }) {
  const baseWidth = 800 * scale;
  const baseHeight = 500 * scale;

  // Neural network layers
  const layers = [
    { nodes: 4, label: 'Input', color: '#5B8DEF' },
    { nodes: 6, label: 'Hidden 1', color: '#FFCC00' },
    { nodes: 8, label: 'Processing', color: '#FFCC00' },
    { nodes: 6, label: 'Hidden 2', color: '#FFCC00' },
    { nodes: 3, label: 'Output', color: '#28CA42' },
  ];

  const threatPatterns = [
    { name: 'Prompt Injection', confidence: 99.7, trend: '+2.3%' },
    { name: 'Jailbreak Attempt', confidence: 98.2, trend: '+1.8%' },
    { name: 'Data Exfiltration', confidence: 97.5, trend: '+3.1%' },
    { name: 'Model Poisoning', confidence: 96.8, trend: '+0.9%' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: baseWidth,
        height: baseHeight,
        bgcolor: 'rgba(6, 6, 15, 0.98)',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(255, 204, 0, 0.15)',
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.03) inset,
          0 30px 100px -20px rgba(0, 0, 0, 0.7),
          0 0 150px -50px rgba(255, 204, 0, 0.2)
        `,
      }}
    >
      {/* Ambient glow background */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(255, 204, 0, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <Box
        sx={{
          height: 40 * scale,
          bgcolor: 'rgba(255, 204, 0, 0.05)',
          borderBottom: '1px solid rgba(255, 204, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          px: 2 * scale,
          gap: 1.5,
        }}
      >
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#FF5F57' }} />
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
        <Box sx={{ width: 10 * scale, height: 10 * scale, borderRadius: '50%', bgcolor: '#28CA42' }} />
        <Typography
          sx={{
            ml: 2,
            fontSize: 11 * scale,
            color: '#FFCC00',
            fontFamily: '"SF Mono", "Fira Code", monospace',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          🧠 AI THREAT INTELLIGENCE ENGINE
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5 * scale,
            py: 0.5 * scale,
            bgcolor: 'rgba(40, 202, 66, 0.1)',
            borderRadius: 1,
            border: '1px solid rgba(40, 202, 66, 0.3)',
          }}
        >
          <Box
            sx={{
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: '50%',
              bgcolor: '#28CA42',
              animation: `${neuralPulse} 1.5s ease-in-out infinite`,
            }}
          />
          <Typography sx={{ fontSize: 9 * scale, color: '#28CA42', fontFamily: 'monospace' }}>
            LEARNING ACTIVE
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: `calc(100% - ${40 * scale}px)` }}>
        {/* Left panel - Neural Network Visualization */}
        <Box
          sx={{
            width: '55%',
            p: 2 * scale,
            position: 'relative',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Typography
            sx={{
              fontSize: 10 * scale,
              color: 'rgba(255, 255, 255, 0.5)',
              mb: 1 * scale,
              fontWeight: 500,
            }}
          >
            Neural Network Architecture
          </Typography>

          {/* Neural Network SVG */}
          <Box
            sx={{
              position: 'relative',
              height: 'calc(100% - 30px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 280"
              style={{ overflow: 'visible' }}
            >
              {/* Connection lines between layers */}
              {layers.slice(0, -1).map((layer, layerIndex) => {
                const nextLayer = layers[layerIndex + 1];
                const x1 = 40 + layerIndex * 80;
                const x2 = 40 + (layerIndex + 1) * 80;

                return layer.nodes > 0 && nextLayer.nodes > 0 && (
                  <g key={`connections-${layerIndex}`}>
                    {Array.from({ length: layer.nodes }).map((_, i) => {
                      const y1 = 140 - ((layer.nodes - 1) * 25) / 2 + i * 25;
                      return Array.from({ length: nextLayer.nodes }).map((_, j) => {
                        const y2 = 140 - ((nextLayer.nodes - 1) * 25) / 2 + j * 25;
                        return (
                          <line
                            key={`line-${layerIndex}-${i}-${j}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255, 204, 0, 0.15)"
                            strokeWidth={0.5}
                            style={{
                              animation: `${connectionPulse} ${2 + Math.random() * 2}s ease-in-out infinite`,
                              animationDelay: `${Math.random() * 2}s`,
                            }}
                          />
                        );
                      });
                    })}
                  </g>
                );
              })}

              {/* Animated data flow paths */}
              {[0, 1, 2].map((pathIndex) => (
                <path
                  key={`flow-${pathIndex}`}
                  d={`M 40 ${120 + pathIndex * 40} Q 200 ${100 + pathIndex * 30} 360 ${130 + pathIndex * 20}`}
                  fill="none"
                  stroke="#FFCC00"
                  strokeWidth={2}
                  strokeDasharray="10 5"
                  style={{
                    animation: `${dataFlow} ${3 + pathIndex * 0.5}s linear infinite`,
                    animationDelay: `${pathIndex * 1}s`,
                  }}
                />
              ))}

              {/* Neural nodes */}
              {layers.map((layer, layerIndex) => {
                const x = 40 + layerIndex * 80;
                return (
                  <g key={`layer-${layerIndex}`}>
                    {Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
                      const y = 140 - ((layer.nodes - 1) * 25) / 2 + nodeIndex * 25;
                      return (
                        <g key={`node-${layerIndex}-${nodeIndex}`}>
                          {/* Glow effect */}
                          <circle
                            cx={x}
                            cy={y}
                            r={12}
                            fill={`${layer.color}20`}
                            style={{
                              animation: `${neuralPulse} ${1.5 + Math.random()}s ease-in-out infinite`,
                              animationDelay: `${nodeIndex * 0.2}s`,
                            }}
                          />
                          {/* Node */}
                          <circle
                            cx={x}
                            cy={y}
                            r={6}
                            fill={layer.color}
                            stroke={`${layer.color}80`}
                            strokeWidth={2}
                          />
                        </g>
                      );
                    })}
                    {/* Layer label */}
                    <text
                      x={x}
                      y={260}
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.4)"
                      fontSize={8}
                      fontFamily="monospace"
                    >
                      {layer.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating learning indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: '15%',
                right: '5%',
                p: 1 * scale,
                bgcolor: 'rgba(255, 204, 0, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255, 204, 0, 0.3)',
                animation: `${floatOrb} 6s ease-in-out infinite`,
              }}
            >
              <Typography sx={{ fontSize: 8 * scale, color: '#FFCC00', fontFamily: 'monospace' }}>
                Epoch: 1,847
              </Typography>
              <Typography sx={{ fontSize: 10 * scale, color: '#28CA42', fontWeight: 700 }}>
                Accuracy: 99.7%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right panel - Pattern Recognition & Stats */}
        <Box sx={{ flex: 1, p: 2 * scale, display: 'flex', flexDirection: 'column', gap: 1.5 * scale }}>
          {/* Learning metrics */}
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              p: 1.5 * scale,
            }}
          >
            <Typography sx={{ fontSize: 10 * scale, color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              Model Training Progress
            </Typography>
            <Stack spacing={1 * scale}>
              {[
                { label: 'Pattern Recognition', value: 98.7, color: '#FFCC00' },
                { label: 'Anomaly Detection', value: 97.2, color: '#5B8DEF' },
                { label: 'Threat Classification', value: 99.1, color: '#28CA42' },
              ].map((metric, i) => (
                <Box key={i}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 9 * scale, color: 'rgba(255, 255, 255, 0.6)' }}>
                      {metric.label}
                    </Typography>
                    <Typography sx={{ fontSize: 9 * scale, color: metric.color, fontFamily: 'monospace' }}>
                      {metric.value}%
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 3 * scale,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${metric.value}%`,
                        bgcolor: metric.color,
                        borderRadius: 2,
                        animation: `${learningProgress} 2s ease-out`,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Detected patterns */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              p: 1.5 * scale,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Pattern scan effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '30%',
                background: 'linear-gradient(to bottom, rgba(255, 204, 0, 0.1) 0%, transparent 100%)',
                animation: `${patternScan} 3s linear infinite`,
                pointerEvents: 'none',
              }}
            />

            <Typography sx={{ fontSize: 10 * scale, color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              Learned Attack Patterns
            </Typography>
            <Stack spacing={0.75 * scale}>
              {threatPatterns.map((pattern, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1 * scale,
                    bgcolor: 'rgba(255, 204, 0, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 204, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 204, 0, 0.1)',
                      borderColor: 'rgba(255, 204, 0, 0.3)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8 * scale,
                      height: 8 * scale,
                      borderRadius: '50%',
                      bgcolor: '#FFCC00',
                      animation: `${nodeActivate} ${2 + i * 0.3}s ease-in-out infinite`,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 9 * scale, color: 'rgba(255, 255, 255, 0.8)' }}>
                      {pattern.name}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 10 * scale, color: '#28CA42', fontFamily: 'monospace', fontWeight: 600 }}>
                      {pattern.confidence}%
                    </Typography>
                    <Typography sx={{ fontSize: 8 * scale, color: '#5B8DEF' }}>
                      {pattern.trend}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Global threat library */}
          <Box
            sx={{
              bgcolor: 'rgba(91, 141, 239, 0.08)',
              borderRadius: 1.5,
              p: 1.25 * scale,
              border: '1px solid rgba(91, 141, 239, 0.2)',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14 * scale }}>🌐</Typography>
                <Box>
                  <Typography sx={{ fontSize: 9 * scale, color: '#5B8DEF', fontWeight: 600 }}>
                    Global Threat Network
                  </Typography>
                  <Typography sx={{ fontSize: 8 * scale, color: 'rgba(255, 255, 255, 0.4)' }}>
                    2.4M+ attack patterns indexed
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 10 * scale, color: '#28CA42', fontFamily: 'monospace' }}>
                SYNCED
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Premium glass reflection */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom edge glow */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: 1,
          bgcolor: 'rgba(255, 204, 0, 0.3)',
          filter: 'blur(2px)',
        }}
      />
    </Box>
  );
}

ThreatIntelligenceMockup.propTypes = {
  scale: PropTypes.number,
};
