import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
// import required modules
import { Autoplay } from 'swiper/modules';
import Item from './Item'

const PopularBooks = () => {
  const [popularBooks, setpopularBooks] = useState([])
  const { books } = useContext(ShopContext)
  // Getting popular books data
  useEffect(() => {
    const data = books.filter((item) => item.popular)
    setpopularBooks(data.length > 0 ? data.slice(0, 11) : books.slice(0, 10))
  }, [books])

  return (
    <section className='py-16'>
      <Title
        title1={"Popular"}
        title2={"Books"}
        para={"Check out our newest books arriving weekly with fresh ideas, exciting plots and vibrant voices."} />
      {/* CONTAINER */}
      <Swiper
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          355: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          600: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          900: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 30,
          }
        }}
        modules={[Autoplay]}
        className="min-h-[380px] mt-4 py-6 px-1">
        {
          popularBooks.map((book) => (
            <SwiperSlide key={book._id}>
              <Item book={book} fromHero={true} />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </section>
  )
}

export default PopularBooks 