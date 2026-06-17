'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'

const SettingsCard = () => {
  const [switch1, setSwitch1] = useState(false)
  return (
    <>
      <Card className='lg:max-w-2/4 mx-auto flex flex-col gap-2'>
        <h3 className='font-semibold text-lg text-inherit'>Settings</h3>
        <div className='flex  gap-3 mt-3 border-b border-ld pb-4'>
          <div>
            <div className='h-12 w-12 rounded-md bg-primary flex justify-center items-center text-white'>
              <Icon icon='solar:volume-loud-outline' height={20} />
            </div>
          </div>
          <div className='w-full'>
            <div className='flex justify-between items-center pb-2'>
              <p className='text-base text-inherit'>Sound</p>
              <p className='text-sm text-darklink'>45%</p>
            </div>
            <Progress variant='primary' value={45} className='w-full' />
          </div>
        </div>
        <div className='flex  gap-3 mt-2 border-b border-ld items-center pb-4'>
          <div>
            <div className='h-12 w-12 rounded-md bg-secondary flex justify-center items-center text-white'>
              <Icon icon='tabler:message-2' height={20} />
            </div>
          </div>
          <div className='w-full'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-base text-inherit'>Chat</p>
                <p>Turn on chat during call%</p>
              </div>
              <Switch checked={switch1} onCheckedChange={setSwitch1} />
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-3 mt-2'>
          <Button variant={'lighterror'}>Cancel</Button>
          <Button>Save</Button>
        </div>
      </Card>
    </>
  )
}

export default SettingsCard
