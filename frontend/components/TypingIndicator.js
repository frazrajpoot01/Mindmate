import { motion } from 'framer-motion';
import BrandIcon from './BrandIcon';

const typingContainer = {
  animate: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const dotVariants = {
  initial: { opacity: 0.2, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }
  },
};

export default function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-end gap-3 max-w-[85%] md:max-w-[75%]"
    >
      <BrandIcon className="w-8 h-8 mb-1" />

      {/* Pulsing Dots Bubble */}
      <motion.div 
        className="flex gap-1.5 items-center px-4 py-3.5 bg-canvas border border-hairline rounded-xl rounded-bl-sm h-[46px] w-fit shadow-sm"
        variants={typingContainer}
        initial="initial"
        animate="animate"
      >
        <motion.span className="w-1.5 h-1.5 rounded-full bg-ink/40" variants={dotVariants} />
        <motion.span className="w-1.5 h-1.5 rounded-full bg-ink/40" variants={dotVariants} />
        <motion.span className="w-1.5 h-1.5 rounded-full bg-ink/40" variants={dotVariants} />
      </motion.div>
    </motion.div>
  );
}
