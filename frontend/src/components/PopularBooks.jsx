import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Autoplay } from 'swiper/modules'
import Item from './Item'
import { FadeUp } from './ScrollReveal'

const PopularBooks = () => {
  const { books } = useContext(ShopContext)

  const popularBooks = useMemo(() => {
    const data = books.filter((item) => item.popular)
    return data.length > 0 ? data.slice(0, 11) : books.slice(0, 10)
  }, [books])

  return (
    <section className='py-10 sm:py-14'>
      <Title
        title1={"Popular"}
        title2={"Books"}
        para={"Check out our newest books arriving weekly with fresh ideas, exciting plots and vibrant voices."}
      />
      {/* CONTAINER */}
      <FadeUp delay={0.15} duration={0.8} className="mt-2 min-h-[320px] sm:min-h-[350px]">
        <Swiper
          speed={850}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 14,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            900: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 24,
            }
          }}
          modules={[Autoplay]}
          className="w-full pt-8 pb-10 px-1 sm:px-2"
        >
          {popularBooks.map((book) => (
            <SwiperSlide key={book._id} className="pt-6 pb-4 px-1 flex items-stretch h-auto">
              <Item book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      </FadeUp>
    </section>
  )
}

export default React.memo(PopularBooks)