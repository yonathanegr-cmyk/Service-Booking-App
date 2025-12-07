import { motion } from 'motion/react';
import { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
