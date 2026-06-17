'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ViewsChart = () => {
  const ChartData: any = {
    series: [
      {
        name: '',
        data: [20, 15, 30, 25, 10, 18, 20, 15, 12, 10],
      },
    ],
    chart: {
      type: 'bar',
      height: 80,
      fontFamily: `inherit`,
      sparkline: {
        enabled: true,
      },
    },
    colors: [
      'var(--color-lightsecondary)',
      'var(--color-lightsecondary)',
      'var(--color-secondary)',
      'var(--color-lightsecondary)',
      'var(--color-lightsecondary)',
      'var(--color-lightsecondary)',
    ],

    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
        distributed: true,
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      theme: 'dark',
    },
  }
  return (
    <>
      <Card className='lg:max-w-2/4 mx-auto overflow-hidden'>
        <div className='flex justify-between items-end'>
          <div>
            <h5 className='text-lg font-semibold text-dark dark:text-white'>
              15,480
            </h5>
            <p className='text-sm'>Views</p>
          </div>
          <span className='text-error text-sm'>-4.150%</span>
        </div>

        <Chart
          options={ChartData}
          series={ChartData.series}
          type='bar'
          height='80px'
          width='100%'
          className='mt-2'
        />
      </Card>
    </>
  )
}

export default ViewsChart
