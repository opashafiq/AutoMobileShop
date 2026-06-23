'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import auth from '@/app/api/auth'

const AuthLogin = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
        />
      </div>
      <div className='mb-4'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          name='password'
          type='password'
          required
          placeholder='Enter your password'
        />
      </div>
      <div className='flex justify-between my-5'>
        <div className='flex items-center gap-2'>
          <Checkbox id='remember' />
          <Label htmlFor='remember'>Remember this Device</Label>
        </div>
        <Link
          href='/auth/auth1/forgot-password'
          className='text-primary text-sm font-medium'>
          Forgot Password?
        </Link>
      </div>
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      </form>
    </>
  )
}

export default AuthLogin
