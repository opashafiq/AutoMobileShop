'use client'

import { motion } from 'framer-motion'

export default function AnimatedTextBackgroundMotion() {
  return (
    <main className='grid'>
      <motion.h1
        className='text-3xl font-bold text-start bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'
        animate={{
          backgroundImage: [
            'linear-gradient(to right, hsl(98 100% 62%), hsl(204 100% 59%))',
            'linear-gradient(to right, hsl(210 100% 59%), hsl(310 100% 59%))',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}>
        Animated Gradient Text
      </motion.h1>
    </main>
  )
}
