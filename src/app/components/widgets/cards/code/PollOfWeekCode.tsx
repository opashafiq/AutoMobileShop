import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const PollofWeekCard = () => {
  return (
    <Card className='p-7 flex flex-col gap-6 lg:max-w-md mx-auto'>
      <div>
        <h3 className='font-semibold text-lg'>Poll of Week</h3>
        <p className='text-sm text-muted-foreground'>Here is the latest poll</p>
      </div>
      <div>
        <p className='text-base'>What is your daily mobile app usage like?</p>
      </div>
      <RadioGroup defaultValue='a' className='flex flex-col gap-3'>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='a' id='option-a' />
          <Label htmlFor='option-a'>30 Minutes</Label>
        </div>

        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='b' id='option-b' />
          <Label htmlFor='option-b'>More than 30 minutes</Label>
        </div>

        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='c' id='option-c' />
          <Label htmlFor='option-c'>1 Hour</Label>
        </div>

        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='d' id='option-d' />
          <Label htmlFor='option-d'>More than 1 hour</Label>
        </div>
      </RadioGroup>
      <Button>Submit</Button>
    </Card>
  )
}

export default PollofWeekCard
