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
    setpopularBooks(data.slice(0, 11))
  }, [books])

  return (
    <section className='max-padd-container py-16'>
      <Title
        title1={"Popular"}
        title2={"Books"}
        title1Styles={"pb-10"}
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
        className="min-h-[333px] ">
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