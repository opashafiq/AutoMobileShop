import React from 'react'
import BreadcrumbComp from '../layout/shared/breadcrumb/BreadcrumbComp'
import type { Metadata } from 'next'
import ChangePasswordPage from '@/app/components/change-password'

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Change the password of your account',
}

const BCrumb = [
  {
    to: '/',
    title: 'Dashboard',
  },
  {
    title: 'Change Password',
  },
]

function ChangePassword() {
  return (
    <>
      <BreadcrumbComp title='Change Password' items={BCrumb} />
      <ChangePasswordPage />
    </>
  )
}

export default ChangePassword
