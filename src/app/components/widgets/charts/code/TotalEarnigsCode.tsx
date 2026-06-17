'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const TotalEarning = () => {
  const ChartData: any = {
    series: [
      {
        name: 'projects',
        data: [4, 10, 9, 7, 9, 10, 11, 8, 10, 12, 9],
      },
    ],
    chart: {
      type: 'bar',
      height: 55,
      fontFamily: `inherit`,
      sparkline: {
        enabled: true,
      },
    },
    colors: ['var(--color-secondary)'],

    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        distributed: true,
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2.5,
      colors: ['rgba(0,0,0,0.01)'],
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    axisBorder: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false,
      },
    },
  }
  return (
    <>
      <Card className='lg:max-w-1/3 mx-auto overflow-hidden'>
        <div className='flex justify-between items-end'>
          <div>
            <p className='text-sm'>Total Earning</p>
            <h5 className='text-lg font-semibold text-dark dark:text-white'>
              $78,298
            </h5>
          </div>
        </div>
        <Chart
          options={ChartData}
          series={ChartData.series}
          type='bar'
          height='55px'
          width='100%'
          className='mt-8'
        />
      </Card>
    </>
  )
}

export default TotalEarning
