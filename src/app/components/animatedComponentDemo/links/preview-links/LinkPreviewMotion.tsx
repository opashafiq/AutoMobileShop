'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { encode } from 'qss'
import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

type LinkPreviewProps = {
  children: React.ReactNode
  url: string
  className?: string
  width?: number
  height?: number
  isStatic?: any
  imageSrc?: string
}

function LinkPreviewTag({
  children,
  url,
  className,
  width = 200,
  height = 125,
  isStatic = false,
  imageSrc,
}: LinkPreviewProps) {
  const [open, setOpen] = useState(false)
  const src = isStatic
    ? imageSrc
    : `https://api.microlink.io/?${encode({
        url,
        screenshot: true,
        meta: false,
        embed: 'screenshot.url',
        colorScheme: 'dark',
        'viewport.isMobile': true,
        'viewport.deviceScaleFactor': 1,
        'viewport.width': width * 3,
        'viewport.height': height * 3,
      })}`
  return (
    <HoverCard openDelay={50} closeDelay={100} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <a
          href={url}
          className={cn(
            'text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80',
            className
          )}>
          {children}
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        side='top'
        align='center'
        sideOffset={10}
        className='!p-0'>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className='rounded-md shadow-xl overflow-hidden'>
            <a href={url} className='block p-0'>
              <Image
                src={src!}
                width={width}
                height={height}
                alt='preview'
                style={{ width: '100%' }}
              />
            </a>
          </motion.div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

export default function LinkPreviewMotion() {
  return (
    <>
      <div>
        <p className='text-dark dark:text-white text-xl mb-10'>
          <LinkPreviewTag url='https://wrappixel.com' className='font-bold'>
            Wrappixel
          </LinkPreviewTag>{' '}
          and
          <LinkPreviewTag
            url='https://adminmart.com'
            className='font-bold mx-2'>
            Adminmart
          </LinkPreviewTag>
          are the market leaders in the dashboard or template industry.
        </p>
      </div>
    </>
  )
}
