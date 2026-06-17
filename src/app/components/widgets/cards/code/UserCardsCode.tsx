import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Usercards = [
  {
    title: 'Andrew Grant',
    subtitle: '3 mutual friends',
    avatar: '/images/profile/user-6.jpg',
    userGroup: [
      {
        icon: '/images/profile/user-6.jpg',
      },
      {
        icon: '/images/profile/user-2.jpg',
      },
      {
        icon: '/images/profile/user-3.jpg',
      },
    ],
  },
  {
    title: 'Leo Pratt',
    subtitle: '3 mutual friends',
    avatar: '/images/profile/user-2.jpg',
    userGroup: [
      {
        icon: '/images/profile/user-6.jpg',
      },
      {
        icon: '/images/profile/user-2.jpg',
      },
      {
        icon: '/images/profile/user-3.jpg',
      },
    ],
  },
  {
    title: 'Charles Nunez',
    subtitle: '3 mutual friends',
    avatar: '/images/profile/user-3.jpg',
    userGroup: [
      {
        icon: '/images/profile/user-6.jpg',
      },
      {
        icon: '/images/profile/user-2.jpg',
      },
      {
        icon: '/images/profile/user-3.jpg',
      },
    ],
  },
  {
    title: 'Lora Powers',
    subtitle: '3 mutual friends',
    avatar: '/images/profile/user-4.jpg',
    userGroup: [
      {
        icon: '/images/profile/user-6.jpg',
      },
      {
        icon: '/images/profile/user-2.jpg',
      },
      {
        icon: '/images/profile/user-3.jpg',
      },
    ],
  },
]

const UserCards = () => {
  return (
    <>
      <div className='grid grid-cols-12 gap-6'>
        {Usercards.map((item, i) => (
          <div className='lg:col-span-3 md:col-span-6 col-span-12' key={i}>
            <Card className='flex flex-col gap-2'>
              <Image
                src={item.avatar}
                alt='materialm'
                className='h-20 w-20 rounded-full mb-4'
                height={80}
                width={80}
              />
              <p className='text-lg text-inherit'>{item.title}</p>
              <div className='flex justify-start gap-2 items-center mb-4'>
                <div className='flex ms-2'>
                  {item.userGroup.map((user, index) => (
                    <div className='-ms-2  h-8 w-8' key={index}>
                      <Image
                        src={user.icon}
                        className='border-2 border-white dark:border-darkborder rounded-full h-8 w-8'
                        alt='icon'
                        height={32}
                        width={32}
                      />
                    </div>
                  ))}
                </div>
                <p className='text-sm text-daarklink'>{item.subtitle}</p>
              </div>
              <div className='flex flex-col gap-4'>
                <Button>Add Friend</Button>
                <Button variant={'secondary'}>Remove</Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}

export default UserCards
