'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const EarnedChart = () => {
  const ChartData: any = {
    series: [
      {
        name: '',
        data: [0, 3, 1, 2, 8, 1, 5, 1],
      },
    ],
    chart: {
      type: 'area',
      fontFamily: `inherit`,
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    colors: ['var(--color-primary)'],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      color: ['var(--color-primary)'],
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 0.2,
        opacityTo: 0.8,
        stops: [100],
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  }
  return (
    <>
      <Card className='lg:max-w-2/4 mx-auto p-0 flex flex-col gap-2 overflow-hidden'>
        <div className='flex justify-between p-6 items-end'>
          <div>
            <h5 className='text-lg font-semibold text-dark dark:text-white'>
              2,545
            </h5>
            <p className='text-sm'>Earned</p>
          </div>
          <span className='text-success text-sm'>+1.20%</span>
        </div>

        <Chart
          options={ChartData}
          series={ChartData.series}
          type='area'
          height='90px'
          width='100%'
        />
      </Card>
    </>
  )
}

export default EarnedChart
