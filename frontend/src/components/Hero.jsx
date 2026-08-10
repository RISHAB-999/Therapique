import React, { useContext, useEffect, useState } from 'react'
import bg from '../assets/bg.png'
import bgHero from '../assets/bg-hero.png'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
// import required modules
import { Autoplay } from 'swiper/modules';
import Item from './Item'
import { ShopContext } from '../context/ShopContext'

const Hero = () => {
    const [popularBooks, setpopularBooks] = useState([])
    const { books } = useContext(ShopContext)
    // Getting popular books data
    useEffect(() => {
        const data = books.filter((item) => item.popular)
        setpopularBooks(data.length > 0 ? data.slice(0, 6) : books.slice(0, 6))
    }, [books])

    return (
        <section className='flex gap-6 h-[400px] sm:h-[500px] md:h-[634px] mt-8 md:mt-16'>
            <div className="flex-[5] bg-cover bg-center bg-no-repeat rounded-3xl" style={{ backgroundImage: `url(${bg})` }}>
                {/* LEFT SIDE */}
                <div className='flex flex-col h-full justify-center p-6 sm:p-8 space-y-1 max-w-[90%] sm:max-w-[80%] md:max-w-none'>
                    <h3 className='text-sm sm:text-lg md:text-2xl text-purple-400 font-medium'>Explore Books You'll Love</h3>
                    <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold max-w-[699px] !font-[800] leading-none'>Find Your Next Book</h1>
                    <h2 className='capitalize text-lg sm:text-2xl md:text-3xl tracking-wider'>Up to 40% Off This Week</h2>
                    <p className='max-w-[500px] font-therapique font-medium text-gray leading-relaxed text-xs sm:text-sm md:text-base line-clamp-3 md:line-clamp-none'>Discover the healing power of reading with our curated selection
                        of therapy books. Whether you're navigating anxiety, building emotional resilience, or exploring mindfulness, each title is chosen to support
                        your personal growth. With secure checkout, fast delivery, and prices that make self-care accessible, your next breakthrough is just a page
                        away.
                    </p>
                    {/* Button */}
                    <div className='flex mt-3 md:mt-4'>
                        <Link to={'/Shop'} className='bg-white text-xs font-medium pl-6 rounded-full flexCenter gap-x-6 group shadow-md'>Check our latest Stock
                            <FaArrowRight className='bg-purple-400 text-white rounded-full h-10 w-10 md:h-11 md:w-11 p-3 m-[3px] border
                             border-white group-hover:bg-primary group-hover:text-black transition-all duration-500'/>
                        </Link>
                    </div>
                </div>
            </div>
            {/* RIGHT SIDE */}
            <div className='hidden lg:block flex-[2] bg-primary rounded-3xl bg-center bg-cover bg-no-repeat' style={{ backgroundImage: `url(${bgHero})` }}>
                <div className='max-w-sm pt-28'>
                    {/* CONTAINER */}
                    {
                        <Swiper
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            breakpoints={{
                                355: {
                                    slidesPerView: 1,
                                    spaceBetween: 10,
                                }
                            }}
                            modules={[Autoplay]}
                            className="min-h-[399px] max-w-64">
                            {
                                popularBooks.map((book) => (
                                    <SwiperSlide key={book._id}>
                                        <Item book={book} fromHero={true} />
                                    </SwiperSlide>
                                ))
                            }
                        </Swiper>
                    }
                </div>
            </div>
        </section>
    )
}

export default Hero