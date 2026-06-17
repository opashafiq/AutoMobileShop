import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const tasks = [
  {
    title: 'Schedule meeting with',
    badge: { text: 'Today', color: 'bg-error' },
    avatars: [
      '/images/profile/user-1.jpg',
      '/images/profile/user-2.jpg',
      '/images/profile/user-3.jpg',
    ],
  },
  {
    title: 'Give Purchase report to',
    badge: { text: 'Yesterday', color: 'bg-primary' },
    avatars: ['/images/profile/user-4.jpg', '/images/profile/user-5.jpg'],
  },
  {
    title: 'Book flight for holiday',
    badge: { text: '1 week', color: 'bg-primary' },
    date: '26 Jun 2024',
  },
  {
    title: 'Forward all tasks',
    badge: { text: '2 weeks', color: 'bg-secondary' },
    date: '26 Jun 2024',
  },
  {
    title: 'Receive shipment',
    badge: { text: '2 weeks', color: 'bg-success' },
    avatars: [
      '/images/profile/user-6.jpg',
      '/images/profile/user-7.jpg',
      '/images/profile/user-8.jpg',
    ],
  },
]

const TaskLists = () => {
  return (
    <Card className='lg:max-w-md mx-auto pb-4 p-0'>
      <h3 className='text-lg font-semibold text-dark dark:text-white p-7'>
        Task List
      </h3>

      <div className='flex flex-col gap-6 px-7 pb-6'>
        {tasks.map((task, index) => (
          <div key={index} className='flex flex-col gap-2'>
            <div className='flex items-center gap-3'>
              <Checkbox id={`task-${index}`} />
              <label
                htmlFor={`task-${index}`}
                className='flex-1 text-sm font-medium cursor-pointer'>
                {task.title}
              </label>
              <Badge className={`${task.badge.color} text-white`}>
                {task.badge.text}
              </Badge>
            </div>

            <div className='pl-7 flex items-center gap-2'>
              {task.date && (
                <p className='text-xs text-muted-foreground'>{task.date}</p>
              )}
              {task.avatars && (
                <div className='flex -space-x-2'>
                  {task.avatars.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt='user'
                      width={30}
                      height={30}
                      className='rounded-full border border-white dark:border-gray-800'
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TaskLists
