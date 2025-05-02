// src/components/Sparkle.tsx
import React from 'react';
import { motion, SVGMotionProps } from 'framer-motion'; // Import SVGMotionProps

// Define the props interface based on SVGMotionProps, omitting properties handled internally
interface SparkleProps extends Omit<SVGMotionProps<SVGSVGElement>, 'color' | 'className' | 'initial' | 'animate' | 'transition' | 'children' | 'width' | 'height' | 'viewBox' | 'fill' | 'xmlns'> {
  color?: string; // Optional prop to customize the main color
  className?: string; // Allow className override
}

const Sparkle: React.FC<SparkleProps> = ({
  color = '#F472B6', // Default pink color if not provided
  className = '',   // Default className to empty string
  ...props        // Spread the rest of the compatible props (like style, id)
}) => {
  return (
    // Use motion.svg for animations
    <motion.svg
      // Default size, can be overridden by props or className
      width="60"
      height="60"
      viewBox="0 0 100 100" // Coordinate system for drawing paths
      fill="none" // Default fill to none, paths specify their own fill
      xmlns="http://www.w3.org/2000/svg"
      // Framer Motion animation properties
      initial={{ scale: 0, rotate: -90 }} // Start scaled down and rotated
      animate={{ scale: 1, rotate: 0 }}   // Animate to full size and zero rotation
      transition={{
        type: 'spring',    // Use a spring physics animation
        stiffness: 260,    // Spring stiffness
        damping: 20,       // Spring damping (controls oscillation)
        delay: 0.5         // Start animation after a delay
      }}
      // Combine default className with any passed className prop
      className={`inline-block ${className}`}
      // Spread any remaining props (e.g., style) onto the SVG element
      {...props}
    >
      {/* Main star shape */}
      <path
        d="M50 0 L61.8 38.2 L100 38.2 L69.1 61.8 L80.9 100 L50 76.4 L19.1 100 L30.9 61.8 L0 38.2 L38.2 38.2 Z"
        fill={color} // Use the color prop for the main fill
        stroke="black" // Black outline
        strokeWidth="3" // Outline thickness
      />
      {/* Smaller accent stars/sparkles (white fill, black outline) */}
      <path
        d="M15 15 L18 10 L21 15 L26 18 L21 21 L18 26 L15 21 L10 18 Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      <path
        d="M85 15 L88 10 L91 15 L96 18 L91 21 L88 26 L85 21 L80 18 Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      <path
        d="M15 85 L18 80 L21 85 L26 88 L21 91 L18 96 L15 91 L10 88 Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      <path
        d="M85 85 L88 80 L91 85 L96 88 L91 91 L88 96 L85 91 L80 88 Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
    </motion.svg>
  );
};

export default Sparkle;