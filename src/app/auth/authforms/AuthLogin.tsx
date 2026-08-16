'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import auth from '@/app/api/auth'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

const inputFocusClasses =
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_0_3px_rgba(93,135,255,0.15)]'

const AuthLogin = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const username = form.username.value.trim()
    const password = form.password.value.trim()

    if (!username || !password) {
      toast.error('Please enter both username and password.')
      return
    }

    try {
      setLoading(true)
      await auth.login(username, password)
      router.push('/')
    } catch (err: any) {
      console.error('Login error', err)
      toast.error(err?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ToastContainer position='top-right' autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss />
      <form onSubmit={handleSubmit} className='mt-6'>
      <div className='mb-4'>
        <Label htmlFor='username'>Username</Label>
        <Input
          id='username'
          name='username'
          type='text'
          required
          placeholder='Enter your username'
          className={`border-[#D0D5DD] dark:border-[#556275] ${inputFocusClasses}`}
        />
      </div>
      <div className='mb-4'>
        <Label htmlFor='password'>Password</Label>
        <div className='relative'>
          <Input
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            required
            placeholder='Enter your password'
            className={`border-[#D0D5DD] dark:border-[#556275] pr-10 ${inputFocusClasses}`}
          />
          <button
            type='button'
            tabIndex={-1}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors'
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>
      </div>
      <div className='flex items-center gap-2 my-5'>
        <Checkbox id='remember' />
        <Label htmlFor='remember'>Remember this Device</Label>
      </div>
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      </form>
    </>
  )
}

export default AuthLogin
