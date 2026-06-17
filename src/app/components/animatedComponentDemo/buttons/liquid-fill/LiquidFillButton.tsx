"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LiquidFillButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <Button asChild variant={"outline"} className="hover:!bg-transparent" >
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative overflow-hidden cursor-pointer"
    >
      {/* liquid fill layer */}
      <motion.span
        initial={{ height: "0%" }}
        animate={{ height: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-full bg-primary z-0"
      />

      {/* text */}
      <span className="relative z-10">Liquid Fill</span>
    </motion.button>
    </Button>
  );
}
