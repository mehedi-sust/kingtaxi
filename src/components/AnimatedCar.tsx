'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AnimatedCar() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Define the starting/stopping position (under the logo)
  const logoPosition = 'calc(20% - 40px)';

  useEffect(() => {
    // Start animation after a short delay
    const startTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      // After animation completes, wait and then reset
      const resetTimer = setTimeout(() => {
        setIsAnimating(false);
        setHasAnimated(true);
      }, 3000); // Duration of the animation

      return () => clearTimeout(resetTimer);
    }
  }, [isAnimating]);

  // Restart animation after some time
  useEffect(() => {
    if (hasAnimated) {
      const restartTimer = setTimeout(() => {
        setIsAnimating(true);
        setHasAnimated(false);
      }, 8000); // Wait 8 seconds before restarting

      return () => clearTimeout(restartTimer);
    }
  }, [hasAnimated]);

  return (
    <div className="absolute bottom-2 left-0 right-0 h-12 overflow-visible pointer-events-none z-[60]">
      <motion.div
        className="absolute bottom-0 flex items-center"
        initial={{ x: logoPosition, opacity: 0 }}
        animate={{
          x: isAnimating ? 'calc(100% + 100px)' : logoPosition,
          opacity: isAnimating ? [0, 1, 1, 0] : 0
        }}
        transition={{
          duration: isAnimating ? 3 : 0.8,
          ease: isAnimating ? "linear" : "easeInOut",
          delay: isAnimating ? 0 : 0.2,
          opacity: {
            duration: isAnimating ? 3 : 0.8,
            times: isAnimating ? [0, 0.1, 0.8, 1] : [0, 1], // Fade in at start, fade out near end
            ease: "easeInOut"
          }
        }}
      >
        {/* SUV Car Image */}
        <div className="relative">
          <Image
            src="/suv-car.png"
            alt="King Taxi SUV"
            width={80}
            height={40}
            className="drop-shadow-lg"
            priority
            style={{
              transform: 'scaleX(-1)', // Flip horizontally to face right
              filter: 'sepia(1) saturate(4) hue-rotate(15deg) brightness(0.9) contrast(1.1)', // Make car red
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
