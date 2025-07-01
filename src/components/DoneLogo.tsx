import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";

interface DoneLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const DoneLogo = ({ 
  size = "md", 
  showText = true, 
  animated = true, 
  className = "" 
}: DoneLogoProps) => {
  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      text: "text-lg font-bold",
      icon: "w-3 h-3",
      spacing: "gap-2"
    },
    md: {
      container: "w-10 h-10",
      text: "text-xl font-bold",
      icon: "w-4 h-4",
      spacing: "gap-3"
    },
    lg: {
      container: "w-12 h-12",
      text: "text-2xl font-bold",
      icon: "w-5 h-5",
      spacing: "gap-3"
    },
    xl: {
      container: "w-16 h-16",
      text: "text-3xl font-bold",
      icon: "w-6 h-6",
      spacing: "gap-4"
    }
  };

  const sizes = sizeClasses[size];

  const LogoIcon = () => (
    <motion.div 
      className={`
        ${sizes.container} rounded-xl
        bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600
        flex items-center justify-center
        shadow-lg shadow-cyan-500/25
        border border-cyan-400/30
        relative overflow-hidden
        ${animated ? 'group cursor-pointer' : ''}
      `}
      whileHover={animated ? { 
        scale: 1.05,
        rotate: [0, -2, 2, 0],
        transition: { duration: 0.3 }
      } : {}}
    >
      {/* Animated Background Gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={animated ? {
          background: [
            "linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246), rgb(6, 182, 212))",
            "linear-gradient(135deg, rgb(139, 92, 246), rgb(6, 182, 212), rgb(99, 102, 241))",
            "linear-gradient(135deg, rgb(6, 182, 212), rgb(99, 102, 241), rgb(139, 92, 246))"
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Circuit Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1 left-1 w-2 h-px bg-white" />
        <div className="absolute top-1 left-1 w-px h-2 bg-white" />
        <div className="absolute bottom-1 right-1 w-2 h-px bg-white" />
        <div className="absolute bottom-1 right-1 w-px h-2 bg-white" />
      </div>

      {/* Main Icons */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Shield className={`${sizes.icon} text-white`} />
        </motion.div>
        <motion.div
          className="absolute"
          animate={animated ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className={`${sizes.icon} text-cyan-200`} />
        </motion.div>
      </div>

      {/* Pulse Ring */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-cyan-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <motion.div 
      className={`flex items-center ${sizes.spacing} ${className}`}
      initial={animated ? { opacity: 0, x: -20 } : {}}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <LogoIcon />
      <div className="flex flex-col">
        <motion.span 
          className={`${sizes.text} font-mono tracking-tight`}
          style={{
            background: "linear-gradient(135deg, rgb(6, 182, 212), rgb(99, 102, 241), rgb(139, 92, 246))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 200%"
          }}
          animate={animated ? {
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          DONE
        </motion.span>
        {size === "lg" || size === "xl" ? (
          <span className="text-xs font-mono text-muted-foreground tracking-wider">
            AI SECURITY
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};