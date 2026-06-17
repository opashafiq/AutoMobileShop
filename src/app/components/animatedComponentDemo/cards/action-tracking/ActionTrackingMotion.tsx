'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const RecentTransactionData = [
  {
    title: '09:30 ',
    subtitle: 'Payment received from John Doe of $385.90',
    textcolor: 'primary',
    boldtext: false,
    line: true,
    link: '',
    url: '',
  },
  {
    title: '10:00 ',
    subtitle: 'New sale recorded',
    textcolor: 'warning',
    boldtext: true,
    line: true,
    link: '#ML-3467',
    url: '',
  },
  {
    title: '12:00 ',
    subtitle: 'Payment was made of $64.95 to Michael',
    textcolor: 'warning',
    boldtext: false,
    line: true,
    link: '',
    url: '',
  },
  {
    title: '09:30 ',
    subtitle: 'New sale recorded',
    textcolor: 'secondary',
    boldtext: true,
    line: true,
    link: '#ML-3467',
    url: '',
  },
  {
    title: '09:30 ',
    subtitle: 'Project meeting',
    textcolor: 'error',
    boldtext: true,
    line: true,
    link: '',
    url: '',
  },
  {
    title: '12:00 ',
    subtitle: 'Payment received from John Doe of $385.90',
    textcolor: 'primary',
    boldtext: false,
    line: false,
    link: '',
    url: '',
  },
]

const ActionTrackingMotion = ({ replayAnimation = 0 }: any) => {
  return (
    <div className='mt-0 max-w-md' key={replayAnimation}>
      {RecentTransactionData.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.4,
          }}
          className='flex gap-x-3'>
          <div className='w-1/6 text-end'>
            <span className='text-ld font-medium text-sm opacity-80'>
              {item.title}
            </span>
          </div>

          <div className='relative'>
            <div className='relative z-10 w-7 h-5 flex justify-center items-center'>
              <div
                className={`h-3 w-3 rounded-full bg-${item.textcolor}`}></div>
            </div>
            {item.line ? (
              <div className='border-s border-ld h-full -mt-2 ms-3.5'></div>
            ) : (
              <div className='border-0'></div>
            )}
          </div>

          <div className='w-1/4 grow pt-0.5 pb-5'>
            {item.boldtext ? (
              <p className='text-ld font-semibold text-sm'>{item.subtitle}</p>
            ) : (
              <p className='text-ld font-medium text-sm'>{item.subtitle}</p>
            )}

            {item.link ? (
              <Link href={item.url} className='text-primary text-sm'>
                {item.link}
              </Link>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default ActionTrackingMotion
