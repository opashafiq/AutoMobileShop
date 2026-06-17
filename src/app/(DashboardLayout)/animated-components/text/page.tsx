import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { AnimatedTextBackground } from '@/app/components/animatedComponentDemo/text-animation/animated-text-background/AnimatedTextBackground'
import { ShinyText } from '@/app/components/animatedComponentDemo/text-animation/shiny-text/ShinyText'
import { TextRoller } from '@/app/components/animatedComponentDemo/text-animation/text-roller/TextRoller'
import { TextShimmer } from '@/app/components/animatedComponentDemo/text-animation/text-shimmer/TextShimmer'
import { TypingAnimation } from '@/app/components/animatedComponentDemo/text-animation/typing-animation/TypingAnimation'

export const metadata: Metadata = {
  title: 'Animated Text',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Text',
  },
]

const page = () => {
  return (
    <>
    <BreadcrumbComp title='Animated Text' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        <div>
          <ShinyText />
        </div>
        <div>
          <AnimatedTextBackground />
        </div>
        <div>
          <TypingAnimation />
        </div>
        <div>
          <TextRoller />
        </div>
        <div>
          <TextShimmer />
        </div>
      </div>
    </>
  )
}

export default page
