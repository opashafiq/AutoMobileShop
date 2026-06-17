// import Intro from '@/app/(site)/ui-blocks/shared/Intro'
import ChartAreaAxes from '@/app/components/charts/shadcn/area/Axes'
import ChartAreaDefault from '@/app/components/charts/shadcn/area/Default'
import ChartAreaGradient from '@/app/components/charts/shadcn/area/Gradient'
import ChartAreaIcons from '@/app/components/charts/shadcn/area/Icons'
import ChartAreaInteractive from '@/app/components/charts/shadcn/area/Interactive'
import ChartAreaLegend from '@/app/components/charts/shadcn/area/Legend'
import ChartAreaLinear from '@/app/components/charts/shadcn/area/Linear'
import ChartAreaStacked from '@/app/components/charts/shadcn/area/Stacked'
import ChartAreaStackedExpand from '@/app/components/charts/shadcn/area/StackedExpanded'
import ChartAreaStep from '@/app/components/charts/shadcn/area/Step'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Area Chart Component for Dashboards Built with Shadcn UI',
  description: 'Create responsive area charts and filled line graphs with Shadcn UI components built with Tailwind React for dashboard data visualization.',
}

const intro = {
  heading: 'Area chart',
  desc: 'An Area Chart is a data visualization component used to display quantitative data trends over time, emphasizing the magnitude of change with filled areas beneath the lines.',
}

const page = () => {
  return (
    <>
      <div className='grid grid-cols-12 gap-5 sm:gap-7'>
        {/* intro */}
        {/* <div className='col-span-12'>
          <Intro detail={intro} />
        </div> */}
        {/* default */}
        <div className='col-span-12'>
          <ChartAreaDefault />
        </div>
        {/* Linear */}
        <div className='col-span-12'>
          <ChartAreaLinear />
        </div>
        {/* Step */}
        <div className='col-span-12'>
          <ChartAreaStep />
        </div>
        {/* Legend */}
        <div className='col-span-12'>
          <ChartAreaLegend />
        </div>
        {/* Stacked */}
        <div className='col-span-12'>
          <ChartAreaStacked />
        </div>
        {/* Stacked expanded */}
        <div className='col-span-12'>
          <ChartAreaStackedExpand />
        </div>
        {/* Icons */}
        <div className='col-span-12'>
          <ChartAreaIcons />
        </div>
        {/* Gradient */}
        <div className='col-span-12'>
          <ChartAreaGradient />
        </div>
        {/* Axes */}
        <div className='col-span-12'>
          <ChartAreaAxes />
        </div>
        {/* Interactive */}
        <div className='col-span-12'>
          <ChartAreaInteractive />
        </div>
      </div>
    </>
  )
}

export default page
