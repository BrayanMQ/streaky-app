'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
}

const COLORS = [
  'hsl(217 91% 60%)', // primary
  'hsl(25 95% 53%)',  // accent
  'hsl(142 71% 45%)', // success
  'hsl(217 91% 60%)', // primary variant
  'hsl(25 95% 53%)',  // accent variant
];

/**
 * ConfettiEffect component
 * 
 * Displays animated confetti particles when a habit is completed
 * Used for special celebrations (e.g., streaks >= 7 days)
 * Portalled to document.body to ensure visibility over all elements
 */
export function ConfettiEffect({ 
  onComplete 
}: { 
  onComplete?: () => void 
}) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate 28 confetti particles for a smooth but rich effect
    const newParticles: ConfettiParticle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random starting X position (0-100%)
      y: -10, // Start above the viewport
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.4,
    }));

    setParticles(newParticles);

    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm will-change-transform"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{
            y: -20,
            x: 0,
            rotate: particle.rotation,
            opacity: 1,
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
            x: (Math.random() - 0.5) * 300,
            rotate: particle.rotation + 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.8 + Math.random() * 0.5,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>,
    document.body
  );
}
