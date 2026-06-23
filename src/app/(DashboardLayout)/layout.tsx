"use client"
import React, { Activity, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/api/auth'
import Sidebar from './layout/vertical/sidebar/Sidebar'
import Header from './layout/vertical/header/Header'
import { Customizer } from './layout/shared/customizer/Customizer'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { activeLayout, isLayout } = useContext(CustomizerContext)
  const router = useRouter()

  useEffect(() => {
    // redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      const token = getToken()
      if (!token) {
        router.push('/auth/auth1/login')
      }
    }
  }, [router])
  return (
    <>
      <SidebarProvider>
        <div className='flex w-full min-h-screen'>
          <div className='page-wrapper flex w-full'>
            {/* Header/sidebar */}

            <Activity mode={activeLayout == 'vertical' ? 'visible' : 'hidden'}>
              <div className='xl:block hidden'>
                <Sidebar />
              </div>
            </Activity>

            <div className='body-wrapper w-full bg-white dark:bg-dark'>
              {/* Top Header  */}
              <Header
                layoutType={
                  activeLayout == 'horizontal' ? 'horizontal' : 'vertical'
                }
              />

              {/* Body Content  */}
              <div
                className={` ${
                  isLayout == 'full'
                    ? 'w-full py-[30px] md:px-[30px] px-5'
                    : 'container py-[30px]'
                } ${activeLayout == 'horizontal' ? 'xl:mt-3' : ''}
            `}>
                {children}
              </div>
              <Customizer />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  )
}
