import React from 'react';
import { motion } from 'motion/react';

interface CompassLogoProps {
  className?: string;
  size?: number;
  animateContinuous?: boolean;
}

export function CompassLogo({ className = '', size = 36, animateContinuous = false }: CompassLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 512 512"
        className="w-full h-full"
        animate={animateContinuous ? {
          rotate: [0, 5, -5, 0],
        } : {}}
        whileHover={{ scale: 1.05 }}
        transition={{
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            type: "spring",
            stiffness: 300,
            damping: 15
          }
        }}
      >
        <defs>
          {/* Mask to create the uniform circular gap around the central gold circle */}
          <mask id="pointer-cutout-react">
            <rect x="0" y="0" width="512" height="512" fill="white" />
            <circle cx="256" cy="256" r="88" fill="black" />
          </mask>

          {/* Mask to carve the 4-leaf clover cutout from the gold circle */}
          <mask id="clover-cutout-react">
            <rect x="0" y="0" width="512" height="512" fill="white" />
            <circle cx="256" cy="234" r="20" fill="black" />
            <circle cx="256" cy="278" r="20" fill="black" />
            <circle cx="234" cy="256" r="20" fill="black" />
            <circle cx="278" cy="256" r="20" fill="black" />
            <circle cx="256" cy="256" r="14" fill="black" />
          </mask>
        </defs>

        {/* Outer subtle decorative target ring */}
        <circle cx="256" cy="256" r="246" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-10 text-slate-400 dark:text-white" />
        <circle cx="256" cy="256" r="226" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 6" className="opacity-[0.06] text-slate-400 dark:text-white" />

        {/* Group 1: Compass Pointers with cutout mask */}
        <g mask="url(#pointer-cutout-react)">
          {/* North Pointer */}
          <path d="M 256,50 L 220,160 L 256,210 Z" fill="#3b82f6" />
          <path d="M 256,50 L 256,210 L 292,160 Z" fill="#1d4ed8" />

          {/* East Pointer */}
          <path d="M 462,256 L 352,220 L 302,256 Z" fill="#3b82f6" />
          <path d="M 462,256 L 302,256 L 352,292 Z" fill="#1d4ed8" />

          {/* South Pointer */}
          <path d="M 256,462 L 220,352 L 256,302 Z" fill="#1d4ed8" />
          <path d="M 256,462 L 256,302 L 292,352 Z" fill="#3b82f6" />

          {/* West Pointer */}
          <path d="M 50,256 L 160,220 L 210,256 Z" fill="#1d4ed8" />
          <path d="M 50,256 L 210,256 L 160,292 Z" fill="#3b82f6" />

          {/* Diagonal Pointers */}
          {/* North-East */}
          <path d="M 376,136 L 306,146 L 296,216 Z" fill="#f59e0b" />
          <path d="M 376,136 L 296,216 L 366,206 Z" fill="#d97706" />

          {/* South-East */}
          <path d="M 376,376 L 366,306 L 296,296 Z" fill="#f59e0b" />
          <path d="M 376,376 L 296,296 L 306,366 Z" fill="#d97706" />

          {/* South-West */}
          <path d="M 136,376 L 146,306 L 216,296 Z" fill="#d97706" />
          <path d="M 136,376 L 216,296 L 206,366 Z" fill="#f59e0b" />

          {/* North-West */}
          <path d="M 136,136 L 206,146 L 216,216 Z" fill="#f59e0b" />
          <path d="M 136,136 L 216,216 L 146,206 Z" fill="#d97706" />
        </g>

        {/* Group 2: Central Gold Circle with Clover Mask */}
        <motion.g 
          mask="url(#clover-cutout-react)"
          animate={animateContinuous ? {
            rotate: [0, -360],
          } : {}}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ originX: '256px', originY: '256px' }}
        >
          {/* Left semicircle */}
          <path d="M 256,180 A 76,76 0 0,0 256,332 Z" fill="#d97706" />
          {/* Right semicircle */}
          <path d="M 256,180 A 76,76 0 0,1 256,332 Z" fill="#f59e0b" />
        </motion.g>
      </motion.svg>
      
      {/* Decorative pulse glow rings around the logo */}
      <motion.div
        animate={{
          scale: [0.95, 1.2, 0.95],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full border border-primary/25 pointer-events-none -z-10"
      />
    </div>
  );
}
