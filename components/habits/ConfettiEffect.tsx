'use client';

import { useEffect, useState } from 'react';
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
 */
export function ConfettiEffect({ 
  onComplete 
}: { 
  onComplete?: () => void 
}) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    // Generate 20 confetti particles
    const newParticles: ConfettiParticle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random starting X position (0-100%)
      y: -10, // Start above the viewport
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
    }));

    setParticles(newParticles);

    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{
            y: -10,
            x: 0,
            rotate: particle.rotation,
            scale: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            x: (Math.random() - 0.5) * 200,
            rotate: particle.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            scale: [1, 1.2, 0.8, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            delay: particle.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

