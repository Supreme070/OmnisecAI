'use client';
import PropTypes from 'prop-types';

import { useRef } from 'react';

// @mui
import { alpha, keyframes } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @third-party
import { motion, useScroll, useTransform } from 'motion/react';

// @project
import ButtonAnimationWrapper from '@/components/ButtonAnimationWrapper';
import AnimatedGradientMesh from '@/components/backgrounds/AnimatedGradientMesh';
import ContainerWrapper from '@/components/ContainerWrapper';
import { DashboardMockup } from '@/components/3d';
import SvgIcon from '@/components/SvgIcon';

/***************************  PREMIUM HERO - OMNISECAI  ***************************/

// Gold glow pulse animation
const goldGlowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 204, 0, 0.4), 0 0 40px rgba(255, 204, 0, 0.2), 0 0 60px rgba(255, 204, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 204, 0, 0.6), 0 0 60px rgba(255, 204, 0, 0.3), 0 0 90px rgba(255, 204, 0, 0.15);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export default function HeroPremium({ chip, headLine, captionLine, primaryBtn, secondaryBtn, listData }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', md: '110vh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <AnimatedGradientMesh />

      {/* Content layer */}
      <ContainerWrapper
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: { xs: 6, sm: 8, md: 10 },
          pb: { xs: 8, sm: 10, md: 12 },
          flex: 1,
        }}
      >
        <motion.div style={{ y, opacity }}>
          <Stack sx={{ alignItems: 'center', gap: { xs: 2, md: 3 } }}>
            {/* Animated chip badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Chip
                variant="outlined"
                label={chip.label}
                slotProps={{
                  label: {
                    sx: {
                      py: 0.75,
                      px: 2,
                      ...(typeof chip.label === 'string' && {
                        typography: 'caption',
                        color: 'secondary.main',
                        fontWeight: 500,
                      })
                    }
                  }
                }}
                sx={{
                  bgcolor: 'rgba(255, 204, 0, 0.15)',
                  borderColor: 'rgba(255, 204, 0, 0.5)',
                  '& .MuiChip-label': {
                    color: 'secondary.main',
                  },
                }}
              />
            </motion.div>

            {/* Main headline with gradient text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h1"
                align="center"
                sx={{
                  maxWidth: 900,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'secondary.main',
                  '& span': {
                    background: 'linear-gradient(135deg, #CC9900 0%, #FFCC00 50%, #CC9900 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                    animation: `${shimmer} 3s linear infinite`,
                  },
                }}
              >
                {typeof headLine === 'string' ? (
                  <>
                    {headLine.split(' ').slice(0, 2).join(' ')}{' '}
                    <span>{headLine.split(' ').slice(2).join(' ')}</span>
                  </>
                ) : headLine}
              </Typography>
            </motion.div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h6"
                align="center"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 700,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                }}
              >
                {captionLine}
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  alignItems: 'center',
                  gap: 2,
                  mt: { xs: 2, md: 3 }
                }}
              >
                <ButtonAnimationWrapper>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SvgIcon name="tabler-shield-check" size={20} stroke={2} color="#0A0A14" />}
                      {...primaryBtn}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#FFCC00',
                        color: '#0A0A14',
                        borderRadius: '50px',
                        textTransform: 'none',
                        animation: `${goldGlowPulse} 3s ease-in-out infinite`,
                        '&:hover': {
                          bgcolor: '#FFE066',
                        },
                        ...primaryBtn?.sx,
                      }}
                    />
                  </motion.div>
                </ButtonAnimationWrapper>

                {secondaryBtn && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      {...secondaryBtn}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'secondary.main',
                        borderColor: 'secondary.main',
                        borderRadius: '50px',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(255, 204, 0, 0.1)',
                        },
                        ...secondaryBtn?.sx,
                      }}
                    />
                  </motion.div>
                )}
              </Stack>
            </motion.div>

            {/* Trust badges */}
            {listData && listData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Stack
                  direction="row"
                  sx={{
                    gap: 1.5,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    mt: { xs: 3, md: 4 },
                  }}
                >
                  {listData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.8 + (index * 0.1),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Chip
                        label={item.title}
                        variant="outlined"
                        icon={
                          item.image ? (
                            <GraphicsImage image={item.image} sx={{ width: 16, height: 16 }} />
                          ) : (
                            <SvgIcon name="tabler-certificate" size={16} color="primary.dark" />
                          )
                        }
                        slotProps={{
                          label: {
                            sx: {
                              py: 0.75,
                              px: 1,
                              typography: 'caption',
                              fontWeight: 500,
                              color: 'text.secondary',
                            }
                          }
                        }}
                        sx={{
                          height: 36,
                          px: 1.5,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'grey.300',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(255, 204, 0, 0.1)',
                          },
                        }}
                      />
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            )}
          </Stack>
        </motion.div>

        {/* Dashboard preview - Interactive mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              mt: { xs: 6, md: 8 },
              mx: 'auto',
              maxWidth: 1000,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Glow effect behind dashboard */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '60%',
                background: 'radial-gradient(ellipse, rgba(255, 204, 0, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0,
              }}
            />

            {/* Dashboard mockup with glassmorphism wrapper */}
            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1000 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: { xs: 2, md: 3 },
                  overflow: 'hidden',
                  p: { xs: 0.5, md: 1 },
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: `
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 20px 50px -10px rgba(0, 0, 0, 0.15),
                    0 0 60px -20px rgba(255, 204, 0, 0.2)
                  `,
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: `
                      0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 25px 60px -10px rgba(0, 0, 0, 0.2),
                      0 0 80px -20px rgba(255, 204, 0, 0.3)
                    `,
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <DashboardMockup scale={1} />
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <DashboardMockup scale={0.5} />
                </Box>
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </ContainerWrapper>

      {/* Bottom fade gradient */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 200,
          background: 'linear-gradient(to top, #FFFFFF 0%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

HeroPremium.propTypes = {
  chip: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  }).isRequired,
  headLine: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  captionLine: PropTypes.string.isRequired,
  primaryBtn: PropTypes.shape({
    children: PropTypes.node,
    href: PropTypes.string,
    sx: PropTypes.object,
  }).isRequired,
  secondaryBtn: PropTypes.shape({
    children: PropTypes.node,
    href: PropTypes.string,
    sx: PropTypes.object,
  }),
  listData: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      title: PropTypes.string.isRequired,
    })
  ),
};
