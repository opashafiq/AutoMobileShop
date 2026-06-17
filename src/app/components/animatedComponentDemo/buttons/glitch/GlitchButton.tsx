"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function GlitchButton() {
  return (
   <Button asChild>
    <motion.button
      whileHover={{
        x: [0, -4, -4, 4, 4, 0],
        y: [0, 4, -4, 4, -4, 0],
        transition: {
          duration: 0.3,
          repeat: Infinity,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      }}
      className="relative"
    >
      <span className="relative z-10 
        [text-shadow:0.05em_0_rgba(255,0,0,0.75),-0.025em_-0.05em_rgba(0,255,0,0.75),0.025em_0.05em_rgba(0,0,255,0.75)]
      ">
        Glitch Button
      </span>
    </motion.button>
   </Button>
  );
}
