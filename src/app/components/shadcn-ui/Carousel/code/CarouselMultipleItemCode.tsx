import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const CarouselMultipleItemCode = () => {
  const Images = [
    '/images/blog/blog-img1.jpg',
    '/images/blog/blog-img2.jpg',
    '/images/blog/blog-img3.jpg',
    '/images/blog/blog-img4.jpg',
    '/images/blog/blog-img5.jpg',
  ]

  return (
    <>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Carousel opts={{ align: 'start' }} className='w-full max-w-xs'>
          <CarouselContent>
            {Images.map((img, index) => (
              <CarouselItem key={index} className='md:basis-1/2'>
                <div className='p-1'>
                  <Image
                    src={img}
                    alt='img'
                    width={400}
                    height={200}
                    className='rounded-md shadow-md dark:shadow-dark-md'
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  )
}

export default CarouselMultipleItemCode
