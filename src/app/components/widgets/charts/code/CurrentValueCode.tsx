import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import OutlineCard from '../../../shared/OutlineCard'
import IncomeChart from './IncomeChartCode'
import ExpnaceChart from './ExpenseChartCode'
import CurrentYear from './CurrentYearCode'

const CurrentValue = () => {
  return (
    <>
      <Card>
        <div className='flex justify-end items-end gap-3'>
          <Button>Buy</Button>
          <Button color={'outline'}>Sell</Button>
        </div>
        <div className='grid grid-cols-12 gap-6 mt-6'>
          <div className='lg:col-span-4 col-span-12'>
            <OutlineCard className='shadow-none'>
              <IncomeChart />
            </OutlineCard>
          </div>
          <div className='lg:col-span-4 col-span-12'>
            <OutlineCard className='shadow-none'>
              <ExpnaceChart />
            </OutlineCard>
          </div>
          <div className='lg:col-span-4 col-span-12'>
            <OutlineCard className='shadow-none'>
              <CurrentYear />
            </OutlineCard>
          </div>
        </div>
      </Card>
    </>
  )
}

export default CurrentValue
