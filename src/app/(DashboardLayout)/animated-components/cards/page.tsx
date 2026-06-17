import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { ActionTracking } from '@/app/components/animatedComponentDemo/cards/action-tracking/ActionTracking'
import { AlertCards } from '@/app/components/animatedComponentDemo/cards/alert-cards/AlertCards'
import { AnimatedBorderCard } from '@/app/components/animatedComponentDemo/cards/animated-border-card/AnimatedBorderCard'
import { ExpandableCard } from '@/app/components/animatedComponentDemo/cards/expandable-card/ExpandableCard'
import { FlipCard } from '@/app/components/animatedComponentDemo/cards/filp-card/FlipCard'
import { InsightCard } from '@/app/components/animatedComponentDemo/cards/insight-card/InsightCard'
import { MessageCard } from '@/app/components/animatedComponentDemo/cards/message-card/MessageCard'

export const metadata: Metadata = {
  title: 'Animated Cards',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Cards',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Cards' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        <div>
          <InsightCard />
        </div>
        <div>
          <MessageCard />
        </div>
        <div>
          <AnimatedBorderCard />
        </div>
        <div>
          <ActionTracking />
        </div>
        <div>
          <AlertCards />
        </div>
        <div>
          <ExpandableCard />
        </div>
        <div>
          <FlipCard />
        </div>
      </div>
    </>
  )
}

export default page
