"use client";

import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'


const PlayfulWigleButton = () => {
  return (
    <>
        <Button asChild variant="outline" className="rounded-lg">
          <motion.button
            whileHover={{ rotate: [0, -3, 3, -2, 2, 0] }}
            transition={{ duration: 0.5 }}
          >
            Hover wiggle
          </motion.button>
        </Button>
    </>
  )
}

export default PlayfulWigleButton
