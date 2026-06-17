"use client";

import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'


const TapPopButton = () => {
  return (
    <>
        <Button asChild variant="secondary" className="rounded-lg">
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            Tap pop
          </motion.button>
        </Button>
    </>
  )
}

export default TapPopButton
