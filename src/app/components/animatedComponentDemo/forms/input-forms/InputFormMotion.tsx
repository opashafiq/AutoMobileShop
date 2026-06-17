'use client'
import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, placeholder, ...props }, ref) => {
    const radius = 100
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const [active, setActive] = React.useState(false)

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }

    return (
      <motion.div
        onMouseMove={handleMove}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        style={{
          background: useMotionTemplate`
            radial-gradient(${
              active ? `${radius}px` : '0px'
            } circle at ${mouseX}px ${mouseY}px,
            var(--color-primary), transparent 80%)
          `,
        }}
        className='rounded-lg p-[2px] transition'>
        <ShadcnInput
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...props}
          className={cn(
            'flex h-10 w-full rounded-md bg-gray-50 dark:bg-dark border dark:border-transparent border-transparent focus:border-primary dark:focus:border-primary',
            className
          )}
        />
      </motion.div>
    )
  }
)

export default function InputFormMotion() {
  return (
    <div className='flex justify-center'>
      <form className='max-w-md min-w-md p-6 shadow rounded-md bg-white dark:bg-gray-900'>
        <h2 className='text-xl font-semibold text-center text-gray-800 dark:text-white mb-4'>
          Sign Up Form
        </h2>

        <div className='mb-4'>
          <label className='mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300'>
            Full Name
          </label>
          <Input type='text' placeholder='Enter your full name' />
        </div>

        <div className='mb-4'>
          <label className='mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300'>
            Email
          </label>
          <Input type='email' placeholder='Enter your email' />
        </div>

        <div className='mb-4'>
          <label className='mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300'>
            Password
          </label>
          <Input type='password' placeholder='Enter your password' />
        </div>

        <div className='mb-4'>
          <label className='mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300'>
            Confirm Password
          </label>
          <Input type='password' placeholder='Confirm your password' />
        </div>

        <Button type='submit' className='w-full'>
          Sign Up
        </Button>

        <p className='mt-4 text-sm text-center text-gray-500 dark:text-gray-400'>
          Already have an account?{' '}
          <a href='#' className='text-blue-500 hover:underline'>
            Sign In
          </a>
        </p>
      </form>
    </div>
  )
}
