'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'

const productsCardData = [
  {
    title: 'Boat Headphone',
    link: '/',
    photo: '/images/products/s2.jpg',
    salesPrice: 375,
    price: 285,
    rating: 4,
  },
  {
    title: 'MacBook Air Pro',
    link: '/',
    photo: '/images/products/s5.jpg',
    salesPrice: 650,
    price: 900,
    rating: 5,
  },
  {
    title: 'Red Valvet Dress',
    link: '/',
    photo: '/images/products/s8.jpg',
    salesPrice: 150,
    price: 200,
    rating: 3,
  },
  {
    title: 'Cute Soft Teddybear',
    link: '/',
    photo: '/images/products/s11.jpg',
    salesPrice: 285,
    price: 345,
    rating: 2,
  },
]

const ProductsCards = () => {
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(
          <Icon
            key={i}
            icon='mdi:star'
            className='text-yellow-500'
            width={18}
            height={18}
          />
        )
      } else {
        stars.push(
          <Icon
            key={i}
            icon='mdi:star-outline'
            className='text-gray-400'
            width={18}
            height={18}
          />
        )
      }
    }
    return stars
  }

  return (
    <>
      <div className='grid grid-cols-12 gap-6'>
        {productsCardData.map((item, i) => (
          <div className='lg:col-span-3 md:col-span-6 col-span-12' key={i}>
            <Link href={item.link} className='group'>
              <Card className='p-0 overflow-hidden '>
                <div className='relative'>
                  <Image
                    src={item.photo}
                    alt='materialm'
                    width='1280'
                    height='1280'
                  />
                </div>
                <div className='p-6 relative'>
                  <button className='rounded-full z-1 absolute right-4 -top-6 bg-primary text-white flex justify-center items-center p-2 '>
                    <Icon
                      icon='solar:bag-5-linear'
                      height={24}
                      width={24}
                      className='w-6 h-6'
                    />
                  </button>
                  <h3 className='text-lg mb-1'>{item.title}</h3>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <p className='text-inherit'>${item.price}</p>
                      <span className='text-sm font-medium line-through text-forest-black/60 dark:text-white/60'>
                        ${item.salesPrice}
                      </span>
                    </div>
                    <div className='flex gap-1'>{renderStars(item.rating)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default ProductsCards
