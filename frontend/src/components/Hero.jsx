import React, { useContext, useMemo } from 'react'
import { motion } from 'motion/react'
import bg from '../assets/bg.png'
import bgHero from '../assets/bg-hero.png'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Autoplay } from 'swiper/modules'
import Item from './Item'
import { ShopContext } from '../context/ShopContext'

// Highly optimized typewriter text reveal (GPU accelerated, word-level preserving proper spaces)
const TypewriterText = ({ text, className = '', delay = 0, speed = 0.035, as: Component = 'span' }) => {
    const words = useMemo(() => text.split(' '), [text])

    const container = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: speed,
                delayChildren: delay,
            },
        },
    }), [delay, speed])

    const child = {
        hidden: { opacity: 0, y: 3 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.18, ease: 'easeOut' },
        },
    }

    return (
        <Component className={className}>
            <motion.span
                initial="hidden"
                animate="visible"
                variants={container}
                className="inline"
            >
                {words.map((word, index) => (
                    <React.Fragment key={index}>
                        <motion.span variants={child} className="inline-block transform-gpu">
                            {word}
                        </motion.span>
                        {index < words.length - 1 && ' '}
                    </React.Fragment>
                ))}
            </motion.span>
        </Component>
    )
}

const Hero = () => {
    const { books } = useContext(ShopContext)

    // Memoize popular books to prevent re-renders on route navigation
    const popularBooks = useMemo(() => {
        const data = books.filter((item) => item.popular)
        return data.length > 0 ? data.slice(0, 6) : books.slice(0, 6)
    }, [books])

    return (
        <section className='flex gap-6 h-[400px] sm:h-[500px] md:h-[634px] mt-8 md:mt-16'>

            {/* ================= LEFT SIDE: Main Hero Card ================= */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex-[5] bg-cover bg-center bg-no-repeat rounded-3xl relative overflow-hidden shadow-sm will-change-transform"
                style={{ backgroundImage: `url(${bg})` }}
            >
                {/* Content Container (Left Side of Card) */}
                <div className='flex flex-col h-full justify-center p-6 sm:p-8 space-y-1.5 max-w-[90%] sm:max-w-[80%] md:max-w-[580px] relative z-20'>

                    {/* 1. Subtitle */}
                    <h3 className='text-sm sm:text-lg md:text-2xl text-purple-600 font-medium'>
                        <TypewriterText text="Explore Books You'll Love" delay={0.3} speed={0.03} />
                    </h3>

                    {/* 2. Main Title using exact font-therapique (Fraunces serif) */}
                    <h1 className="font-therapique text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.08] font-bold tracking-tight text-gray-900 max-w-[550px]">
                        <span className="block">
                            <TypewriterText text="Find Your Next" delay={0.6} speed={0.035} />
                        </span>
                        <span className="block">
                            <TypewriterText text="Book" delay={0.9} speed={0.045} />
                        </span>
                    </h1>

                    {/* 3. Promo Tagline */}
                    <h2 className='font-therapique capitalize text-lg sm:text-2xl md:text-3xl tracking-tight text-gray-800 font-semibold pt-1'>
                        <TypewriterText text="Up To 40% Off This Week" delay={1.1} speed={0.03} />
                    </h2>

                    {/* 4. Description Paragraph */}
                    <p className='font-sans max-w-[480px] font-normal text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base line-clamp-3 md:line-clamp-none pt-1'>
                        <TypewriterText
                            text="Discover the healing power of reading with our curated selection of therapy books. Whether you're navigating anxiety, building emotional resilience, or exploring mindfulness, each title is chosen to support your personal growth. With secure checkout, fast delivery, and prices that make self-care accessible, your next breakthrough is just a page away."
                            delay={1.35}
                            speed={0.025}
                        />
                    </p>

                    {/* 5. CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 240,
                            damping: 18,
                            delay: 1.8
                        }}
                        className='flex mt-3 md:mt-4'
                    >
                        <Link
                            to={'/Shop'}
                            className='bg-white text-xs font-medium pl-6 rounded-full flexCenter gap-x-6 group shadow-md hover:shadow-lg transition-all duration-300'
                        >
                            Check our latest Stock
                            <FaArrowRight className='bg-purple-600 text-white rounded-full h-10 w-10 md:h-11 md:w-11 p-3 m-[3px] border border-white group-hover:bg-black group-hover:text-white transition-all duration-500' />
                        </Link>
                    </motion.div>

                </div>
            </motion.div>

            {/* ================= RIGHT SIDE: Featured Book Card ================= */}
            <motion.div
                initial={{ opacity: 0, scale: 0.93, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className='hidden lg:flex flex-[2] bg-cover bg-center bg-no-repeat rounded-3xl items-center justify-center p-6 relative overflow-hidden will-change-transform shadow-sm'
                style={{ backgroundImage: `url(${bgHero})` }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 110,
                        damping: 18,
                        delay: 0.5
                    }}
                    className='w-full max-w-[270px] mx-auto flex items-center justify-center relative py-6'
                >
                    <Swiper
                        speed={900}
                        slidesPerView={1}
                        spaceBetween={120}
                        loop={popularBooks.length > 1}
                        autoplay={{
                            delay: 4500,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                        className="w-full !overflow-visible"
                    >
                        {popularBooks.map((book) => (
                            <SwiperSlide key={book._id} className="!overflow-visible flex items-center justify-center py-4">
                                <Item book={book} fromHero={true} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>
            </motion.div>

        </section>
    )
}

export default React.memo(Hero)