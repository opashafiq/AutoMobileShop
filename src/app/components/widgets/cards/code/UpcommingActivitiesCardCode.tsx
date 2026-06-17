import Image from 'next/image'
import { Card } from '@/components/ui/card'

const UpcommingActCard = () => {
  const RecentTransData = [
    {
      img: '/images/svgs/icon-map-pin.svg',
      title: 'Trip to singapore',
      subtitle: 'working on',
      rank: '5 mins',
      bgcolor: 'primary',
    },
    {
      img: '/images/svgs/icon-database.svg',
      title: 'Archived Data',
      subtitle: 'working on',
      rank: '10 mins',
      bgcolor: 'primary',
    },
    {
      img: '/images/svgs/icon-phone.svg',
      title: 'Meeting with client',
      subtitle: 'pending',
      rank: '10 mins',
      bgcolor: 'warning',
    },
    {
      img: '/images/svgs/icon-screen-share.svg',
      title: 'Screening Task Team',
      subtitle: 'working on',
      rank: '20 mins',
      bgcolor: 'error',
    },
    {
      img: '/images/svgs/icon-mail.svg',
      title: 'Send envelope to John',
      subtitle: 'Done',
      rank: '20 mins',
      bgcolor: 'success',
    },
  ]
  return (
    <>
      <Card className='lg:max-w-2/4 mx-auto pb-7'>
        <div>
          <h3 className='text-lg font-semibold text-dark dark:text-white'>
            Upcoming Activity
          </h3>
          <p className='text-sm'>In New year</p>
        </div>
        <div className='mt-7 flex flex-col gap-6'>
          {RecentTransData.map((item, index) => (
            <div className='flex gap-3.5 items-center' key={index}>
              <div
                className={`h-11 w-11 rounded-md flex justify-center items-center bg-light${item.bgcolor} dark:bg-dark${item.bgcolor}`}>
                <Image
                  src={item.img}
                  alt='icon'
                  className='h-6 w-6'
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h4 className='text-base'>{item.title}</h4>
                <p className='text-sm text-darklink'>{item.subtitle}</p>
              </div>
              <div className={`ms-auto font-medium text-ld`}>{item.rank}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export default UpcommingActCard
