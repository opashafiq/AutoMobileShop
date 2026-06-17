import { Card } from '@/components/ui/card'
import { Progress, ProgressProps } from '@/components/ui/progress'

const PollResultCard = () => {
  const pollResults = [
    { id: 'a', label: 'A 30 Minutes', value: 55, color: 'primary' },
    { id: 'b', label: 'B More than 30 minutes', value: 20, color: 'secondary' },
    { id: 'c', label: 'C 1 Hour', value: 15, color: 'success' },
    { id: 'd', label: 'D More than 1 hour', value: 10, color: 'warning' },
  ]
  return (
    <Card className='p-7 flex flex-col gap-6 lg:max-w-md mx-auto'>
      <div>
        <h3 className='font-semibold text-lg'>Result of Poll</h3>
        <p className='text-sm text-muted-foreground'>
          Here is the result for the latest poll
        </p>
      </div>
      <div>
        <p className='text-base'>What is your daily mobile app usage like?</p>
      </div>
      <div className='flex flex-col gap-5'>
        {pollResults.map((option) => (
          <div key={option.id} className='flex flex-col gap-1'>
            <div className='flex justify-between text-sm font-medium'>
              <span>{option.label}</span>
              <span>{option.value}%</span>
            </div>
            <Progress
              variant={option?.color as ProgressProps['variant']}
              value={option.value}
              className='h-2 bg-muted'>
              <div
                className={`h-2 rounded-full ${option.color}`}
                style={{ width: `${option.value}%` }}
              />
            </Progress>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PollResultCard
