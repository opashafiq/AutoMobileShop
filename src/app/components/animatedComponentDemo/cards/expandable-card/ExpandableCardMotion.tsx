'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      callback(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}
export default function ExpandableCardMotion() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  )
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(false)
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  useOutsideClick(ref as any, () => setActive(null))

  return (
    <>
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/20 dark:bg-white/5 h-full w-full z-[999]'
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <div className='fixed inset-0  grid place-items-center z-[9999]'>
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className='flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6'
              onClick={() => setActive(null)}>
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className='w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-dark sm:rounded-3xl overflow-hidden'>
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className='w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top'
                />
              </motion.div>

              <div>
                <div className='flex justify-between items-start p-4 gap-6'>
                  <div className=''>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className='font-bold text-neutral-700 dark:text-neutral-200 text-lg'>
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`author-${active.author}-${id}`}
                      className='text-neutral-600 dark:text-neutral-400 text-sm font-medium'>
                      {active.author}
                    </motion.p>
                  </div>
                </div>
                <div className='pt-4 relative px-4'>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-neutral-600 !text-xs h-40 md:h-fit pb-10 flex flex-col items-start gap-4 expandable-card overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]'>
                    {typeof active.content === 'function'
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className=' w-full gap-4'>
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className='p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-white/3 rounded-xl cursor-pointer'>
            <div className='flex gap-4 flex-col md:flex-row align-items-center'>
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <Image
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  className='h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top'
                />
              </motion.div>
              <div className=''>
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className='font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base'>
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`author-${card.author}-${id}`}
                  className='text-neutral-600 dark:text-neutral-400 text-center md:text-left text-sm font-medium'>
                  {card.author}
                </motion.p>
              </div>
            </div>
            <Button asChild className='rounded-full'>
              <motion.button
                layoutId={`button-${card.title}-${id}`}
                className='px-4 py-2 text-sm rounded-full font-bold mt-4 md:mt-0'>
                {card.ctaText}
              </motion.button>
            </Button>
          </motion.div>
        ))}
      </ul>
    </>
  )
}
const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4 text-black'>
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M18 6l-12 12' />
      <path d='M6 6l12 12' />
    </motion.svg>
  )
}

const cards = [
  {
    author: 'David Mathew',
    title: 'As yen tumbles, gadget-loving Japan goes for secondhand iPhones',
    src: '/images/blog/blog-img1.jpg',
    ctaText: 'Read',
    ctaLink: 'https://tailwindadmin-nextjs-main.vercel.app/apps/blog/post',
    content: () => {
      return (
        <p>
          But you cannot figure out what it is or what it can do. MTA web
          directory is the simplest way in which one can bid on a link, or a few
          links if they wish to do so. The link directory on MTA displays all of
          the links it currently has, and does so in alphabetical order, which
          makes it much easier for someone to find what they are looking for if
          it is something specific and they do not want to go through all the
          other sites and links as well. It allows you to start your bid at the
          bottom and slowly work your way to the top of the list
        </p>
      )
    },
  },
  {
    author: 'Ben Stokes',
    title:
      'Intel loses bid to revive antitrust case against patent foe Fortress',
    src: '/images/blog/blog-img2.jpg',
    ctaText: 'Read',
    ctaLink: 'https://tailwindadmin-nextjs-main.vercel.app/apps/blog/post',
    content: () => {
      return (
        <p>
          But you cannot figure out what it is or what it can do. MTA web
          directory is the simplest way in which one can bid on a link, or a few
          links if they wish to do so. The link directory on MTA displays all of
          the links it currently has, and does so in alphabetical order, which
          makes it much easier for someone to find what they are looking for if
          it is something specific and they do not want to go through all the
          other sites and links as well. It allows you to start your bid at the
          bottom and slowly work your way to the top of the list
        </p>
      )
    },
  },

  {
    author: 'Michael Jhonson',
    title: 'COVID outbreak deepens as more lockdowns loom in China',
    src: '/images/blog/blog-img3.jpg',
    ctaText: 'Read',
    ctaLink: 'https://tailwindadmin-nextjs-main.vercel.app/apps/blog/post',
    content: () => {
      return (
        <p>
          But you cannot figure out what it is or what it can do. MTA web
          directory is the simplest way in which one can bid on a link, or a few
          links if they wish to do so. The link directory on MTA displays all of
          the links it currently has, and does so in alphabetical order, which
          makes it much easier for someone to find what they are looking for if
          it is something specific and they do not want to go through all the
          other sites and links as well. It allows you to start your bid at the
          bottom and slowly work your way to the top of the list
        </p>
      )
    },
  },
  {
    author: 'Sanju Samson',
    title: 'Streaming video way before it was cool, go dark tomorrow',
    src: '/images/blog/blog-img4.jpg',
    ctaText: 'Read',
    ctaLink: 'https://tailwindadmin-nextjs-main.vercel.app/apps/blog/post',
    content: () => {
      return (
        <p>
          But you cannot figure out what it is or what it can do. MTA web
          directory is the simplest way in which one can bid on a link, or a few
          links if they wish to do so. The link directory on MTA displays all of
          the links it currently has, and does so in alphabetical order, which
          makes it much easier for someone to find what they are looking for if
          it is something specific and they do not want to go through all the
          other sites and links as well. It allows you to start your bid at the
          bottom and slowly work your way to the top of the list
        </p>
      )
    },
  },
  {
    author: 'Peter Parker',
    title: 'After Twitter Staff Cuts, Survivors Face Radio Silence',
    src: '/images/blog/blog-img5.jpg',
    ctaText: 'Read',
    ctaLink: 'https://tailwindadmin-nextjs-main.vercel.app/apps/blog/post',
    content: () => {
      return (
        <p>
          But you cannot figure out what it is or what it can do. MTA web
          directory is the simplest way in which one can bid on a link, or a few
          links if they wish to do so. The link directory on MTA displays all of
          the links it currently has, and does so in alphabetical order, which
          makes it much easier for someone to find what they are looking for if
          it is something specific and they do not want to go through all the
          other sites and links as well. It allows you to start your bid at the
          bottom and slowly work your way to the top of the list
        </p>
      )
    },
  },
]
