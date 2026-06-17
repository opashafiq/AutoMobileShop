"use client";

import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'


const HoverLiftButton = () => {
  return (
    <>
        <Button asChild className="rounded-lg">
          <motion.button
            whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            Lift on hover
          </motion.button>
        </Button>
    </>
  )
}

export default HoverLiftButton
