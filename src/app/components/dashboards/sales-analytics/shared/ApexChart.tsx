'use client'

// The design-system chart component used by every dashboard template:
// dynamic import so ApexCharts never renders on the server.
import dynamic from 'next/dynamic'

export const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })
export default ApexChart