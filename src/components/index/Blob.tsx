// src/components/Blob.tsx
import React from 'react';
import { motion, SVGMotionProps } from 'framer-motion';

// Define the props interface, extending SVGMotionProps
interface BlobProps extends SVGMotionProps<SVGSVGElement> {
    color?: string; // Optional prop for the main color
}

const Blob: React.FC<BlobProps> = ({
    color = '#34D399', // Default green color if not provided
    className = '',    // Default className
    ...props         // Spread the rest of the props
}) => {
  return (
    // Use motion.svg for animations
    <motion.svg
      // Default size, adjustable via props or className
      width="80"
      height="80"
      viewBox="0 0 100 100" // Coordinate system
      fill="none" // Default fill
      xmlns="http://www.w3.org/2000/svg"
      // Animation properties
      initial={{ scale: 0, rotate: 90 }} // Start scaled down and rotated
      animate={{ scale: 1, rotate: 0 }}   // Animate to full size and zero rotation
      transition={{
        type: 'spring',    // Spring animation
        stiffness: 260,
        damping: 20,
        delay: 0.7         // Slightly later delay than Sparkle
      }}
      // Combine default className with passed className
      className={`inline-block ${className}`}
      // Spread remaining props
      {...props}
    >
      {/* Organic blob shape using a quadratic Bezier curve path */}
      <path
        d="M85.5 50 Q80 75 50 85.5 Q20 75 14.5 50 Q20 25 50 14.5 Q80 25 85.5 50 Z"
        fill={color} // Use the color prop
        stroke="black" // Black outline
        strokeWidth="3" // Outline thickness
      />
      {/* Inner detail circle */}
      <circle
        cx="50" // Center X
        cy="50" // Center Y
        r="10"  // Radius
        fill="white" // White fill
        stroke="black" // Black outline
        strokeWidth="2" // Outline thickness
      />
    </motion.svg>
  );
};

export default Blob;