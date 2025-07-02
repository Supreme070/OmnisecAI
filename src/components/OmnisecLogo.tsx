import { motion } from "framer-motion";

interface OmnisecLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
}

const OmnisecLogo = ({ 
  className = "", 
  size = 'md', 
  showText = true, 
  animate = true 
}: OmnisecLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const logoVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 0,
      rotate: -5 
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    initial: { 
      opacity: 0, 
      x: -20 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const shieldVariants = {
    initial: { pathLength: 0 },
    animate: { 
      pathLength: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.2
      }
    }
  };

  const MotionComponent = animate ? motion.div : 'div';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MotionComponent
        className={`relative ${sizeClasses[size]} flex-shrink-0`}
        variants={animate ? logoVariants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        whileHover={animate ? "hover" : undefined}
      >
        {/* Main Logo Container */}
        <div className="relative w-full h-full">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-sm" />
          
          {/* Main Logo Background */}
          <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
            
            {/* Circuit Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#circuit)" className="text-cyan-400"/>
              </svg>
            </div>

            {/* Main Logo SVG */}
            <svg 
              viewBox="0 0 100 100" 
              className="relative z-10 w-full h-full p-2"
              fill="none"
            >
              {/* Shield Outline */}
              <motion.path
                d="M50 10 C30 10, 20 20, 20 35 C20 65, 40 85, 50 90 C60 85, 80 65, 80 35 C80 20, 70 10, 50 10 Z"
                stroke="url(#shieldGradient)"
                strokeWidth="2"
                fill="none"
                variants={animate ? shieldVariants : undefined}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
              />
              
              {/* Inner Shield Fill */}
              <path
                d="M50 15 C33 15, 25 23, 25 35 C25 60, 42 78, 50 82 C58 78, 75 60, 75 35 C75 23, 67 15, 50 15 Z"
                fill="url(#innerGradient)"
                opacity="0.3"
              />

              {/* Central "O" for Omnisec */}
              <circle
                cx="50"
                cy="40"
                r="12"
                stroke="url(#letterGradient)"
                strokeWidth="3"
                fill="none"
              />
              
              {/* AI Neural Network Pattern */}
              <g stroke="url(#neuralGradient)" strokeWidth="1.5" fill="none">
                {/* Neural nodes */}
                <circle cx="35" cy="30" r="2" fill="currentColor" className="text-cyan-400" opacity="0.8"/>
                <circle cx="65" cy="30" r="2" fill="currentColor" className="text-purple-400" opacity="0.8"/>
                <circle cx="35" cy="50" r="2" fill="currentColor" className="text-blue-400" opacity="0.8"/>
                <circle cx="65" cy="50" r="2" fill="currentColor" className="text-emerald-400" opacity="0.8"/>
                <circle cx="50" cy="65" r="2" fill="currentColor" className="text-cyan-300" opacity="0.8"/>
                
                {/* Neural connections */}
                <path d="M35 30 L50 40 L65 30" strokeDasharray="2,2" opacity="0.6"/>
                <path d="M35 50 L50 40 L65 50" strokeDasharray="2,2" opacity="0.6"/>
                <path d="M50 40 L50 65" strokeDasharray="2,2" opacity="0.6"/>
              </g>

              {/* Security Lock Icon */}
              <g transform="translate(45, 20)">
                <rect x="0" y="3" width="10" height="7" rx="1" fill="none" stroke="url(#lockGradient)" strokeWidth="1"/>
                <path d="M2 3 C2 1, 3 0, 5 0 C7 0, 8 1, 8 3" fill="none" stroke="url(#lockGradient)" strokeWidth="1"/>
                <circle cx="5" cy="6" r="1" fill="currentColor" className="text-cyan-400"/>
              </g>

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                
                <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                </linearGradient>
                
                <linearGradient id="letterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                
                <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                
                <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animated Border Glow */}
            {animate && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </div>
        </div>
      </MotionComponent>

      {showText && (
        <motion.div
          className="flex flex-col"
          variants={animate ? textVariants : undefined}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
        >
          <span className={`font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            OmnisecAI
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground font-medium tracking-wider">
              SECURITY
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OmnisecLogo;