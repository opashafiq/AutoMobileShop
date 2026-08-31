'use client'

// Standalone Change Password page: shows only the password change form — no
// account-settings tabs. Adds a live requirements checklist and a strength
// meter around the same form/API flow used by the compact account-settings
// card (shared zod schema, shared postFetcher call).
import React, { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  IconCircleCheck,
  IconCircleX,
  IconEye,
  IconEyeOff,
  IconLock,
  IconRefresh,
  IconShieldLock,
  IconUserOff,
} from '@tabler/icons-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { getApiUrl, postFetcher } from '@/app/api/globalFetcher'
import { useUser } from '@/app/context/UserContext'
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/app/components/shared/changePasswordSchema'

// Password tips shown alongside the form.
const securityTips = [
  {
    icon: IconShieldLock,
    label: 'Never reuse this password on other sites or share it with anyone.',
  },
  {
    icon: IconUserOff,
    label: 'Avoid personal details such as your name, username or birth date.',
  },
  {
    icon: IconRefresh,
    label: 'Update your password regularly to keep your account secure.',
  },
]

// Score a password 0–5 on length and character variety, then map it to a
// 4-segment meter with a label and theme color token.
const getStrength = (password: string) => {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { segments: 1, label: 'Weak', color: 'bg-error' }
  if (score === 2) return { segments: 2, label: 'Fair', color: 'bg-warning' }
  if (score === 3) return { segments: 3, label: 'Good', color: 'bg-info' }
  return { segments: 4, label: 'Strong', color: 'bg-success' }
}

const ChangePasswordPage = () => {
  const { user } = useUser()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { isSubmitting } = form.formState

  // Live values that drive the checklist and strength meter. useWatch (not
  // form.watch) so the component stays compatible with the React Compiler.
  const currentPassword = useWatch({
    control: form.control,
    name: 'currentPassword',
    defaultValue: '',
  })
  const newPassword = useWatch({
    control: form.control,
    name: 'newPassword',
    defaultValue: '',
  })
  const confirmPassword = useWatch({
    control: form.control,
    name: 'confirmPassword',
    defaultValue: '',
  })
  const strength = useMemo(() => getStrength(newPassword), [newPassword])

  const requirements = [
    { label: 'At least 6 characters', met: newPassword.length >= 6 },
    {
      label: 'Passwords match',
      met: confirmPassword.length > 0 && newPassword === confirmPassword,
    },
    {
      label: 'Different from current password',
      met: currentPassword.length > 0 && newPassword !== currentPassword,
    },
  ]

  const onSubmit = async (values: ChangePasswordValues) => {
    if (!user?.id) {
      toast.error('User session not found. Please sign in and try again.')
      return
    }

    try {
      await postFetcher(getApiUrl('/api/ApplicationUser/changepassword'), {
        userId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password changed successfully.')
      form.reset()
    } catch (err) {
      // postFetcher already extracts the server-provided message (e.g. an
      // "incorrect current password" 400), so surface it as-is.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to change password. Please try again.'
      )
    }
  }

  const eyeToggleClass =
    'absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors'

  return (
    <div className='grid grid-cols-12 gap-6'>
      {/* Form card */}
      <div className='xl:col-span-8 col-span-12'>
        <Card>
          <div className='flex items-center gap-3 mb-5'>
            <div className='h-11 w-11 shrink-0 rounded-md flex justify-center items-center bg-lightprimary text-primary'>
              <IconLock size={22} />
            </div>
            <div>
              <h5 className='card-title mb-0'>Change Password</h5>
              <p className='card-subtitle mb-0 mt-0.5'>
                Keep your account secure with a strong, unique password
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showCurrent ? 'text' : 'password'}
                          placeholder='Enter your current password'
                          className='pr-10'
                          autoComplete='current-password'
                          {...field}
                        />
                        <button
                          type='button'
                          tabIndex={-1}
                          className={eyeToggleClass}
                          onClick={() => setShowCurrent((prev) => !prev)}
                          aria-label={
                            showCurrent
                              ? 'Hide current password'
                              : 'Show current password'
                          }>
                          {showCurrent ? (
                            <IconEyeOff size={18} />
                          ) : (
                            <IconEye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showNew ? 'text' : 'password'}
                          placeholder='Enter a new password'
                          className='pr-10'
                          autoComplete='new-password'
                          {...field}
                        />
                        <button
                          type='button'
                          tabIndex={-1}
                          className={eyeToggleClass}
                          onClick={() => setShowNew((prev) => !prev)}
                          aria-label={
                            showNew ? 'Hide new password' : 'Show new password'
                          }>
                          {showNew ? (
                            <IconEyeOff size={18} />
                          ) : (
                            <IconEye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {newPassword.length > 0 && (
                      <div className='flex items-center gap-2 pt-1'>
                        <div className='flex flex-1 gap-1'>
                          {[1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                seg <= strength.segments
                                  ? strength.color
                                  : 'bg-lightgray dark:bg-darkmuted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className='text-xs text-muted whitespace-nowrap'>
                          {strength.label}
                        </span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder='Confirm your new password'
                          className='pr-10'
                          autoComplete='new-password'
                          {...field}
                        />
                        <button
                          type='button'
                          tabIndex={-1}
                          className={eyeToggleClass}
                          onClick={() => setShowConfirm((prev) => !prev)}
                          aria-label={
                            showConfirm
                              ? 'Hide confirm password'
                              : 'Show confirm password'
                          }>
                          {showConfirm ? (
                            <IconEyeOff size={18} />
                          ) : (
                            <IconEye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-3 pt-2'>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Save Password'}
                </Button>
                <Button
                  type='button'
                  variant='lighterror'
                  disabled={isSubmitting}
                  onClick={() => form.reset()}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>

      {/* Requirements & tips card */}
      <div className='xl:col-span-4 col-span-12'>
        <Card className='h-full'>
          <h6 className='text-base font-medium mb-4'>Password requirements</h6>
          <div className='flex flex-col gap-2.5'>
            {requirements.map((req) => (
              <div key={req.label} className='flex items-center gap-2.5'>
                {req.met ? (
                  <IconCircleCheck size={18} className='text-success shrink-0' />
                ) : (
                  <IconCircleX size={18} className='text-muted shrink-0' />
                )}
                <span
                  className={`text-sm ${req.met ? 'text-ld' : 'text-muted'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          <div className='border-t border-ld mt-5 pt-4'>
            <h6 className='text-base font-medium mb-3'>Security tips</h6>
            <div className='flex flex-col gap-3'>
              {securityTips.map((tip) => (
                <div key={tip.label} className='flex gap-3'>
                  <div className='h-8 w-8 shrink-0 rounded-md flex justify-center items-center bg-lightprimary text-primary'>
                    <tip.icon size={16} />
                  </div>
                  <p className='text-sm text-darklink mb-0'>{tip.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <ToastContainer />
    </div>
  )
}

export default ChangePasswordPage
