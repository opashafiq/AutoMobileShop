'use client'

import React, { useContext } from 'react'
import SidebarData from './Sidebaritems'
import NavItems from './NavItems'
import NavCollapse from './NavCollapse'
import SimpleBar from 'simplebar-react'
import FullLogo from '../../shared/logo/FullLogo'
import { Icon } from '@iconify/react'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar'

const SidebarLayout = () => {
  const { isCollapse, activeDir } = useContext(CustomizerContext)
  return (
    <>
      <div className='flex'>
        <Sidebar
          className='fixed menu-sidebar bg-white dark:bg-dark z-[3] border-ld flex flex-col h-screen
          '
          side={activeDir === 'rtl' ? 'right' : 'left'}>
          <SidebarHeader className='p-0'>
            <div
              className={`${
                isCollapse === 'full-sidebar' ? 'px-6' : 'px-5'
              } flex items-center brand-logo overflow-hidden`}>
              <FullLogo />
            </div>
          </SidebarHeader>

          <SimpleBar className='flex-1 min-h-0'>
            <SidebarContent
              className={`${isCollapse === 'full-sidebar' ? 'px-6' : 'px-4'}`}>
              <SidebarGroup className='sidebar-nav p-0'>
                {SidebarData.map((item, index) => (
                  <React.Fragment key={index}>
                    <SidebarGroupLabel className='px-0 caption'>
                      <h5 className='text-link font-bold text-xs dark:text-darklink '>
                        <span className='hide-menu leading-21'>
                          {item.heading?.toUpperCase()}
                        </span>
                        <Icon
                          icon='tabler:dots'
                          className='text-ld   leading-6 dark:text-opacity-60 hide-icon mx-2.5 md:block hidden'
                          height={18}
                        />
                      </h5>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className='gap-0.5'>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            {child.children ? (
                              <div className='collpase-items'>
                                <NavCollapse item={child} />
                              </div>
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </React.Fragment>
                ))}
              </SidebarGroup>
            </SidebarContent>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  )
}

export default SidebarLayout
