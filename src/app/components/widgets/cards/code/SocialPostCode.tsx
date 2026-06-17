'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
} from 'lucide-react'

const SocialPost = () => {
  return (
    <Card className='lg:max-w-md mx-auto p-0 pb-4'>
      <div className='flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <Image
            src='/images/profile/user-5.jpg'
            alt='user avatar'
            width={40}
            height={40}
            className='rounded-full'
          />
          <div>
            <h3 className='font-semibold text-sm'>Andrew Grant</h3>
            <p className='text-xs text-muted-foreground'>
              Yesterday at 5:06 PM
            </p>
          </div>
        </div>
        <MoreHorizontal className='h-5 w-5 text-muted-foreground cursor-pointer' />
      </div>

      <div className='w-full'>
        <Image
          src='/images/blog/blog-img4.jpg'
          alt='post'
          width={500}
          height={300}
          className='w-full h-auto object-cover'
        />
      </div>

      <div className='px-4 py-3'>
        <p className='text-sm'>
          Your beauty is one of the things I like about you. 😍 💘{' '}
          <span className='text-primary'>
            #beauty #goa 🏖️ #india #happylife
          </span>
        </p>
      </div>

      <div className='flex items-center justify-between px-4'>
        <div className='flex gap-4'>
          <Heart className='h-5 w-5 cursor-pointer hover:text-error' />
          <MessageCircle className='h-5 w-5 cursor-pointer hover:text-primary' />
          <Send className='h-5 w-5 cursor-pointer hover:text-success' />
        </div>
        <Bookmark className='h-5 w-5 cursor-pointer hover:text-warning' />
      </div>
    </Card>
  )
}

export default SocialPost
