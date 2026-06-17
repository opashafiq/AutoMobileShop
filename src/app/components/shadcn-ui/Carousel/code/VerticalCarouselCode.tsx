import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const VerticalCarouselCode = () => {
  const Images = [
    '/images/blog/blog-img1.jpg',
    '/images/blog/blog-img2.jpg',
    '/images/blog/blog-img3.jpg',
    '/images/blog/blog-img4.jpg',
    '/images/blog/blog-img5.jpg',
  ]

  return (
    <>
      <div className='flex flex-wrap items-center justify-center gap-3 my-16'>
        <Carousel
          opts={{
            align: 'start',
          }}
          orientation='vertical'
          className='w-full max-w-xs'>
          <CarouselContent className='-mt-2 mb-2 h-56'>
            {Images.map((img, index) => (
              <CarouselItem key={index}>
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

export default VerticalCarouselCode
