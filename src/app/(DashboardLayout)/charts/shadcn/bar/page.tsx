// import Intro from '@/app/(site)/ui-blocks/shared/Intro'
import ChartBarActive from '@/app/components/charts/shadcn/bar/Active'
import ChartBarLabelCustom from '@/app/components/charts/shadcn/bar/CustomLabel'
import ChartBarDefault from '@/app/components/charts/shadcn/bar/Default'
import ChartBarHorizontal from '@/app/components/charts/shadcn/bar/Horizontal'
import ChartBarInteractive from '@/app/components/charts/shadcn/bar/Interactive'
import ChartBarLabel from '@/app/components/charts/shadcn/bar/Label'
import ChartBarMixed from '@/app/components/charts/shadcn/bar/Mixed'
import ChartBarMultiple from '@/app/components/charts/shadcn/bar/Multiple'
import ChartBarNegative from '@/app/components/charts/shadcn/bar/Negative'
import ChartBarStacked from '@/app/components/charts/shadcn/bar/StackedLegend'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bar Chart Component for Dashboards Built with Shadcn UI',
  description: 'Build interactive bar charts and column graphs with Shadcn UI components built with Tailwind React for dashboard statistical display.',
}

const intro = {
  heading: 'Bar chart',
  desc: 'A Bar Chart is a data visualization component used to represent categorical data with rectangular bars, emphasizing comparisons between discrete groups or values by the length or height of the bars.',
}

const page = () => {
  return (
    <>
      <div className='grid grid-cols-12 gap-5 sm:gap-7'>
        {/* intro */}
        {/* <div className='col-span-12'>
          <Intro detail={intro} />
        </div> */}
        {/* Default */}
        <div className='col-span-12'>
          <ChartBarDefault />
        </div>
        {/* Horizontal */}
        <div className='col-span-12'>
          <ChartBarHorizontal />
        </div>
        {/* Multiple */}
        <div className='col-span-12'>
          <ChartBarMultiple />
        </div>
        {/* Stacked */}
        <div className='col-span-12'>
          <ChartBarStacked />
        </div>
        {/* Label */}
        <div className='col-span-12'>
          <ChartBarLabel />
        </div>
        {/* Custom Label */}
        <div className='col-span-12'>
          <ChartBarLabelCustom />
        </div>
        {/* Mixed */}
        <div className='col-span-12'>
          <ChartBarMixed />
        </div>
        {/* Active */}
        <div className='col-span-12'>
          <ChartBarActive />
        </div>
        {/* Negative */}
        <div className='col-span-12'>
          <ChartBarNegative />
        </div>
        {/* Interactive */}
        <div className='col-span-12'>
          <ChartBarInteractive />
        </div>
      </div>
    </>
  )
}

export default page
