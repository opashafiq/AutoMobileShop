'use client'

import { motion, useTransform, useMotionValue, useSpring } from 'motion/react'
import Image from 'next/image'

type Item = {
  id: number
  name: string
  designation: string
  image: string
}

const AnimatedTooltipMotion = () => {
  const x = useMotionValue(0)
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), {
    stiffness: 100,
    damping: 15,
  })
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), {
    stiffness: 100,
    damping: 15,
  })

  const items = [
    {
      id: 1,
      name: 'Aarav Mehta',
      designation: 'AI Researcher',
      image: '/images/profile/user-1.jpg',
    },
    {
      id: 2,
      name: 'Sofia Martinez',
      designation: 'Cloud Architect',
      image: '/images/profile/user-2.jpg',
    },
    {
      id: 3,
      name: 'Kenji Tanaka',
      designation: 'Cybersecurity Analyst',
      image: '/images/profile/user-3.jpg',
    },
    {
      id: 4,
      name: 'Amelia Rossi',
      designation: 'UX Strategist',
      image: '/images/profile/user-4.jpg',
    },
    {
      id: 5,
      name: 'Liam O’Connor',
      designation: 'Blockchain Developer',
      image: '/images/profile/user-5.jpg',
    },
    {
      id: 6,
      name: 'Zara Ibrahim',
      designation: 'Robotics Engineer',
      image: '/images/profile/user-6.jpg',
    },
  ]

  return (
    <div className='flex items-center justify-center '>
      {items.map((item) => (
        <div key={item.id} className='group relative -mr-4'>
          <motion.div
            style={{ translateX, rotate }}
            className='pointer-events-none absolute -top-16 left-1/2 hidden -translate-x-1/2 flex-col items-center rounded-md bg-primary px-4 py-2 text-xs shadow-xl group-hover:flex'>
            <div className='text-base font-bold text-white whitespace-nowrap'>
              {item.name}
            </div>
            <div className='text-xs text-white whitespace-nowrap'>
              {item.designation}
            </div>
          </motion.div>

          <Image
            onMouseMove={(e) =>
              x.set(e.nativeEvent.offsetX - e.currentTarget.offsetWidth / 2)
            }
            src={item.image}
            alt={item.name}
            width={56}
            height={56}
            className='h-14 w-14 rounded-full border-2 border-white object-cover object-top transition duration-500 group-hover:z-30 group-hover:scale-105'
          />
        </div>
      ))}
    </div>
  )
}

export default AnimatedTooltipMotion
