'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type Tab = {
  title: string
  value: string
  content?: React.ReactNode
}

type TabsProps = {
  tabs: Tab[]
  containerClassName?: string
  activeTabClassName?: string
  tabClassName?: string
  contentClassName?: string
}

const DummyContent = () => {
  return (
    <img
      src='/images/blog/blog-img1.jpg'
      alt='dummy image'
      width='1000'
      height='1000'
      className='object-cover object-left-top absolute -bottom-10 inset-x-0 rounded-xl mx-auto'
    />
  )
}

const tabs = [
  {
    title: 'Product',
    value: 'product',
    content: (
      <div className='w-full overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900 h-[300px]'>
        <p>Product Tab</p>
        <DummyContent />
      </div>
    ),
  },
  {
    title: 'Services',
    value: 'services',
    content: (
      <div className='w-full overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900 h-[300px]'>
        <p>Services tab</p>
        <DummyContent />
      </div>
    ),
  },
  {
    title: 'Playground',
    value: 'playground',
    content: (
      <div className='w-full overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900 h-[300px]'>
        <p>Playground tab</p>
        <DummyContent />
      </div>
    ),
  },
  {
    title: 'Content',
    value: 'content',
    content: (
      <div className='w-full overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900 h-[300px]'>
        <p>Content tab</p>
        <DummyContent />
      </div>
    ),
  },
  {
    title: 'Random',
    value: 'random',
    content: (
      <div className='w-full overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900 h-[300px]'>
        <p>Random tab</p>
        <DummyContent />
      </div>
    ),
  },
]

const Tabs = ({
  tabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: TabsProps) => {
  const [activeIdx, setActiveIdx] = useState(0)
  const [hovering, setHovering] = useState(false)

  const handleSelect = (idx: number) => {
    setActiveIdx(idx)
  }

  const reorderedTabs = [
    tabs[activeIdx],
    ...tabs.filter((_, i) => i !== activeIdx),
  ]

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full',
          containerClassName
        )}>
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIdx
          return (
            <button
              key={tab.value}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className={cn('relative px-4 py-2 rounded-full', tabClassName)}
              style={{ transformStyle: 'preserve-3d' }}>
              {isActive && (
                <motion.div
                  layoutId='clickedbutton'
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  className={cn(
                    'absolute inset-0 bg-primary  rounded-full',
                    activeTabClassName
                  )}
                />
              )}
              <span
                className={`relative block  ${
                  isActive ? 'text-white' : 'text-black dark:text-white'
                }`}>
                {tab.title}
              </span>
            </button>
          )
        })}
      </div>

      <FadeInStack
        tabs={reorderedTabs}
        hovering={hovering}
        className={cn('mt-10', contentClassName)}
      />
    </>
  )
}

type FadeInStackProps = {
  className?: string
  tabs: Tab[]
  hovering?: boolean
}

const FadeInStack = ({ className, tabs, hovering }: FadeInStackProps) => {
  return (
    <div className='relative w-full h-[300px]'>
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -15 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: idx === 0 ? [0, 40, 0] : 0,
          }}
          className={cn('w-full h-full absolute top-0 left-0', className)}>
          {tab.content}
        </motion.div>
      ))}
    </div>
  )
}

export default function AnimatedTabMotion() {
  return (
    <>
      <div className=' [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start mb-13'>
        <Tabs tabs={tabs} />
      </div>
    </>
  )
}
