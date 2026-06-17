'use client'

import dynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const WeeklyStats = () => {
  const ChartData: any = {
    series: [
      {
        name: 'Sales Per Week',
        color: 'var(--color-primary)',
        data: [5, 15, 10, 20],
      },
    ],
    chart: {
      id: 'sparkline3',
      type: 'area',
      height: 180,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
      fontFamily: 'inherit',
      foreColor: '#adb0bb',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 0.1,
        opacityTo: 0,
        stops: [20, 280],
      },
    },

    markers: {
      size: 0,
    },
    tooltip: {
      theme: 'dark',
      fixed: {
        enabled: true,
        position: 'right',
      },
      x: {
        show: false,
      },
    },
  }
  interface SalesItem {
    key: string
    title: string
    subtitle: string
    badgeColor: BadgeProps['variant']
    bgcolor: string
  }
  const SalesData: SalesItem[] = [
    {
      key: 'topSales',
      title: 'Top Sales',
      subtitle: 'Johnathan Doe',
      badgeColor: 'lightPrimary',
      bgcolor: 'bg-lightprimary text-primary',
    },
    {
      key: 'topSeller',
      title: 'Best Seller',
      subtitle: 'MaterialPro Admin',
      badgeColor: 'lightSuccess',
      bgcolor: 'bg-lightsuccess text-success',
    },
    {
      key: 'topCommented',
      title: ' Most Commented',
      subtitle: 'Ample Admin',
      badgeColor: 'lightError',
      bgcolor: 'bg-lighterror text-error',
    },
  ]
  return (
    <Card className='lg:max-w-2/4 mx-auto flex h-full flex-col justify-start gap-2'>
      <h5 className='text-lg font-semibold text-dark dark:text-white'>
        Weekly Stats
      </h5>
      <p className='text-sm'>Average sales</p>
      <div className='my-6'>
        <Chart
          options={ChartData}
          series={ChartData.series}
          type='area'
          height='170px'
          width={'100%'}
        />
      </div>

      {SalesData.map((item) => {
        return (
          <div
            key={item.key}
            className='flex items-center justify-between mb-7 last:mb-0'>
            <div className='flex items-center gap-3'>
              <div
                className={`${item.bgcolor} h-10 w-10 flex justify-center items-center rounded-md`}>
                <Icon icon='tabler:grid-dots' className=' text-xl' />
              </div>
              <div>
                <h6 className='text-base'>{item.title}</h6>
                <p className=' dark:text-darklink text-sm'>{item.subtitle}</p>
              </div>
            </div>
            <Badge
              variant={item.badgeColor}
              className='py-1.1 rounded-md text-sm border-0'>
              +68
            </Badge>
          </div>
        )
      })}
    </Card>
  )
}

export default WeeklyStats
