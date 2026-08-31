'use client'

// Functional "Change Password" card for the logged-in user. Posts to
// /api/ApplicationUser/changepassword using the session user's id (stored
// at login in NEXT_AUTH_USER_SESSION, exposed through UserContext).
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

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

// Shared markup for one password field with a show/hide toggle, matching
// the login page's eye-toggle pattern.
const PasswordField = ({
  label,
  placeholder,
  autoComplete,
  visible,
  onToggle,
  field,
}: {
  label: string
  placeholder: string
  autoComplete: string
  visible: boolean
  onToggle: () => void
  field: ControllerRenderProps<
    ChangePasswordValues,
    'currentPassword' | 'newPassword' | 'confirmPassword'
  >
}) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <FormControl>
      <div className='relative'>
        <Input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className='pr-10'
          autoComplete={autoComplete}
          {...field}
        />
        <button
          type='button'
          tabIndex={-1}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors'
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
    </FormControl>
    <FormMessage />
  </FormItem>
)

const ChangePassword = () => {
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

  return (
    <Card>
      <h5 className='card-title'>Change Password</h5>
      <p className='card-subtitle -mt-1'>
        To change your password please confirm here
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-3 mt-3'>
          <FormField
            control={form.control}
            name='currentPassword'
            render={({ field }) => (
              <PasswordField
                label='Current Password'
                placeholder='Enter current password'
                autoComplete='current-password'
                visible={showCurrent}
                onToggle={() => setShowCurrent((prev) => !prev)}
                field={field}
              />
            )}
          />

          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <PasswordField
                label='New Password'
                placeholder='Enter new password'
                autoComplete='new-password'
                visible={showNew}
                onToggle={() => setShowNew((prev) => !prev)}
                field={field}
              />
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <PasswordField
                label='Confirm Password'
                placeholder='Confirm new password'
                autoComplete='new-password'
                visible={showConfirm}
                onToggle={() => setShowConfirm((prev) => !prev)}
                field={field}
              />
            )}
          />

          <div className='flex justify-end gap-3 pt-3'>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save'}
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

      <ToastContainer />
    </Card>
  )
}

export default ChangePassword
