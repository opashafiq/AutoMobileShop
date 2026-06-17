"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function MatrixRainButton() {
  return (
    <Button asChild variant={"outline"} className="hover:!bg-transparent overflow-hidden"  >
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative  cursor-pointer"
    >
      <span className="relative !text-primary">Matrix Rain</span>

      {/* Matrix rain overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        animate={{}}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-0"
      >
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity,
          }}
          className="w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"
        />
      </motion.div>
    </motion.button>
    </Button>
  );
}
