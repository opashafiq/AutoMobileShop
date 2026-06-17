import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { HoverLift } from '@/app/components/animatedComponentDemo/buttons/hover-lift/HoverLift'
import { TapPop } from '@/app/components/animatedComponentDemo/buttons/tap-pop/TapPop'
import { PlayfulWiggle } from '@/app/components/animatedComponentDemo/buttons/playful-wiggle/PlayfulWiggle'
import { HeartLike } from '@/app/components/animatedComponentDemo/buttons/heart-like/HeartLike'
import { StarFavourite } from '@/app/components/animatedComponentDemo/buttons/star-favourite/StarFavourite'
import { BellNotify } from '@/app/components/animatedComponentDemo/buttons/bell-notify/BellNotify'
import { Glitch } from '@/app/components/animatedComponentDemo/buttons/glitch/Glitch'
import { LiquidFill } from '@/app/components/animatedComponentDemo/buttons/liquid-fill/LiquidFill'
import { MatrixRain } from '@/app/components/animatedComponentDemo/buttons/matrix-rain/MatrixRain'
import { ShinyEffect } from '@/app/components/animatedComponentDemo/buttons/shiny-effect/ShinyEffect'

export const metadata: Metadata = {
  title: 'Animated Buttons',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Buttons',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Buttons' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        <div>
          <HoverLift />
        </div>
        <div>
          <TapPop />
        </div>
        <div>
          <PlayfulWiggle />
        </div>
        <div>
          <HeartLike />
        </div>
        <div>
          <StarFavourite />
        </div>
        <div>
          <BellNotify />
        </div>
        <div>
          <Glitch />
        </div>
        <div>
          <LiquidFill />
        </div>
        <div>
          <MatrixRain />
        </div>
        <div>
          <ShinyEffect />
        </div>
      </div>
    </>
  )
}

export default page
