import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'security';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-primary',
              size === 'sm' ? 'h-2 w-2' : 
              size === 'md' ? 'h-3 w-3' : 
              size === 'lg' ? 'h-4 w-4' : 'h-5 w-5'
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {text && (
          <span className={cn('ml-3 text-slate-600 dark:text-slate-400', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          className={cn(
            'rounded-full bg-primary',
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
        {text && (
          <span className={cn('ml-3 text-slate-600 dark:text-slate-400', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'security') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={cn('text-blue-600 dark:text-blue-400', sizeClasses[size])}
        >
          <Shield className="h-full w-full" />
        </motion.div>
        {text && (
          <span className={cn('ml-3 text-slate-600 dark:text-slate-400', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && (
        <span className={cn('ml-3 text-slate-600 dark:text-slate-400', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto"
        >
          <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">OmnisecAI</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <LoadingSpinner size={size} className="mr-2" />;
}